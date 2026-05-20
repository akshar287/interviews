let recognition: any = null;
let silenceTimer: NodeJS.Timeout | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const initSpeechProcessing = async () => {
  if (typeof window !== "undefined") {
    // Setup Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
    }
  }
};

export const speakText = async (text: string, onEndCallback: () => void) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEndCallback();
    return;
  }
  
  stopSpeaking(); // Stop any current speech
  
  try {
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = "en-US";
    
    // Attempt to select a better voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Female") || v.name.includes("Zira"));
    if (femaleVoice) {
      currentUtterance.voice = femaleVoice;
    }

    currentUtterance.onend = () => {
      currentUtterance = null;
      onEndCallback();
    };
    
    currentUtterance.onerror = (event) => {
      console.error("Text-to-speech error:", event);
      currentUtterance = null;
      onEndCallback(); 
    };

    window.speechSynthesis.speak(currentUtterance);
  } catch (error) {
    console.error("Text-to-speech setup error:", error);
    onEndCallback(); 
  }
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
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
