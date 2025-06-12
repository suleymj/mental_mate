"use client"

import { Badge } from "@/components/ui/badge"
import type { Emotion } from "@/types/chat"
import {
  Smile,
  Frown,
  Angry,
  GhostIcon as Fearful,
  AngryIcon as Surprised,
  AnnoyedIcon as Disgusted,
  Minus,
} from "lucide-react"

interface EmotionDisplayProps {
  emotions: Emotion[]
  language: string
}

const emotionConfig = {
  joy: { icon: Smile, color: "bg-yellow-500/20 text-yellow-300", label: { en: "Joy", sw: "Furaha", fr: "Joie" } },
  sadness: {
    icon: Frown,
    color: "bg-blue-500/20 text-blue-300",
    label: { en: "Sadness", sw: "Huzuni", fr: "Tristesse" },
  },
  anger: { icon: Angry, color: "bg-red-500/20 text-red-300", label: { en: "Anger", sw: "Hasira", fr: "Colère" } },
  fear: { icon: Fearful, color: "bg-purple-500/20 text-purple-300", label: { en: "Fear", sw: "Hofu", fr: "Peur" } },
  surprise: {
    icon: Surprised,
    color: "bg-orange-500/20 text-orange-300",
    label: { en: "Surprise", sw: "Mshangao", fr: "Surprise" },
  },
  disgust: {
    icon: Disgusted,
    color: "bg-green-500/20 text-green-300",
    label: { en: "Disgust", sw: "Chuki", fr: "Dégoût" },
  },
  neutral: {
    icon: Minus,
    color: "bg-gray-500/20 text-gray-300",
    label: { en: "Neutral", sw: "Kawaida", fr: "Neutre" },
  },
}

export function EmotionDisplay({ emotions, language }: EmotionDisplayProps) {
  if (emotions.length === 0) return null

  // Get the most recent emotions (last 3)
  const recentEmotions = emotions.slice(-3)

  return (
    <div className="space-y-2">
      <h4 className="text-slate-300 text-sm font-medium">
        {language === "sw" ? "Hisia za Hivi Karibuni" : language === "fr" ? "Émotions Récentes" : "Recent Emotions"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {recentEmotions.map((emotion, index) => {
          const config = emotionConfig[emotion]
          const IconComponent = config.icon
          return (
            <Badge key={index} className={`${config.color} border-0 flex items-center gap-1`}>
              <IconComponent className="w-3 h-3" />
              <span className="text-xs">{config.label[language as keyof typeof config.label]}</span>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
