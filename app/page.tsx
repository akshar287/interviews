"use client";

import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // user logged in
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          await createUserProfile(user.uid, user.email, user.displayName);
        }
        router.push("/interview/setup");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert(`Google Sign-In Error: ${error.message || "Unknown error occurred"}`);
    }
  };

  if (loading) return null; // or a loader

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-bg relative overflow-hidden">
      {/* Decorative BG element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="z-10 text-center animate-fadeIn max-w-lg w-full">
        <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tight text-white">
          Ace Your <br/> <span className="text-accent drop-shadow-[0_0_15px_rgba(0,229,204,0.5)]">Next Interview</span>
        </h1>
        <p className="text-gray-400 font-mono mb-12">
          Experience hyper-realistic mock interviews with our conversational AI. Real-time feedback, analytics, and proctoring included.
        </p>

        <button 
          onClick={handleLogin}
          className="flex items-center justify-center w-full px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-all"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
