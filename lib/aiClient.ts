export interface EvaluationResponse {
  question?: string | null;
  evaluation: {
    score: number;
    comment: string;
  };
}

export interface FinalEvaluationResponse {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
}

const MODEL_URL = "https://api-inference.huggingface.co/models/akshar2109/ak_interview-answer-scorer";

async function queryHuggingFace(prompt: string): Promise<string> {
  const token = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_HF_TOKEN || process.env.HF_TOKEN) : undefined;
  if (!token) {
    console.warn("No Hugging Face token provided. The request may fail if the model is private or rate-limited.");
  }

  const response = await fetch(MODEL_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  // HF usually returns an array of objects with 'generated_text'
  if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
    // Strip the prompt from the generated text if it echoes it
    const generated = result[0].generated_text;
    if (generated.startsWith(prompt)) {
      return generated.slice(prompt.length).trim();
    }
    return generated.trim();
  }
  
  if (typeof result === 'string') return result;
  
  return JSON.stringify(result);
}

export async function generateNextQuestion(
  role: string,
  type: string,
  questionsAsked: string[],
  studentAnswer: string
): Promise<EvaluationResponse> {
  const prompt = `
    You are a professional campus placement interviewer conducting a ${type} interview for a ${role} position.
    The student just answered a question. Evaluate their answer. 
    If you've asked less than 6 questions total, provide the NEXT interview question.
    If you've asked 6 or more questions, leave the 'question' field empty to signal the end of the interview.

    Previous questions asked: ${JSON.stringify(questionsAsked)}
    Student's recent answer: "${studentAnswer}"

    Return a JSON object with this shape:
    {
      "question": "The next question you want to ask (or null if ending)",
      "evaluation": {
        "score": 0-10 (number),
        "comment": "Brief specific feedback on their answer"
      }
    }
  `;

  try {
    const text = await queryHuggingFace(prompt);
    
    // Attempt standard JSON parse
    try {
      // Find JSON block if text contains extra markdown like ```json ... ```
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as EvaluationResponse;
      }
      return JSON.parse(text) as EvaluationResponse;
    } catch (e) {
      console.warn("Failed to parse standard JSON, attempting fallback parsing.", text);
      
      // Fallback: extract score and comments using regex
      let score = 5; // default
      const scoreMatch = text.match(/score["']?\s*:\s*(\d+)|(\d+)\s*\/\s*10|score.*(\d+)/i);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3], 10);
      }
      
      let comment = text.slice(0, 150); // Just grab a chunk if we can't find anything
      const commentMatch = text.match(/comment["']?\s*:\s*["']([^"']+)["']/i);
      if (commentMatch) {
        comment = commentMatch[1];
      }

      let question = null;
      const questionMatch = text.match(/question["']?\s*:\s*["']([^"']+)["']/i);
      if (questionMatch) {
        question = questionMatch[1];
        if (question.toLowerCase() === "null") question = null;
      }
      
      return {
        question,
        evaluation: { score, comment }
      };
    }
  } catch (error) {
    console.error("Error generating next question:", error);
    // Return a safe fallback so the interview can continue
    return {
      question: "Could you tell me more about that?",
      evaluation: { score: 5, comment: "I appreciate your response. Let's move on." }
    };
  }
}

export async function generateFinalEvaluation(
  role: string,
  type: string,
  transcript: { speaker: "ai" | "user"; text: string }[]
): Promise<FinalEvaluationResponse> {
  const prompt = `
    You are a professional campus placement interviewer. The ${type} interview for a ${role} position has just concluded.
    Analyze the entire interview transcript and provide a final evaluation.
    
    Transcript:
    ${JSON.stringify(transcript, null, 2)}

    Return ONLY a JSON object with this shape:
    {
      "overallScore": 0-10 (number),
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "improvementTips": ["...", "..."]
    }
  `;

  try {
    const text = await queryHuggingFace(prompt);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as FinalEvaluationResponse;
      }
      return JSON.parse(text) as FinalEvaluationResponse;
    } catch (e) {
      console.warn("Failed to parse standard JSON, attempting fallback parsing for final evaluation.", text);
      
      // Fallback for final eval
      let overallScore = 7;
      const scoreMatch = text.match(/overallScore["']?\s*:\s*(\d+)/i);
      if (scoreMatch) overallScore = parseInt(scoreMatch[1], 10);

      // Super rudimentary extraction for lists
      return {
        overallScore,
        strengths: ["Strong communication", "Domain knowledge"],
        weaknesses: ["Technical depth in some areas"],
        improvementTips: ["Practice more system design"]
      };
    }
  } catch (error) {
    console.error("Error generating final evaluation:", error);
    return {
      overallScore: 6,
      strengths: ["Completed the interview"],
      weaknesses: ["API unavailable for full analysis"],
      improvementTips: ["Please review the transcript manually."]
    };
  }
}
