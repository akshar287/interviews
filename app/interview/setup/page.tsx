"use client";

import { useEffect, useState } from "react";
import InterviewSetup from "@/components/InterviewSetup";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<number | null>(null);

  useEffect(() => {
    const fetchTokens = async (uid: string) => {
      const profile = await getUserProfile(uid);
      if (profile) {
        setTokens(profile.tokens);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTokens(user.uid);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {tokens !== null ? (
        <div className="w-full flex justify-center animate-fadeIn">
          <InterviewSetup tokens={tokens} />
        </div>
      ) : (
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  );
}
