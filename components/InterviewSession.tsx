"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AvatarPulse from "./AvatarPulse";
import Waveform from "./Waveform";
import TranscriptBox from "./TranscriptBox";
import ProctorOverlay from "./ProctorOverlay";
import { InterviewState } from "@/lib/interviewStateMachine";
import { initSpeechProcessing, speakText, startListening, stopListening, stopSpeaking } from "@/lib/speechEngine";
import { generateNextQuestion, generateFinalEvaluation } from "@/lib/aiClient";
import { saveInterviewSession, deductTokens, TOKENS_PER_INTERVIEW } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

interface Props {
  role: string;
  type: string;
}

export default function InterviewSession({ role, type }: Props) {
  const router = useRouter();
  const [state, setState] = useState<InterviewState>("IDLE");
  const [transcript, setTranscript] = useState<{ speaker: "ai" | "user"; text: string }[]>([]);
  const [currentAIQuestion, setCurrentAIQuestion] = useState<string>("Hello! Are you ready to begin the interview?");
  const [scores, setScores] = useState<number[]>([]);
  const [liveText, setLiveText] = useState("");
  const [isLoadingVoice, setIsLoadingVoice] = useState(true);
  const liveTextRef = useRef("");

  const questionCountRef = useRef(0);
  const MAX_QUESTIONS = 6;

  useEffect(() => {
    // Lock screen on mount (Fullscreen API)
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log("Fullscreen denied", err));
    }

    initSpeechProcessing().then(() => {
      setIsLoadingVoice(false);
    }).catch(err => {
      console.error("Failed to init voice", err);
      setIsLoadingVoice(false);
    });

    return () => {
      stopSpeaking();
      stopListening();
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
    };
  }, []);

  const handleStart = () => {
    setState("AI_SPEAKING");
    speakQuestion(currentAIQuestion);
  };

  const speakQuestion = (text: string) => {
    setTranscript((prev) => [...prev, { speaker: "ai", text }]);
    speakText(text, () => {
      // Transition to LISTENING when speech synthesis ends
      setState("LISTENING");
      startLocalListening();
    });
  };

  const startLocalListening = () => {
    setLiveText("");
    liveTextRef.current = "";

    startListening(
      (text, isFinal) => {
        setLiveText(text);
        liveTextRef.current = text;
      },
      async (finalText) => {
        const textToSubmit = finalText || liveTextRef.current;
        if (!textToSubmit.trim()) {
          startLocalListening();
          return;
        }

        setState("PROCESSING");
        setTranscript((prev) => [...prev, { speaker: "user", text: textToSubmit }]);
        setLiveText("");
        await processUserAnswer(textToSubmit);
      }
    );
  };

  const handleManualSubmit = async () => {
    const textToSubmit = liveTextRef.current;
    if (!textToSubmit.trim()) return;

    stopListening();
    setState("PROCESSING");
    setTranscript((prev) => [...prev, { speaker: "user", text: textToSubmit }]);
    setLiveText("");
    await processUserAnswer(textToSubmit);
  };

  const processUserAnswer = async (answer: string) => {
    try {
      const pastQuestions = transcript.filter(t => t.speaker === 'ai').map(t => t.text);

      const payload = await generateNextQuestion(
        role,
        type,
        pastQuestions,
        answer
      );

      // Save score
      if (payload.evaluation?.score !== undefined) {
        setScores((prev) => [...prev, payload.evaluation.score]);
      }

      questionCountRef.current += 1;

      if (!payload.question || questionCountRef.current >= MAX_QUESTIONS) {
        endInterview();
      } else {
        setCurrentAIQuestion(payload.question);
        setState("AI_SPEAKING");
        speakQuestion(payload.question);
      }
    } catch (err) {
      console.error("Failed to process answer", err);
      // fallback recovery
      setState("LISTENING");
      startLocalListening();
    }
  };

  const endInterview = async () => {
    setState("ENDED");

    speakText("Thank you. The interview has concluded. We are now generating your report.", () => { });

    try {
      const finalEval = await generateFinalEvaluation(role, type, transcript);
      const user = auth.currentUser;

      if (user) {
        await saveInterviewSession(user.uid, {
          role,
          type,
          transcript,
          scores,
          finalScore: finalEval.overallScore,
          timestamp: new Date().toISOString()
        });

        await deductTokens(user.uid, TOKENS_PER_INTERVIEW);
      }

      // Pass results via sessionStorage since passing complex objects in URL is bad
      sessionStorage.setItem("interviewResults", JSON.stringify(finalEval));
      router.push("/interview/results");

    } catch (e: any) {
      console.error("Failed to finalize interview", e);
      alert(`There was an error saving your results: ${e.message || "Unknown error"}`);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4 relative overflow-hidden">
      <ProctorOverlay />

      {/* End Interview Button (Top Right) */}
      {state !== "IDLE" && state !== "ENDED" && (
        <button
          onClick={endInterview}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-md font-bold font-mono transition-all text-sm flex items-center shadow-[0_0_10px_rgba(220,38,38,0.3)]"
        >
          <span className="mr-2">⏹</span> End Interview
        </button>
      )}

      {/* Current Question Card */}
      <div className={`w-full max-w-3xl bg-white/5 border border-white/10 rounded-xl p-6 mb-12 transform transition-all duration-500 min-h-[120px] flex items-center justify-center text-center ${state === 'IDLE' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <p className="text-xl md:text-2xl font-heading text-white">{currentAIQuestion}</p>
      </div>

      {/* Avatar & Waveform Area */}
      <div className="flex flex-col items-center justify-center space-y-8 mb-12 flex-1">
        <AvatarPulse state={state} />
        <div className="h-16 w-full flex items-center justify-center">
          <Waveform state={state} />
        </div>

        {/* Live Text Area */}
        {state === "LISTENING" && (
          <div className="flex flex-col items-center w-full max-w-lg mt-4 space-y-4">
            {liveText && (
              <p className="text-gray-300 font-mono text-center text-sm italic min-h-[40px] px-4 w-full break-words">
                "{liveText}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transcript Area */}
      <div className="w-full flex justify-center mb-10 z-10 w-full max-w-2xl bg-[#0A0A0F]">
        <TranscriptBox transcript={transcript} />
      </div>

      {/* Start Button Overlay */}
      {state === "IDLE" && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-3xl font-heading text-white mb-6">Ready to start?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto font-mono text-sm">
              Ensure your camera and microphone are permitted. Make sure you are in a quiet room.
            </p>
            {isLoadingVoice ? (
              <button disabled className="px-8 py-4 bg-gray-500 text-gray-300 font-bold text-xl rounded-full opacity-70 cursor-not-allowed">
                Downloading Voice Model...
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-accent text-black font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,229,204,0.5)]"
              >
                Begin Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
