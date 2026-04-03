let recognition: any = null;
let synthesis: SpeechSynthesis | null = null;
let silenceTimer: NodeJS.Timeout | null = null;

export const initSpeechProcessing = () => {
  if (typeof window !== "undefined") {
    synthesis = window.speechSynthesis;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
    }
  }
};

export const speakText = (text: string, onEndCallback: () => void) => {
  if (!synthesis) return;
  synthesis.cancel(); // Stop any current speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.1;
  utterance.rate = 1.0;
  
  utterance.onend = () => {
    onEndCallback();
  };
  
  synthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (synthesis) {
    synthesis.cancel();
  }
};

export const startListening = (
  onTranscriptUpdate: (text: string, isFinal: boolean) => void,
  onSilenceDetected: (finalText: string) => void
) => {
  if (!recognition) return;

  let currentTranscript = "";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    currentTranscript += finalTranscript;
    const displayText = currentTranscript + interimTranscript;
    
    if (displayText.trim().length > 0) {
      onTranscriptUpdate(displayText, false);
      
      // Reset silence timer on every new word
      if (silenceTimer) clearTimeout(silenceTimer);
      
      silenceTimer = setTimeout(() => {
        // 2 seconds of silence
        recognition.stop();
        onSilenceDetected(displayText.trim());
      }, 2000);
    }
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
  };

  try {
    recognition.start();
  } catch(e) {}
};

export const stopListening = () => {
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
  if (silenceTimer) clearTimeout(silenceTimer);
};
