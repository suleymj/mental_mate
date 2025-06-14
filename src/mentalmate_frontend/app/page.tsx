"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  MessageCircle,
  BookOpen,
  Headphones,
  LineChart,
  Settings,
  UserCircle,
  Bookmark,
  Phone,
  ChevronRight,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  LogOut,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Zap,
  Brain,
  Flower2,
  Target,
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  X,
} from "lucide-react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface Message {
  id: string
  content: string
  role: "user" | "bot" | "admin" | "system"
  timestamp: Date
  emotion?: string
  intent?: string
  persona?: string
  adminName?: string
  flagged?: boolean
  flagReason?: string
}

interface ChatResponse {
  response: string
  emotion: string
  intent: string
  persona: string
}

interface ChatSession {
  id: string
  userId: string
  userName: string
  startTime: Date
  lastActivity: Date
  status: "active" | "admin_joined" | "ended" | "flagged"
  messages: Message[]
  currentEmotion?: string
  moodHistory?: { timestamp: Date; mood: number; emotion?: string }[]
  notes?: string
  flagged?: boolean
  flagReason?: string
}

interface UserProfile {
  id: string
  name: string
  email?: string
  joinDate: Date
  preferredPersona: string
  sessions: string[]
  moodHistory: { timestamp: Date; mood: number; emotion?: string }[]
  savedResources: string[]
  goals?: { id: string; text: string; completed: boolean; createdAt: Date }[]
  emergencyContacts?: { name: string; relationship: string; phone: string }[]
}

interface Resource {
  id: string
  title: string
  type: "article" | "video" | "exercise" | "meditation" | "crisis"
  tags: string[]
  description: string
  content: string
  imageUrl?: string
  duration?: number
  audioUrl?: string
}

const personas = [
  { value: "empathetic", label: "Empathetic Listener", icon: Heart, color: "from-blue-400 to-blue-600" },
  { value: "motivational", label: "Motivational Coach", icon: Zap, color: "from-orange-400 to-red-500" },
  { value: "analytical", label: "Analytical Guide", icon: Brain, color: "from-purple-400 to-purple-600" },
  { value: "gentle", label: "Gentle Supporter", icon: Flower2, color: "from-pink-400 to-rose-500" },
]

const emotions = {
  happy: {
    color: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
    icon: Smile,
    bgColor: "bg-yellow-400",
  },
  sad: {
    color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300",
    icon: Frown,
    bgColor: "bg-blue-400",
  },
  anxious: {
    color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300",
    icon: AlertTriangle,
    bgColor: "bg-purple-400",
  },
  angry: {
    color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300",
    icon: Angry,
    bgColor: "bg-red-400",
  },
  neutral: {
    color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300",
    icon: Meh,
    bgColor: "bg-gray-400",
  },
  excited: {
    color: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300",
    icon: Zap,
    bgColor: "bg-green-400",
  },
}

// Crisis keywords for detection
const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "hurt myself",
  "self harm",
  "no reason to live",
  "better off dead",
]

// Sample resources for the library
const resourceLibrary: Resource[] = [
  {
    id: "res_1",
    title: "Understanding Anxiety",
    type: "article",
    tags: ["anxiety", "mental health", "self-help"],
    description: "Learn about the causes, symptoms, and management strategies for anxiety.",
    content:
      "Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder...",
    imageUrl: "/images.jpeg",
  },
  {
    id: "res_2",
    title: "5-Minute Calming Meditation",
    type: "meditation",
    tags: ["meditation", "anxiety", "stress relief"],
    description: "A short guided meditation to help calm your mind during stressful moments.",
    content: "This meditation focuses on deep breathing and mindfulness to bring a sense of calm and peace...",
    imageUrl: "/images.jpeg",
    duration: 300,
    audioUrl: "#",
  },
  {
    id: "res_3",
    title: "Cognitive Behavioral Therapy Techniques",
    type: "article",
    tags: ["CBT", "therapy", "depression"],
    description: "Practical CBT techniques you can apply in your daily life.",
    content: "Cognitive Behavioral Therapy (CBT) is a psycho-social intervention that aims to improve mental health...",
    imageUrl: "/images.jpeg",
  },
  {
    id: "res_4",
    title: "Progressive Muscle Relaxation",
    type: "exercise",
    tags: ["relaxation", "stress", "anxiety"],
    description: "Learn how to release tension through progressive muscle relaxation.",
    content:
      "Progressive muscle relaxation is a technique that involves tensing and then releasing each muscle group...",
    imageUrl: "/images.jpeg",
    duration: 600,
  },
  {
    id: "res_5",
    title: "Crisis Resources",
    type: "crisis",
    tags: ["emergency", "crisis", "suicide prevention"],
    description: "Immediate resources for mental health crises.",
    content: "If you're experiencing a mental health crisis, these resources can provide immediate support...",
    imageUrl: "/images.jpeg",
  },
  {
    id: "res_6",
    title: "Deep Sleep Meditation",
    type: "meditation",
    tags: ["sleep", "relaxation", "meditation"],
    description: "A guided meditation to help you fall into a deep, restful sleep.",
    content: "This meditation uses visualization and deep breathing to help you relax and prepare for sleep...",
    imageUrl: "/images.jpeg",
    duration: 1200,
    audioUrl: "#",
  },
]

