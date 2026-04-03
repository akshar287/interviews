"use client";

import { useEffect, useRef } from "react";

interface TranscriptLine {
  speaker: "ai" | "user";
  text: string;
}

export default function TranscriptBox({ transcript }: { transcript: TranscriptLine[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl h-64 overflow-y-auto p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm space-y-4"
    >
      {transcript.length === 0 && (
        <p className="text-gray-500 italic text-center mt-20">Transcript will appear here...</p>
      )}
      
      {transcript.map((line, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col ${line.speaker === "ai" ? "items-start" : "items-end"}`}
        >
          <span className={`text-xs mb-1 ${line.speaker === "ai" ? "text-accent" : "text-gray-400"}`}>
            {line.speaker === "ai" ? "Interviewer" : "You"}
          </span>
          <div 
            className={`p-3 rounded-lg max-w-[80%] ${
              line.speaker === "ai" 
                ? "bg-accent/10 border border-accent/20 text-accent" 
                : "bg-white/10 border border-white/20 text-white"
            }`}
          >
            {line.text}
          </div>
        </div>
      ))}
    </div>
  );
}
