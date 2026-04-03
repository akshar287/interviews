"use client";

import { InterviewState } from "@/lib/interviewStateMachine";
import { motion } from "framer-motion";

export default function AvatarPulse({ state }: { state: InterviewState }) {
  const isSpeaking = state === "AI_SPEAKING";
  const isListening = state === "LISTENING";
  const isProcessing = state === "PROCESSING";

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Outer Pulse Rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full animate-pulseRing bg-accent/20"></div>
          <div className="absolute inset-2 rounded-full animate-pulseRing bg-accent/30" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-4 rounded-full animate-pulseRing bg-accent/40" style={{ animationDelay: '1s' }}></div>
        </>
      )}

      {/* Core Avatar */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
          opacity: isProcessing ? 0.5 : 1,
          boxShadow: isListening ? "0 0 20px rgba(0, 229, 204, 0.5)" : "0 0 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
        className={`z-10 w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-500 ${
          isSpeaking ? 'bg-accent' : isListening ? 'bg-accent/50 border-2 border-accent' : 'bg-gray-800'
        }`}
      >
        <span className="text-4xl">🤖</span>
      </motion.div>
      
      {/* State label */}
      <div className="absolute -bottom-8 text-sm font-mono text-gray-400">
        {state === "IDLE" && "Ready"}
        {state === "AI_SPEAKING" && "AI is speaking..."}
        {state === "LISTENING" && "Listening..."}
        {state === "PROCESSING" && "Thinking..."}
        {state === "ENDED" && "Interview Complete"}
      </div>
    </div>
  );
}
