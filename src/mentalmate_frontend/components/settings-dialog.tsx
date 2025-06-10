"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Bell, Volume2, Globe, X } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const {
    language,
    setLanguage,
    notificationsEnabled,
    setNotificationsEnabled,
    speechEnabled,
    setSpeechEnabled,
    t,
    requestNotificationPermission,
  } = useSettings()

  const [tempLanguage, setTempLanguage] = useState(language)
  const [tempNotifications, setTempNotifications] = useState(notificationsEnabled)
  const [tempSpeech, setTempSpeech] = useState(speechEnabled)

  useEffect(() => {
    if (open) {
      setTempLanguage(language)
      setTempNotifications(notificationsEnabled)
      setTempSpeech(speechEnabled)
    }
  }, [open, language, notificationsEnabled, speechEnabled])

  const handleSave = async () => {
    setLanguage(tempLanguage)
    setSpeechEnabled(tempSpeech)

    if (tempNotifications && !notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setNotificationsEnabled(true)
        toast({
          title: "✅ " + t("notificationGranted"),
          duration: 3000,
        })
      } else {
        toast({
          title: "❌ " + t("notificationDenied"),
          variant: "destructive",
          duration: 3000,
        })
        setTempNotifications(false)
      }
    } else {
      setNotificationsEnabled(tempNotifications)
    }

    if (tempSpeech !== speechEnabled) {
      toast({
        title: tempSpeech ? "🔊 " + t("speechEnabled") : "🔇 " + t("speechDisabled"),
        duration: 3000,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/50 text-white backdrop-blur-sm">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚙</span>
            </div>
            {t("settings")}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Section */}
          <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <Label className="text-sm font-medium text-white">{t("language")}</Label>
            </div>
            <RadioGroup
              value={tempLanguage}
              onValueChange={(value) => setTempLanguage(value as typeof language)}
              className="space-y-3 ml-11"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="en" id="en" className="border-slate-500 text-green-500" />
                <Label htmlFor="en" className="text-sm text-slate-200 cursor-pointer">
                  {t("english")}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="sw" id="sw" className="border-slate-500 text-green-500" />
                <Label htmlFor="sw" className="text-sm text-slate-200 cursor-pointer">
                  {t("kiswahili")}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="fr" id="fr" className="border-slate-500 text-green-500" />
                <Label htmlFor="fr" className="text-sm text-slate-200 cursor-pointer">
                  {t("french")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notifications Section */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <Label htmlFor="notifications" className="text-sm font-medium text-white cursor-pointer">
                {t("notifications")}
              </Label>
            </div>
            <Switch
              id="notifications"
              checked={tempNotifications}
              onCheckedChange={setTempNotifications}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Speech Section */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
              <Label htmlFor="speech" className="text-sm font-medium text-white cursor-pointer">
                {t("speech")}
              </Label>
            </div>
            <Switch
              id="speech"
              checked={tempSpeech}
              onCheckedChange={setTempSpeech}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            {t("close")}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25"
          >
            {t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
