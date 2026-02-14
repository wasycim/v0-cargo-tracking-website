"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error"
  duration?: number
  onClose: () => void
}

export function ToastNotification({ message, type = "success", duration = 2000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      } ${
        type === "success"
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
          : "border-destructive/30 bg-red-50 text-red-800 dark:bg-red-950/80 dark:text-red-300"
      }`}
      role="alert"
    >
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
        type === "success" ? "bg-emerald-500" : "bg-destructive"
      }`}>
        {type === "success" ? (
          <Check className="h-3.5 w-3.5 text-white" />
        ) : (
          <X className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
