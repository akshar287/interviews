"use client";

import { FinalEvaluationResponse } from "@/lib/aiClient";
import { useRouter } from "next/navigation";

export default function ResultsDashboard({ results }: { results: FinalEvaluationResponse | null }) {
  const router = useRouter();

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-accent font-mono animate-pulse">Analyzing interview data...</p>
      </div>
    );
  }

  // Calculate SVG circle properties for the score
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (results.overallScore / 10) * circumference;

  return (
    <div className="max-w-4xl w-full mx-auto p-8 animate-fadeIn">
      <h1 className="text-4xl font-heading font-bold text-white mb-8 border-b border-white/10 pb-4">
        Interview Report
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Score Ring */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center">
          <h2 className="text-gray-400 font-mono mb-4">Overall Score</h2>
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle cx="80" cy="80" r="60" stroke="#ffffff1a" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="60" 
                stroke="#00E5CC" 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-bold text-white">{results.overallScore}</span>
              <span className="text-sm text-gray-400">/ 10</span>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <h3 className="text-green-400 font-bold mb-3 flex items-center"><span className="mr-2">📈</span> Strengths</h3>
            <ul className="list-disc list-inside text-gray-300 font-mono text-sm space-y-1">
              {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-red-400 font-bold mb-3 flex items-center"><span className="mr-2">📉</span> Areas to Improve</h3>
            <ul className="list-disc list-inside text-gray-300 font-mono text-sm space-y-1">
              {results.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>

      </div>

      {/* Actionable Tips */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-8">
        <h3 className="text-accent font-bold mb-4 font-heading text-xl">AI Improvement Tips</h3>
        <ul className="space-y-3">
          {results.improvementTips.map((tip, i) => (
            <li key={i} className="flex items-start text-sm text-gray-300">
              <span className="text-accent mr-3">💡</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={() => router.push('/')}
        className="w-full md:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-md font-bold transition-all border border-white/20"
      >
        Return to Dashboard
      </button>

    </div>
  );
}
