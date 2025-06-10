"use client"

import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import { useEffect } from "react"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  language: string
  disabled?: boolean
}

export function VoiceRecorder({ onTranscript, language, disabled }: VoiceRecorderProps) {
  const { recordingState, transcript, startRecording, stopRecording, cancelRecording, isSupported } = useVoiceRecorder(
    language === "sw" ? "sw-KE" : language === "fr" ? "fr-FR" : "en-US",
  )

  useEffect(() => {
    if (transcript && recordingState === "idle") {
      onTranscript(transcript)
    }
  }, [transcript, recordingState, onTranscript])

  if (!isSupported) {
    return null
  }

  const handleClick = () => {
    if (recordingState === "idle") {
      startRecording()
    } else if (recordingState === "recording") {
      stopRecording()
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled || recordingState === "processing"}
        className={`w-10 h-10 rounded-full transition-all duration-200 ${
          recordingState === "recording"
            ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50"
            : "bg-slate-600 hover:bg-slate-500"
        }`}
      >
        {recordingState === "recording" ? (
          <Square className="w-4 h-4 text-white" />
        ) : recordingState === "processing" ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mic className="w-4 h-4 text-white" />
        )}
      </Button>

      {recordingState === "recording" && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap animate-bounce">
          Recording...
        </div>
      )}
    </div>
  )
}
