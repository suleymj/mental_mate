"use client"

import { Badge } from "@/components/ui/badge"
import type { Intent } from "@/types/chat"
import { MessageCircle, HelpCircle, Heart, Coffee } from "lucide-react"

interface IntentIndicatorProps {
  intent: Intent
  language: string
}

const intentConfig = {
  venting: {
    icon: MessageCircle,
    color: "bg-orange-500/20 text-orange-300",
    label: { en: "Venting", sw: "Kutoa Hisia", fr: "Exprimer" },
  },
  seeking_advice: {
    icon: HelpCircle,
    color: "bg-blue-500/20 text-blue-300",
    label: { en: "Seeking Advice", sw: "Kutafuta Ushauri", fr: "Chercher des Conseils" },
  },
  gratitude: {
    icon: Heart,
    color: "bg-pink-500/20 text-pink-300",
    label: { en: "Gratitude", sw: "Shukrani", fr: "Gratitude" },
  },
  general_chat: {
    icon: Coffee,
    color: "bg-green-500/20 text-green-300",
    label: { en: "General Chat", sw: "Mazungumzo ya Kawaida", fr: "Discussion Générale" },
  },
}

export function IntentIndicator({ intent, language }: IntentIndicatorProps) {
  const config = intentConfig[intent]
  const IconComponent = config.icon

  return (
    <Badge className={`${config.color} border-0 flex items-center gap-1 text-xs`}>
      <IconComponent className="w-3 h-3" />
      <span>{config.label[language as keyof typeof config.label]}</span>
    </Badge>
  )
}
