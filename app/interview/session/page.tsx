"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InterviewSession from "@/components/InterviewSession";

function SessionContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Software Engineer";
  const type = searchParams.get("type") || "Technical";

  return <InterviewSession role={role} type={type} />;
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0A0A0F] text-[#00E5CC]">Loading...</div>}>
      <SessionContent />
    </Suspense>
  );
}