export default function MindBotChat() {
  // User state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm MindBot, your mental health support companion. How are you feeling today?",
      role: "bot",
      timestamp: new Date(),
      persona: "empathetic",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState("empathetic")
  const [darkMode, setDarkMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([
    "I'm feeling anxious today",
    "I need someone to talk to",
    "Help me with stress management",
    "I'm having trouble sleeping",
  ])
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminName, setAdminName] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [adminJoined, setAdminJoined] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [showAdminNotes, setShowAdminNotes] = useState(false)
  const [flaggedSessions, setFlaggedSessions] = useState<string[]>([])

  // User profile state
  const [currentUserId] = useState(`user_${Date.now()}`)
  const [currentUserName] = useState(`User ${Math.floor(Math.random() * 1000)}`)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: currentUserId,
    name: currentUserName,
    joinDate: new Date(),
    preferredPersona: "empathetic",
    sessions: [],
    moodHistory: [
      { timestamp: new Date(Date.now() - 86400000 * 6), mood: 3, emotion: "sad" },
      { timestamp: new Date(Date.now() - 86400000 * 5), mood: 4, emotion: "anxious" },
      { timestamp: new Date(Date.now() - 86400000 * 4), mood: 5, emotion: "neutral" },
      { timestamp: new Date(Date.now() - 86400000 * 3), mood: 6, emotion: "neutral" },
      { timestamp: new Date(Date.now() - 86400000 * 2), mood: 7, emotion: "happy" },
      { timestamp: new Date(Date.now() - 86400000), mood: 6, emotion: "neutral" },
    ],
    savedResources: [],
    goals: [
      {
        id: "goal_1",
        text: "Practice mindfulness for 10 minutes daily",
        completed: false,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: "goal_2",
        text: "Take a walk outside each day",
        completed: true,
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
    emergencyContacts: [
      {
        name: "Jane Smith",
        relationship: "Therapist",
        phone: "555-123-4567",
      },
    ],
  })

  // Feature state
  const [currentMood, setCurrentMood] = useState<number>(5)
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const [showResourceLibrary, setShowResourceLibrary] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showMeditation, setShowMeditation] = useState(false)
  const [meditationPlaying, setMeditationPlaying] = useState(false)
  const [currentMeditation, setCurrentMeditation] = useState<Resource | null>(null)
  const [meditationProgress, setMeditationProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resourceLibrary)
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all")
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [showCrisisResources, setShowCrisisResources] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize current user session
  useEffect(() => {
    const currentSession: ChatSession = {
      id: `session_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      startTime: new Date(),
      lastActivity: new Date(),
      status: "active",
      messages: messages,
      currentEmotion: "neutral",
      moodHistory: [{ timestamp: new Date(), mood: 5, emotion: "neutral" }],
    }
    setChatSessions([currentSession])
    setUserProfile((prev) => ({
      ...prev,
      sessions: [...prev.sessions, currentSession.id],
    }))
  }, [])

  // Update current session when messages change
  useEffect(() => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.userId === currentUserId
          ? {
              ...session,
              messages: messages,
              lastActivity: new Date(),
            }
          : session,
      ),
    )
  }, [messages, currentUserId])

  // Filter resources when search query changes
  useEffect(() => {
    const filtered = resourceLibrary.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = selectedResourceType === "all" || resource.type === selectedResourceType

      return matchesSearch && matchesType
    })
    setFilteredResources(filtered)
  }, [searchQuery, selectedResourceType])

  // Meditation timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (meditationPlaying && currentMeditation) {
      timer = setInterval(() => {
        setMeditationProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= (currentMeditation.duration || 300)) {
            setMeditationPlaying(false)
            return 0
          }
          return newProgress
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [meditationPlaying, currentMeditation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus management for accessibility
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setSpeechSupported(true)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: { results: { transcript: any }[][] }) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => prev + (prev ? " " : "") + transcript)
      }

      recognition.onerror = (event: { error: any }) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Voice synthesis for bot responses
  const speakMessage = (text: string) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Crisis detection
  const checkForCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase()
    return crisisKeywords.some((keyword) => lowerText.includes(keyword))
  }

  // Handle crisis detection
  const handleCrisisDetection = () => {
    // Add system message about crisis detection
    const crisisMessage: Message = {
      id: Date.now().toString(),
      content:
        "I've noticed some concerning language in your message. If you're in crisis or having thoughts of harming yourself, please know that help is available. Would you like to see crisis resources?",
      role: "system",
      timestamp: new Date(),
      flagged: true,
      flagReason: "Crisis language detected",
    }

    setMessages((prev) => [...prev, crisisMessage])

    // Flag the session
    setChatSessions((prev) =>
      prev.map((session) =>
        session.userId === currentUserId
          ? {
              ...session,
              status: "flagged",
              flagged: true,
              flagReason: "Crisis language detected",
            }
          : session,
      ),
    )

    // Add to flagged sessions
    setFlaggedSessions((prev) => [...prev, `session_${Date.now()}`])

    // Show crisis resources
    setShowCrisisResources(true)
    setCrisisDetected(true)

    // Alert admin if logged in
    if (isAdmin) {
      alert("URGENT: Crisis language detected in active session. Please check flagged sessions.")
    }
  }

  // Admin login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple admin authentication (in real app, use proper auth)
    if (adminName.trim() && adminPassword === "admin123") {
      setIsAdmin(true)
      setShowAdminLogin(false)
      // Add some mock sessions for demo
      const mockSessions: ChatSession[] = [
        {
          id: "session_1",
          userId: "user_1",
          userName: "Sarah M.",
          startTime: new Date(Date.now() - 300000),
          lastActivity: new Date(Date.now() - 60000),
          status: "active",
          messages: [
            {
              id: "1",
              content: "I've been feeling really anxious lately about work",
              role: "user",
              timestamp: new Date(Date.now() - 120000),
            },
            {
              id: "2",
              content:
                "I understand that work anxiety can be overwhelming. Can you tell me more about what specifically is causing you stress?",
              role: "bot",
              timestamp: new Date(Date.now() - 60000),
              emotion: "anxious",
              intent: "emotional_support",
            },
          ],
          currentEmotion: "anxious",
          moodHistory: [
            { timestamp: new Date(Date.now() - 86400000 * 3), mood: 4, emotion: "anxious" },
            { timestamp: new Date(Date.now() - 86400000 * 2), mood: 3, emotion: "anxious" },
            { timestamp: new Date(Date.now() - 86400000), mood: 4, emotion: "anxious" },
          ],
        },
        {
          id: "session_2",
          userId: "user_2",
          userName: "Mike R.",
          startTime: new Date(Date.now() - 600000),
          lastActivity: new Date(Date.now() - 30000),
          status: "active",
          messages: [
            {
              id: "1",
              content: "I'm having trouble sleeping and it's affecting my mood",
              role: "user",
              timestamp: new Date(Date.now() - 180000),
            },
            {
              id: "2",
              content:
                "Sleep issues can definitely impact our emotional wellbeing. Have you noticed any patterns in what might be keeping you awake?",
              role: "bot",
              timestamp: new Date(Date.now() - 120000),
              emotion: "sad",
              intent: "coping_strategies",
            },
          ],
          currentEmotion: "sad",
          moodHistory: [
            { timestamp: new Date(Date.now() - 86400000 * 3), mood: 5, emotion: "neutral" },
            { timestamp: new Date(Date.now() - 86400000 * 2), mood: 4, emotion: "sad" },
            { timestamp: new Date(Date.now() - 86400000), mood: 3, emotion: "sad" },
          ],
        },
        {
          id: "session_3",
          userId: "user_3",
          userName: "Alex T.",
          startTime: new Date(Date.now() - 900000),
          lastActivity: new Date(Date.now() - 120000),
          status: "flagged",
          flagged: true,
          flagReason: "Crisis language detected",
          messages: [
            {
              id: "1",
              content: "I don't see any point in continuing anymore, nothing helps",
              role: "user",
              timestamp: new Date(Date.now() - 180000),
              flagged: true,
            },
            {
              id: "2",
              content:
                "I'm concerned about what you're sharing. It sounds like you're going through a really difficult time. Would it be okay if we talked about some immediate support options?",
              role: "bot",
              timestamp: new Date(Date.now() - 120000),
              emotion: "sad",
              intent: "crisis_support",
            },
          ],
          currentEmotion: "sad",
          moodHistory: [
            { timestamp: new Date(Date.now() - 86400000 * 3), mood: 3, emotion: "sad" },
            { timestamp: new Date(Date.now() - 86400000 * 2), mood: 2, emotion: "sad" },
            { timestamp: new Date(Date.now() - 86400000), mood: 1, emotion: "sad" },
          ],
        },
      ]
      setChatSessions((prev) => [...prev, ...mockSessions])
      setFlaggedSessions(["session_3"])
    } else {
      alert("Invalid credentials. Use any name and password: admin123")
    }
  }

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false)
    setAdminName("")
    setAdminPassword("")
    setSelectedSession(null)
    setAdminJoined(false)
    setAdminNotes("")
  }

  // Admin join conversation
  const handleAdminJoinConversation = (sessionId: string) => {
    setSelectedSession(sessionId)
    setAdminJoined(true)

    // Get session notes if they exist
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session?.notes) {
      setAdminNotes(session.notes)
    } else {
      setAdminNotes("")
    }

    // Add admin join message to the session
    const joinMessage: Message = {
      id: Date.now().toString(),
      content: `${adminName} (Support Specialist) has joined the conversation to provide additional assistance.`,
      role: "admin",
      timestamp: new Date(),
      adminName: adminName,
    }

    if (sessionId === chatSessions.find((s) => s.userId === currentUserId)?.id) {
      // Admin joining current user's session
      setMessages((prev) => [...prev, joinMessage])
    }

    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "admin_joined" as const,
              messages: [...session.messages, joinMessage],
            }
          : session,
      ),
    )
  }

  // Save admin notes
  const handleSaveAdminNotes = (sessionId: string) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              notes: adminNotes,
            }
          : session,
      ),
    )
    setShowAdminNotes(false)
  }

  // Flag session
  const handleFlagSession = (sessionId: string, reason: string) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "flagged",
              flagged: true,
              flagReason: reason,
            }
          : session,
      ),
    )
    setFlaggedSessions((prev) => [...prev, sessionId])
  }

  // Send admin message
  const sendAdminMessage = (sessionId: string, content: string) => {
    const adminMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: "admin",
      timestamp: new Date(),
      adminName: adminName,
    }

    if (sessionId === chatSessions.find((s) => s.userId === currentUserId)?.id) {
      // Admin sending to current user
      setMessages((prev) => [...prev, adminMessage])
    }

    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, adminMessage],
              lastActivity: new Date(),
            }
          : session,
      ),
    )
  }

  // Update mood
  const handleMoodUpdate = (mood: number) => {
    setCurrentMood(mood)
    const moodEntry = {
      timestamp: new Date(),
      mood: mood,
      emotion: getMoodEmotion(mood),
    }

    // Update user profile
    setUserProfile((prev) => ({
      ...prev,
      moodHistory: [...prev.moodHistory, moodEntry],
    }))

    // Update current session
    setChatSessions((prev) =>
      prev.map((session) =>
        session.userId === currentUserId
          ? {
              ...session,
              moodHistory: [...(session.moodHistory || []), moodEntry],
              currentEmotion: getMoodEmotion(mood),
            }
          : session,
      ),
    )

    // Add mood update message
    const moodMessage: Message = {
      id: Date.now().toString(),
      content: `You've updated your mood to ${getMoodIcon(mood)} (${mood}/10).`,
      role: "system",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, moodMessage])
  }

  // Get emotion from mood value
  const getMoodEmotion = (mood: number): string => {
    if (mood <= 3) return "sad"
    if (mood <= 4) return "anxious"
    if (mood <= 6) return "neutral"
    if (mood <= 8) return "happy"
    return "excited"
  }

  // Get mood icon component
  const getMoodIcon = (mood: number) => {
    if (mood <= 2) return <Frown className="w-4 h-4 inline" />
    if (mood <= 4) return <Frown className="w-4 h-4 inline" />
    if (mood <= 6) return <Meh className="w-4 h-4 inline" />
    if (mood <= 8) return <Smile className="w-4 h-4 inline" />
    return <Smile className="w-4 h-4 inline" />
  }

  // Start meditation
  const handleStartMeditation = (resource: Resource) => {
    setCurrentMeditation(resource)
    setMeditationPlaying(true)
    setMeditationProgress(0)
    setShowMeditation(true)
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  // Toggle meditation playback
  const toggleMeditationPlayback = () => {
    setMeditationPlaying(!meditationPlaying)
    if (audioRef.current) {
      if (meditationPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  // Save resource to profile
  const handleSaveResource = (resourceId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      savedResources: prev.savedResources.includes(resourceId)
        ? prev.savedResources.filter((id) => id !== resourceId)
        : [...prev.savedResources, resourceId],
    }))
  }

  // Add goal to profile
  const handleAddGoal = (goalText: string) => {
    const newGoal = {
      id: `goal_${Date.now()}`,
      text: goalText,
      completed: false,
      createdAt: new Date(),
    }
    setUserProfile((prev) => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal],
    }))
  }

  // Toggle goal completion
  const handleToggleGoal = (goalId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      goals: prev.goals?.map((goal) => (goal.id === goalId ? { ...goal, completed: !goal.completed } : goal)),
    }))
  }

  // Simulate API call to Motoko backend
  const sendMessageToBackend = async (message: string, persona: string): Promise<ChatResponse> => {
    // Don't send to bot if admin has joined
    if (adminJoined) {
      throw new Error("Admin has taken over the conversation")
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResponses: Record<string, ChatResponse> = {
      sad: {
        response:
          "I hear that you're feeling sad. It's completely normal to have these feelings. Would you like to talk about what's been weighing on your mind?",
        emotion: "sad",
        intent: "emotional_support",
        persona: persona,
      },
      anxious: {
        response:
          "Anxiety can feel overwhelming. Let's take this one step at a time. Have you tried any breathing exercises that help you feel more grounded?",
        emotion: "anxious",
        intent: "coping_strategies",
        persona: persona,
      },
      happy: {
        response:
          "It's wonderful to hear that you're feeling good! What's been bringing you joy lately? Celebrating positive moments is important for our wellbeing.",
        emotion: "happy",
        intent: "positive_reinforcement",
        persona: persona,
      },
      default: {
        response:
          "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how you're feeling right now?",
        emotion: "neutral",
        intent: "active_listening",
        persona: persona,
      },
    }

    const lowerMessage = message.toLowerCase()
    let responseKey = "default"

    if (lowerMessage.includes("sad") || lowerMessage.includes("down") || lowerMessage.includes("depressed")) {
      responseKey = "sad"
    } else if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("nervous")
    ) {
      responseKey = "anxious"
    } else if (lowerMessage.includes("happy") || lowerMessage.includes("good") || lowerMessage.includes("great")) {
      responseKey = "happy"
    }

    return mockResponses[responseKey]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Check for crisis keywords
    if (checkForCrisis(input)) {
      handleCrisisDetection()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      if (adminJoined) {
        // If admin has joined, don't send bot response
        setIsLoading(false)
        setIsTyping(false)
        return
      }

      const response = await sendMessageToBackend(input.trim(), selectedPersona)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: "bot",
        timestamp: new Date(),
        emotion: response.emotion,
        intent: response.intent,
        persona: response.persona,
      }

      setMessages((prev) => [...prev, botMessage])
      speakMessage(response.response)
      updateSuggestions(botMessage)
    } catch (error) {
      if (!adminJoined) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          role: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleEndChat = () => {
    const confirmEnd = window.confirm("Are you sure you want to end this chat session?")
    if (confirmEnd) {
      setMessages([
        {
          id: Date.now().toString(),
          content:
            "Thank you for chatting with me today. Remember, you're not alone, and it's okay to seek help when you need it. Take care of yourself!",
          role: "bot",
          timestamp: new Date(),
          persona: selectedPersona,
        },
      ])
    }
  }

  const skipToChat = () => {
    chatContainerRef.current?.focus()
  }

  const handleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const updateSuggestions = (lastBotMessage: Message) => {
    if (!lastBotMessage.emotion) return

    const emotionBasedSuggestions: Record<string, string[]> = {
      sad: [
        "I've been feeling down lately",
        "Tell me more about coping with sadness",
        "I need encouragement",
        "Help me find hope",
      ],
      anxious: [
        "I'm worried about everything",
        "Teach me breathing exercises",
        "I feel overwhelmed",
        "Help me calm down",
      ],
      happy: [
        "I want to maintain this good mood",
        "Share tips for staying positive",
        "I'm grateful for today",
        "How can I help others feel better?",
      ],
      angry: [
        "I'm frustrated and need to vent",
        "Help me manage my anger",
        "I need to calm down",
        "Teach me healthy ways to express anger",
      ],
      neutral: [
        "How are you doing today?",
        "I want to check in with myself",
        "Tell me about self-care",
        "I need motivation",
      ],
    }

    const newSuggestions = emotionBasedSuggestions[lastBotMessage.emotion] || [
      "Tell me more",
      "I need support",
      "Help me understand",
      "What should I do next?",
    ]

    setSuggestions(newSuggestions)
    setShowSuggestions(true)
  }

  const currentPersona = personas.find((p) => p.value === selectedPersona) || personas[0]

  // Format time for meditation display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Crisis Resources Component
  const CrisisResourcesDialog = () => (
    <Dialog open={showCrisisResources} onOpenChange={setShowCrisisResources}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Crisis Resources - Immediate Help
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2">If you're in immediate danger:</h3>
            <p className="text-red-700">
              Call emergency services (911 in the US) or go to your nearest emergency room.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Crisis Hotlines (24/7):</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium">National Suicide Prevention Lifeline</h4>
                <p className="text-blue-600 font-bold">988 or 1-800-273-8255</p>
                <p className="text-sm text-gray-600 mt-1">Free and confidential support for people in distress.</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium">Crisis Text Line</h4>
                <p className="text-blue-600 font-bold">Text HOME to 741741</p>
                <p className="text-sm text-gray-600 mt-1">Text with a trained crisis counselor.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Would you like to:</h3>
            <div className="flex flex-wrap gap-3 mt-3">
              <Button
                onClick={() => {
                  setShowCrisisResources(false)
                  // Simulate calling for help
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      content:
                        "I've notified a support specialist who will join this conversation shortly. Please stay with me.",
                      role: "system",
                      timestamp: new Date(),
                    },
                  ])
                  // Simulate admin joining after delay
                  setTimeout(() => {
                    const joinMessage: Message = {
                      id: Date.now().toString(),
                      content:
                        "Crisis Support Specialist has joined the conversation. I'm here to help you through this difficult moment.",
                      role: "admin",
                      timestamp: new Date(),
                      adminName: "Crisis Support",
                    }
                    setMessages((prev) => [...prev, joinMessage])
                    setAdminJoined(true)
                  }, 3000)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Talk to a specialist now
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCrisisResources(false)
                  setShowResourceLibrary(true)
                  setSelectedResourceType("crisis")
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View more resources
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCrisisResources(false)
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Continue chatting
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Mood Tracker Component
  const MoodTrackerDialog = () => (
    <Dialog open={showMoodTracker} onOpenChange={setShowMoodTracker}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LineChart className="w-6 h-6 text-blue-500" />
            Mood Tracker
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-4">How are you feeling right now?</h3>
            <div className="space-y-4">
              <div className="flex justify-between px-2">
                <Frown className="w-6 h-6 text-red-500" />
                <Frown className="w-6 h-6 text-orange-500" />
                <Meh className="w-6 h-6 text-yellow-500" />
                <Smile className="w-6 h-6 text-green-500" />
                <Smile className="w-6 h-6 text-blue-500" />
              </div>
              <Slider
                defaultValue={[currentMood]}
                max={10}
                min={1}
                step={1}
                onValueChange={(value) => setCurrentMood(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-2xl">{getMoodIcon(currentMood)}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentMood}/10 - {getMoodEmotion(currentMood)}
                </p>
              </div>
              <Button
                onClick={() => {
                  handleMoodUpdate(currentMood)
                  setShowMoodTracker(false)
                }}
                className="w-full"
              >
                Save Mood
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-4">Your Mood History</h3>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end">
                {userProfile.moodHistory.slice(-7).map((entry, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    style={{ height: "100%" }}
                  >
                    <div
                      className={`w-full max-w-[30px] rounded-t-md ${
                        entry.mood <= 3
                          ? "bg-red-400"
                          : entry.mood <= 5
                            ? "bg-yellow-400"
                            : entry.mood <= 7
                              ? "bg-blue-400"
                              : "bg-green-400"
                      }`}
                      style={{ height: `${(entry.mood / 10) * 100}%` }}
                    ></div>
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div className="text-xs text-gray-500">{entry.mood}/10</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium mb-2">Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userProfile.moodHistory.length > 5
                ? "Your mood has been improving over the past week. Keep using the strategies that are working for you!"
                : "Track your mood regularly to see patterns and get personalized insights."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Resource Library Component
  const ResourceLibraryDialog = () => (
    <Dialog open={showResourceLibrary} onOpenChange={setShowResourceLibrary}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Resource Library
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="meditation">Meditations</SelectItem>
                <SelectItem value="exercise">Exercises</SelectItem>
                <SelectItem value="crisis">Crisis Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${resource.imageUrl})` }}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{resource.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveResource(resource.id)}
                      aria-label={
                        userProfile.savedResources.includes(resource.id)
                          ? "Remove from saved resources"
                          : "Save resource"
                      }
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          userProfile.savedResources.includes(resource.id)
                            ? "fill-blue-500 text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className={`${
                        resource.type === "crisis"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : resource.type === "meditation"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : resource.type === "exercise"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {resource.type}
                    </Badge>
                    {resource.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{resource.description}</p>
                  <div className="flex justify-between items-center">
                    {resource.type === "meditation" ? (
                      <Button size="sm" onClick={() => handleStartMeditation(resource)} className="w-full">
                        <Headphones className="w-4 h-4 mr-2" />
                        Start Meditation
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        View Resource
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  // User Profile Component
  const UserProfileDialog = () => (
    <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCircle className="w-6 h-6 text-blue-500" />
            Your Profile
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="saved">Saved Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{userProfile.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Member since {userProfile.joinDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Recent Mood
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getMoodIcon(userProfile.moodHistory[userProfile.moodHistory.length - 1]?.mood || 5)}
                </div>
                <div>
                  <div className="font-medium">
                    {getMoodEmotion(userProfile.moodHistory[userProfile.moodHistory.length - 1]?.mood || 5)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userProfile.moodHistory[userProfile.moodHistory.length - 1]?.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    setShowUserProfile(false)
                    setShowMoodTracker(true)
                  }}
                >
                  Update
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" />
                Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Preferred Support Style</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {personas.find((p) => p.value === userProfile.preferredPersona)?.label}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Voice Feedback</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {voiceEnabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)}>
                    {voiceEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Emergency Contacts
              </h3>
              {userProfile.emergencyContacts?.map((contact, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.relationship} • {contact.phone}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Call
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                Add Contact
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Your Goals
              </h3>
              <div className="space-y-3">
                {userProfile.goals?.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-full w-6 h-6 p-0 flex items-center justify-center ${
                        goal.completed
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }`}
                      onClick={() => handleToggleGoal(goal.id)}
                    >
                      {goal.completed ? <CheckCircle className="w-4 h-4" /> : null}
                    </Button>
                    <div className={`flex-1 ${goal.completed ? "line-through text-gray-500" : ""}`}>{goal.text}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Input placeholder="Add a new goal..." />
                <Button className="w-full mt-2">Add Goal</Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3">Goal Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>
                    {userProfile.goals?.filter((g) => g.completed).length || 0} / {userProfile.goals?.length || 0}
                  </span>
                </div>
                <Progress
                  value={
                    userProfile.goals?.length
                      ? (userProfile.goals.filter((g) => g.completed).length / userProfile.goals.length) * 100
                      : 0
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3">Saved Resources</h3>
              {userProfile.savedResources.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.savedResources.map((resourceId) => {
                    const resource = resourceLibrary.find((r) => r.id === resourceId)
                    if (!resource) return null
                    return (
                      <div
                        key={resourceId}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div
                          className={`w-10 h-10 rounded-md flex items-center justify-center ${
                            resource.type === "meditation"
                              ? "bg-purple-100 text-purple-800"
                              : resource.type === "exercise"
                                ? "bg-green-100 text-green-800"
                                : resource.type === "crisis"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {resource.type === "meditation" ? (
                            <Headphones className="w-4 h-4" />
                          ) : resource.type === "exercise" ? (
                            <Activity className="w-4 h-4" />
                          ) : resource.type === "crisis" ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{resource.type}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleSaveResource(resource.id)}>
                          <Bookmark className="w-4 h-4 fill-blue-500 text-blue-500" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No saved resources yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowUserProfile(false)
                      setShowResourceLibrary(true)
                    }}
                  >
                    Browse Resources
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )

  // Meditation Player Component
  const MeditationPlayerDialog = () => (
    <Dialog open={showMeditation} onOpenChange={setShowMeditation}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Headphones className="w-6 h-6 text-purple-500" />
            {currentMeditation?.title}
          </DialogTitle>
        </DialogHeader>
        {currentMeditation && (
          <div className="space-y-6">
            <div
              className="h-48 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${currentMeditation.imageUrl})` }}
            ></div>

            <div className="text-center">
              <div className="text-6xl mb-4 flex items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-gray-500" />
                {formatTime(meditationProgress)}
              </div>
              <Progress value={(meditationProgress / (currentMeditation.duration || 300)) * 100} className="mb-4" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(currentMeditation.duration || 300)} total
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setMeditationProgress(0)
                  setMeditationPlaying(false)
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="lg" onClick={toggleMeditationPlayback} className="bg-purple-600 hover:bg-purple-700">
                {meditationPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowMeditation(false)
                  setMeditationPlaying(false)
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentMeditation.description}</p>
            </div>
          </div>
        )}
        <audio ref={audioRef} loop>
          <source src={currentMeditation?.audioUrl} type="audio/mpeg" />
        </audio>
      </DialogContent>
    </Dialog>
  )

  // Admin Dashboard Component (keeping existing implementation)
  const AdminDashboard = () => {
    const [adminInput, setAdminInput] = useState("")

    const handleAdminSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!adminInput.trim() || !selectedSession) return

      sendAdminMessage(selectedSession, adminInput.trim())
      setAdminInput("")
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome, {adminName}</p>
            </div>
          </div>
          <Button onClick={handleAdminLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Flagged Sessions Alert */}
        {flaggedSessions.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">
                {flaggedSessions.length} Flagged Session{flaggedSessions.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-red-700 text-sm">
              Crisis language or concerning behavior detected. Please review immediately.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Sessions */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Sessions ({chatSessions.filter((s) => s.status !== "ended").length})
                {flaggedSessions.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {flaggedSessions.length} flagged
                  </Badge>
                )}
              </h3>
              <div className="space-y-3">
                {chatSessions
                  .filter((session) => session.status !== "ended")
                  .map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedSession === session.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : session.flagged
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{session.userName}</span>
                        <div className="flex items-center gap-2">
                          {session.flagged && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {session.currentEmotion && (
                            <Badge
                              variant="secondary"
                              className={`${emotions[session.currentEmotion as keyof typeof emotions]?.color} text-xs`}
                            >
                              {React.createElement(emotions[session.currentEmotion as keyof typeof emotions]?.icon, {
                                className: "w-3 h-3",
                              })}
                            </Badge>
                          )}
                          <Badge
                            variant={session.status === "admin_joined" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {session.status === "admin_joined" ? "Joined" : session.flagged ? "Flagged" : "Active"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last activity: {session.lastActivity.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {session.messages[session.messages.length - 1]?.content.substring(0, 50)}...
                      </p>
                      {session.status !== "admin_joined" && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAdminJoinConversation(session.id)
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Join Conversation
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {selectedSession
                    ? `Chat with ${chatSessions.find((s) => s.id === selectedSession)?.userName}`
                    : "Select a session to view chat"}
                </h3>
                {selectedSession && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAdminNotes(true)}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Notes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const reason = prompt("Reason for flagging:")
                        if (reason && selectedSession) {
                          handleFlagSession(selectedSession, reason)
                        }
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Flag
                    </Button>
                  </div>
                )}
              </div>

              {selectedSession ? (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                    {chatSessions
                      .find((s) => s.id === selectedSession)
                      ?.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-xs ${message.role === "user" ? "order-first" : ""}`}>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                message.role === "user"
                                  ? "bg-blue-500 text-white ml-auto"
                                  : message.role === "admin"
                                    ? "bg-purple-500 text-white"
                                    : message.flagged
                                      ? "bg-red-100 text-red-800 border border-red-300"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              {message.role === "admin" && (
                                <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {message.adminName}
                                </div>
                              )}
                              {message.flagged && (
                                <div className="text-xs text-red-600 mb-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Flagged: {message.flagReason}
                                </div>
                              )}
                              <p>{message.content}</p>
                            </div>
                            <time className="text-xs text-gray-500 mt-1 block">
                              {message.timestamp.toLocaleTimeString()}
                            </time>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Admin Input */}
                  <form onSubmit={handleAdminSubmit} className="flex gap-2">
                    <Input
                      value={adminInput}
                      onChange={(e) => setAdminInput(e.target.value)}
                      placeholder="Type your message as admin..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!adminInput.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a session to view and join the conversation</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Notes Dialog */}
        <Dialog open={showAdminNotes} onOpenChange={setShowAdminNotes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Session Notes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this session..."
                className="w-full h-32 p-3 border rounded-lg resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={() => selectedSession && handleSaveAdminNotes(selectedSession)} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Notes
                </Button>
                <Button variant="outline" onClick={() => setShowAdminNotes(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div
        className={`min-h-screen transition-all duration-500 ${
          darkMode
            ? "dark bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"
            : "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50"
        }`}
      >
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <AdminDashboard />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "dark bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${darkMode ? "bg-blue-500" : "bg-blue-300"} animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 ${darkMode ? "bg-purple-500" : "bg-purple-300"} animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Skip to main content link */}
      <a
        href="#main-chat"
        onClick={skipToChat}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 shadow-lg"
      >
        Skip to Chat
      </a>

      <div className="container mx-auto px-4 py-6 max-w-5xl relative z-10">
        {/* Navigation Bar */}
        <nav className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${currentPersona.color} rounded-2xl shadow-lg`}>
                {React.createElement(currentPersona.icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MindBot
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Your Mental Health Support Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoodTracker(true)}
                className="hidden md:flex items-center gap-2"
              >
                <LineChart className="w-4 h-4" />
                Mood
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResourceLibrary(true)}
                className="hidden md:flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Resources
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserProfile(true)}
                className="hidden md:flex items-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </Button>
              <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
                <Button variant="outline" size="sm" onClick={() => setShowAdminLogin(true)} className="p-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Admin Login
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <Input
                      placeholder="Admin Name"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">
                      Login as Admin
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Demo password: admin123</p>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-2">
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Persona Selection */}
        <div className="mb-6">
          <label htmlFor="persona-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Choose Your Support Style:
          </label>
          <Select value={selectedPersona} onValueChange={setSelectedPersona}>
            <SelectTrigger
              id="persona-select"
              className="w-full max-w-sm rounded-xl border-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
              {personas.map((persona) => (
                <SelectItem key={persona.value} value={persona.value} className="rounded-lg">
                  <div className="flex items-center gap-3">
                    {React.createElement(persona.icon, { className: "w-4 h-4" })}
                    <span>{persona.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            {React.createElement(currentPersona.icon, { className: "w-4 h-4" })}
            This affects how MindBot responds to you
          </p>
        </div>

        {/* Main Chat Interface */}
        <main id="main-chat">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Messages Container */}
              <div
                ref={chatContainerRef}
                className="h-96 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
                tabIndex={0}
              >
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {(message.role === "bot" || message.role === "admin" || message.role === "system") && (
                      <div
                        className={`flex-shrink-0 w-12 h-12 ${
                          message.role === "admin"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                            : message.role === "system"
                              ? "bg-gradient-to-br from-orange-500 to-red-600"
                              : `bg-gradient-to-br ${currentPersona.color}`
                        } rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        {message.role === "admin" ? (
                          <Shield className="w-6 h-6 text-white" />
                        ) : message.role === "system" ? (
                          <AlertTriangle className="w-6 h-6 text-white" />
                        ) : (
                          <Bot className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}

                    <div className={`max-w-sm lg:max-w-md ${message.role === "user" ? "order-first" : ""}`}>
                      <div
                        className={`px-6 py-4 rounded-3xl shadow-lg ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto"
                            : message.role === "admin"
                              ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                              : message.role === "system"
                                ? "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600"
                        }`}
                      >
                        {message.role === "admin" && (
                          <div className="text-xs opacity-75 mb-2 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {message.adminName} (Support Specialist)
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>

                      {message.emotion && message.intent && (
                        <div className="flex gap-2 mt-3 text-xs">
                          <Badge
                            variant="secondary"
                            className={`${emotions[message.emotion as keyof typeof emotions]?.color} text-xs border rounded-full px-3 py-1 shadow-sm`}
                          >
                            <span className="mr-1">
                              {React.createElement(emotions[message.emotion as keyof typeof emotions]?.icon, {
                                className: "w-3 h-3 inline",
                              })}
                            </span>
                            <span>{message.emotion}</span>
                          </Badge>
                        </div>
                      )}

                      <time className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </time>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div
                      className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${currentPersona.color} rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 px-6 py-4 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-600">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/50">
                {adminJoined && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        A support specialist has joined the conversation and will respond to your messages.
                      </span>
                    </div>
                  </div>
                )}

                {crisisDetected && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        We've detected concerning language. If you're in crisis, please consider the resources provided.
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCrisisResources(true)}
                        className="ml-auto text-red-600 border-red-200 hover:bg-red-50"
                      >
                        View Resources
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="message-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Share what's on your mind..."
                      disabled={isLoading}
                      className="w-full rounded-2xl border-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-base py-3 px-4"
                      maxLength={500}
                    />
                  </div>

                  {speechSupported && (
                    <Button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={`px-4 py-3 rounded-2xl ${
                        isListening
                          ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                          : "bg-gradient-to-r from-gray-500 to-gray-600"
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>

                {showSuggestions && suggestions.length > 0 && !adminJoined && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Suggestions:
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700 rounded-lg"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading}
                          className="text-sm h-10 px-4 rounded-2xl"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer Disclaimer */}
        <footer className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-3xl backdrop-blur-sm shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-200 text-base mb-2 flex items-center gap-2">
                Important Disclaimer
                <Heart className="w-4 h-4" />
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                MindBot is not a licensed therapist or mental health professional. This tool is designed to provide
                supportive conversation and general wellness information only. If you're experiencing a mental health
                crisis or having thoughts of self-harm, please contact a mental health professional, call your local
                emergency services, or reach out to a crisis helpline immediately.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* All Dialog Components */}
      <CrisisResourcesDialog />
      <MoodTrackerDialog />
      <ResourceLibraryDialog />
      <UserProfileDialog />
      <MeditationPlayerDialog />
    </div>
  )
}
