import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, language = "en" } = await req.json()

  // Set system message based on language
  let systemMessage = "You are a helpful AI assistant. Be concise and friendly in your responses."

  if (language === "sw") {
    systemMessage = "Wewe ni msaidizi wa AI. Kuwa mfupi na rafiki katika majibu yako."
  } else if (language === "fr") {
    systemMessage = "Vous êtes un assistant IA utile. Soyez concis et amical dans vos réponses."
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemMessage,
    messages,
  })

  return result.toDataStreamResponse()
}
