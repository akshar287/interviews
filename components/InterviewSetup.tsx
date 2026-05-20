"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function InterviewSetup({ tokens }: { tokens: number }) {
  const router = useRouter();
  const [role, setRole] = useState("Software Engineer");
  const [type, setType] = useState("Technical");

  const cost = 175;
  const canAfford = tokens >= cost;

  const handleStart = () => {
    if (!canAfford) return;
    const searchParams = new URLSearchParams({ role, type });
    router.push(`/interview/session?${searchParams.toString()}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-bold text-white">Configure Session</h2>
        <button 
          onClick={handleSignOut}
          className="text-xs text-red-400 hover:text-red-300 font-mono transition-colors border border-red-500/30 hover:bg-red-500/10 px-3 py-1 rounded"
        >
          Sign Out
        </button>
      </div>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">Target Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-black/50 border border-white/20 rounded-md p-3 text-white font-mono focus:border-accent focus:outline-none"
          >
            <option>Software Engineer</option>
            <option>Data Analyst</option>
            <option>Product Manager</option>
            <option>UI/UX Designer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-mono text-gray-400 mb-2">Interview Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-black/50 border border-white/20 rounded-md p-3 text-white font-mono focus:border-accent focus:outline-none"
          >
            <option>Technical</option>
            <option>HR</option>
            <option>Aptitude</option>
          </select>
        </div>
      </div>

      <div className="bg-black/40 rounded-lg p-4 mb-8 flex justify-between border border-accent/20">
        <div>
          <p className="text-xs text-gray-400">Available Tokens</p>
          <p className="text-xl font-mono text-white">{tokens}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Session Cost</p>
          <p className="text-xl font-mono text-accent">-{cost}</p>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!canAfford}
        className={`w-full py-4 rounded-md font-bold text-lg font-heading transition-all ${
          canAfford 
            ? "bg-accent text-black hover:bg-accent/90 shadow-[0_0_15px_rgba(0,229,204,0.4)]" 
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        {canAfford ? "START INTERVIEW" : "INSUFFICIENT TOKENS"}
      </button>
    </div>
  );
}
