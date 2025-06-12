"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Smile, BirdIcon as Owl, Flower, Shield, Scale } from "lucide-react"
import type { Persona } from "@/types/chat"

interface PersonaSelectorProps {
  selectedPersona: Persona
  onPersonaChange: (persona: Persona) => void
  language: string
}

const personas = {
  zen_guide: {
    icon: Flower,
    color: "from-green-500 to-emerald-600",
    name: { en: "Zen Guide", sw: "Mwongozi wa Amani", fr: "Guide Zen" },
    description: {
      en: "Calm, mindful, and centered. Offers peaceful wisdom and meditation guidance.",
      sw: "Mtulivu, makini, na mzuri. Anatoa hekima ya amani na mwongozo wa kutafakari.",
      fr: "Calme, attentif et centré. Offre une sagesse paisible et des conseils de méditation.",
    },
  },
  cheerful_companion: {
    icon: Smile,
    color: "from-yellow-500 to-orange-600",
    name: { en: "Cheerful Companion", sw: "Mwenzako wa Furaha", fr: "Compagnon Joyeux" },
    description: {
      en: "Upbeat, optimistic, and encouraging. Brings positivity and hope to conversations.",
      sw: "Mchangamfu, mwenye matumaini, na mwenye kuhamasisha. Analeta hali nzuri na tumaini katika mazungumzo.",
      fr: "Optimiste, positif et encourageant. Apporte de la positivité et de l'espoir aux conversations.",
    },
  },
  wise_owl: {
    icon: Owl,
    color: "from-purple-500 to-indigo-600",
    name: { en: "Wise Owl", sw: "Bundi Mwenye Hekima", fr: "Hibou Sage" },
    description: {
      en: "Thoughtful, analytical, and insightful. Provides deep understanding and practical advice.",
      sw: "Mwenye mawazo, mchambuzi, na mwenye ufahamu. Anatoa uelewa wa kina na ushauri wa vitendo.",
      fr: "Réfléchi, analytique et perspicace. Fournit une compréhension profonde et des conseils pratiques.",
    },
  },
  gentle_soul: {
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    name: { en: "Gentle Soul", sw: "Roho Mpole", fr: "Âme Douce" },
    description: {
      en: "Compassionate, empathetic, and nurturing. Offers comfort and emotional support.",
      sw: "Mwenye huruma, mwenye hisia, na mlea. Anatoa faraja na msaada wa kihisia.",
      fr: "Compatissant, empathique et bienveillant. Offre du réconfort et un soutien émotionnel.",
    },
  },
  resilient_warrior: {
    icon: Shield,
    color: "from-red-500 to-red-600",
    name: { en: "Resilient Warrior", sw: "Shujaa Mwenye Uvumilivu", fr: "Guerrier Résilient" },
    description: {
      en: "Strong, determined, and empowering. Helps build courage and overcome challenges.",
      sw: "Mwenye nguvu, azimio, na uweza. Anasaidia kujenga ujasiri na kushinda changamoto.",
      fr: "Fort, déterminé et autonomisant. Aide à développer le courage et à surmonter les défis.",
    },
  },
  balanced_soul: {
    icon: Scale,
    color: "from-blue-500 to-cyan-600",
    name: { en: "Balanced Soul", sw: "Roho ya Uwiano", fr: "Âme Équilibrée" },
    description: {
      en: "Harmonious, stable, and well-rounded. Provides balanced perspectives and grounded advice.",
      sw: "Mwenye mshikamano, thabiti, na mkamilifu. Anatoa mitazamo ya uwiano na ushauri wa kimsingi.",
      fr: "Harmonieux, stable et équilibré. Fournit des perspectives équilibrées et des conseils fondés.",
    },
  },
}

export function PersonaSelector({ selectedPersona, onPersonaChange, language }: PersonaSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-lg mb-4">
        {language === "sw"
          ? "Chagua Mtindo wa Mazungumzo"
          : language === "fr"
            ? "Choisir le Style de Conversation"
            : "Choose Conversation Style"}
      </h3>
      <div className="grid gap-3">
        {Object.entries(personas).map(([key, persona]) => {
          const IconComponent = persona.icon
          const isSelected = selectedPersona === key
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? "bg-slate-600/80 border-teal-500/50 shadow-lg shadow-teal-500/20"
                  : "bg-slate-700/50 border-slate-600/30 hover:bg-slate-600/50"
              }`}
              onClick={() => onPersonaChange(key as Persona)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${persona.color} rounded-full flex items-center justify-center`}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-sm">
                      {persona.name[language as keyof typeof persona.name]}
                    </CardTitle>
                    {isSelected && (
                      <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 text-xs">
                        {language === "sw" ? "Kimechaguliwa" : language === "fr" ? "Sélectionné" : "Selected"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-slate-300 text-xs leading-relaxed">
                  {persona.description[language as keyof typeof persona.description]}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
