export type Intent = "venting" | "seeking_advice" | "gratitude" | "general_chat"
export type Emotion = "joy" | "sadness" | "anger" | "fear" | "surprise" | "disgust" | "neutral"
export type Persona =
  | "zen_guide"
  | "cheerful_companion"
  | "wise_owl"
  | "gentle_soul"
  | "resilient_warrior"
  | "balanced_soul"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  intent?: Intent
  emotion?: Emotion
  persona?: Persona
}

export interface UserProfile {
  recentEmotions: Emotion[]
  preferredPersona: Persona
  conversationHistory: ChatMessage[]
}
