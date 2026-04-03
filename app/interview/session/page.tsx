"use client";

import { useSearchParams } from "next/navigation";
import InterviewSession from "@/components/InterviewSession";

export default function SessionPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Software Engineer";
  const type = searchParams.get("type") || "Technical";

  return <InterviewSession role={role} type={type} />;
}
