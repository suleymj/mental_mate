"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Language, translations } from "@/lib/translations"

type SettingsContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
  speechEnabled: boolean
  setSpeechEnabled: (enabled: boolean) => void
  t: (key: keyof typeof translations.en) => string
  requestNotificationPermission: () => Promise<boolean>
  speakText: (text: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("chatbot-language") as Language | null
    const savedNotifications = localStorage.getItem("chatbot-notifications")
    const savedSpeech = localStorage.getItem("chatbot-speech")

    if (savedLanguage) setLanguage(savedLanguage)
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true")
    if (savedSpeech) setSpeechEnabled(savedSpeech === "true")

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("chatbot-language", language)
  }, [language])

  useEffect(() => {
    localStorage.setItem("chatbot-notifications", String(notificationsEnabled))
  }, [notificationsEnabled])

  useEffect(() => {
    localStorage.setItem("chatbot-speech", String(speechEnabled))
  }, [speechEnabled])

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key]
  }

  // Request notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted")
      return true
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission === "granted"
  }

  // Speech synthesis function
  const speakText = (text: string) => {
    if (!speechEnabled) return

    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set language based on current selection
      switch (language) {
        case "en":
          utterance.lang = "en-US"
          break
        case "sw":
          utterance.lang = "sw-KE"
          break
        case "fr":
          utterance.lang = "fr-FR"
          break
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
        speechEnabled,
        setSpeechEnabled,
        t,
        requestNotificationPermission,
        speakText,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
