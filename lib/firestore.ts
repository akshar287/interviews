import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const STARTING_TOKENS = 500;
export const TOKENS_PER_INTERVIEW = 175;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  tokens: number;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(uid: string, email: string | null, displayName: string | null) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    email,
    displayName,
    tokens: STARTING_TOKENS,
  });
}

export async function deductTokens(uid: string, amount: number) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    tokens: increment(-amount),
  });
}

export interface InterviewSession {
  uid: string;
  role: string;
  type: string;
  transcript: { speaker: "ai" | "user"; text: string }[];
  scores: number[];
  finalScore: number;
  tokensUsed: number;
  timestamp: string;
}

export async function saveInterviewSession(uid: string, sessionData: Omit<InterviewSession, "uid" | "tokensUsed">) {
  const collRef = collection(db, `interviews/${uid}/sessions`);
  await addDoc(collRef, {
    ...sessionData,
    uid,
    tokensUsed: TOKENS_PER_INTERVIEW,
  });
}
