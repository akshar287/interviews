import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export interface EvaluationResponse {
  question?: string;
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

export async function generateNextQuestion(
  role: string,
  type: string,
  questionsAsked: string[],
  studentAnswer: string
): Promise<EvaluationResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

  const prompt = `
    You are a professional campus placement interviewer conducting a ${type} interview for a ${role} position.
    The student just answered a question. Evaluate their answer. 
    If you've asked less than 6 questions total, provide the NEXT interview question.
    If you've asked 6 or more questions, leave the 'question' field empty (null/undefined) to signal the end of the interview.

    Previous questions asked: ${JSON.stringify(questionsAsked)}
    Student's recent answer: "${studentAnswer}"

    Return ONLY a JSON object with this shape:
    {
      "question": "The next question you want to ask (or null if ending)",
      "evaluation": {
        "score": 0-10 (number),
        "comment": "Brief specific feedback on their answer"
      }
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as EvaluationResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response text:", text);
    throw e;
  }
}

export async function generateFinalEvaluation(
  role: string,
  type: string,
  transcript: { speaker: "ai" | "user"; text: string }[]
): Promise<FinalEvaluationResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as FinalEvaluationResponse;
}
