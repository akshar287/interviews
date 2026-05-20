"use client";

import { useEffect, useState } from "react";
import ResultsDashboard from "@/components/ResultsDashboard";
import { FinalEvaluationResponse } from "@/lib/aiClient";

export default function ResultsPage() {
  const [results, setResults] = useState<FinalEvaluationResponse | null>(null);

  useEffect(() => {
    // Read results passed from the session
    const saved = sessionStorage.getItem("interviewResults");
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <ResultsDashboard results={results} />
    </div>
  );
}
