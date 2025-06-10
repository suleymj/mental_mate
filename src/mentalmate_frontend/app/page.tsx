"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Settings, User, GraduationCap, Sparkles, Menu } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useSettings } from "@/contexts/settings-context"
import { SettingsDialog } from "@/components/settings-dialog"
import { VoiceRecorder } from "@/components/voice-recorder"

export default function ChatBot() {
  const [language, setLanguage] = useState("en")
  const { messages, input, handleInputChange, handleSubmit, status, setInput } = useChat({
    api: "/api/chat",
    body: {
      language: language,
    },
    onFinish: (message) => {
      if (message.role === "assistant") {
        const fullText = message.content
        speakText(fullText)
        showNotification(fullText)
      }
    },
  })

  const { t, speakText, notificationsEnabled } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const showNotification = (content: string) => {
    if (!notificationsEnabled || !("Notification" in window)) return

    if (Notification.permission === "granted" && document.visibilityState !== "visible") {
      new Notification(t("notificationTitle"), {
        body: content.length > 100 ? content.substring(0, 100) + "..." : content,
        icon: "/favicon.ico",
      })
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript)
      // Auto-submit after a short delay
      setTimeout(() => {
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>
        handleSubmit(syntheticEvent)
      }, 500)
    }
  }

  const quickActions = [
    {
      text:
        language === "sw"
          ? "Mchakato wa Usajili"
          : language === "fr"
            ? "Processus d'inscription"
            : "Registration Process",
    },
    { text: language === "sw" ? "Muundo wa Ada" : language === "fr" ? "Structure des frais" : "Fee Structure" },
    { text: language === "sw" ? "Maeneo ya Kampasi" : language === "fr" ? "Zones du campus" : "Campus Areas" },
    {
      text:
        language === "sw"
          ? "Maelezo ya Mawasiliano"
          : language === "fr"
            ? "Informations de contact"
            : "Contact Information",
    },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 animate-pulse"></div>

        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-green-600 font-bold text-lg">AI</span>
          </div>

          <div>
            <h1 className="text-white font-bold text-xl">Little Angels School Assistant</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-green-100 text-sm">Online & Ready to Help</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full transition-all duration-200"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-30 lg:z-0 w-80 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 transition-transform duration-300 ease-in-out`}
        >
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-white font-semibold text-lg mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/30 rounded-xl p-4 h-auto transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => {
                      const syntheticEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>
                      handleInputChange({
                        target: { value: action.text },
                      } as React.ChangeEvent<HTMLInputElement>)
                      setTimeout(() => handleSubmit(syntheticEvent), 100)
                      setSidebarOpen(false)
                    }}
                  >
                    <div className="text-sm leading-relaxed">{action.text}</div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg mb-4">Featured</h2>
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-200 hover:scale-[1.02] border border-red-400/20 p-4 h-auto"
                onClick={() => {
                  const syntheticEvent = {
                    preventDefault: () => {},
                  } as React.FormEvent<HTMLFormElement>
                  const admissionText =
                    language === "sw"
                      ? "Niambie kuhusu mchakato wa usajili"
                      : language === "fr"
                        ? "Parlez-moi du processus d'admission"
                        : "Tell me about the admission process"
                  handleInputChange({
                    target: { value: admissionText },
                  } as React.ChangeEvent<HTMLInputElement>)
                  setTimeout(() => handleSubmit(syntheticEvent), 100)
                  setSidebarOpen(false)
                }}
              >
                <div className="text-left">
                  <div className="font-medium">
                    {language === "sw"
                      ? "Mchakato wa Usajili"
                      : language === "fr"
                        ? "Processus d'admission"
                        : "Admission Process"}
                  </div>
                  <div className="text-xs text-red-100 mt-1">
                    {language === "sw"
                      ? "Pata maelezo kamili"
                      : language === "fr"
                        ? "Obtenez des informations complètes"
                        : "Get complete information"}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/30"></div>
            <ScrollArea className="h-full relative z-10">
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                        <GraduationCap className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {language === "sw"
                            ? "Karibu Little Angels School!"
                            : language === "fr"
                              ? "Bienvenue à l'école Little Angels!"
                              : "Welcome to Little Angels School!"}
                        </h2>
                        <p className="text-slate-300 text-lg max-w-2xl">
                          {language === "sw"
                            ? "Mimi ni msaidizi wako wa kielektroniki. Naweza kukusaidia kupata maelezo kuhusu shule yetu, mchakato wa usajili, ada, na mengi zaidi."
                            : language === "fr"
                              ? "Je suis votre assistant numérique. Je peux vous aider à obtenir des informations sur notre école, le processus d'admission, les frais et bien plus encore."
                              : "I'm your digital assistant. I can help you get information about our school, admission process, fees, and much more."}
                        </p>
                      </div>
                    </div>

                    {/* Welcome Message Cards */}
                    <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
                      <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-white font-semibold">
                            {language === "sw" ? "Habari!" : language === "fr" ? "Bonjour!" : "Hello!"}
                          </h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {language === "sw"
                            ? "Nawezaje kukusaidia leo? Unaweza kuniuliza kuhusu chochote kinachohusiana na shule yetu."
                            : language === "fr"
                              ? "Comment puis-je vous aider aujourd'hui? Vous pouvez me poser des questions sur tout ce qui concerne notre école."
                              : "How can I help you today? You can ask me anything about our school."}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-white font-semibold">
                            {language === "sw" ? "Anza Hapa" : language === "fr" ? "Commencez ici" : "Start Here"}
                          </h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {language === "sw"
                            ? "Tumia vitendo vya haraka kwenye upande wa kushoto au andika swali lako hapa chini."
                            : language === "fr"
                              ? "Utilisez les actions rapides sur la gauche ou tapez votre question ci-dessous."
                              : "Use the quick actions on the left or type your question below."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className="flex gap-4 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {message.role === "assistant" ? (
                          <>
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-2xl rounded-tl-md px-6 py-4 max-w-3xl shadow-lg border border-slate-600/30 backdrop-blur-sm">
                              {message.parts.map((part, i) => {
                                switch (part.type) {
                                  case "text":
                                    return (
                                      <p key={`${message.id}-${i}`} className="text-white leading-relaxed">
                                        {part.text}
                                      </p>
                                    )
                                  default:
                                    return null
                                }
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1" />
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl rounded-tr-md px-6 py-4 max-w-3xl shadow-lg border border-blue-400/20">
                              <p className="text-white leading-relaxed">{message.content}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border border-slate-500/30">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {status === "streaming" && (
                      <div className="flex gap-4 animate-fade-in">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-2xl rounded-tl-md px-6 py-4 shadow-lg border border-slate-600/30 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto p-6">
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      language === "sw"
                        ? "Andika ujumbe wako hapa..."
                        : language === "fr"
                          ? "Tapez votre message ici..."
                          : "Type your message here..."
                    }
                    disabled={status === "streaming"}
                    className="bg-slate-700/80 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20 rounded-xl backdrop-blur-sm transition-all duration-200 text-lg py-4 px-6"
                  />
                </div>
                <VoiceRecorder
                  onTranscript={handleVoiceTranscript}
                  language={language}
                  disabled={status === "streaming"}
                />
                <Button
                  type="submit"
                  disabled={status === "streaming" || !input.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
