export type InterviewState = "IDLE" | "AI_SPEAKING" | "LISTENING" | "PROCESSING" | "ENDED";

// We'll manage state primarily inside React components 
// using standard React hooks (useState) since it needs to drive UI reactivity.
// This type definition keeps state strings strictly typed across components.
