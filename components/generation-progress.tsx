"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GenerationProgressProps {
  isGenerating: boolean
  onComplete?: () => void
}

const steps = [
  "Analyzing room layout...",
  "Identifying furniture placement...",
  "Applying style transformation...",
  "Enhancing lighting and colors...",
  "Finalizing details...",
]

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setCurrentStep(0)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          onComplete?.()
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isGenerating, onComplete])

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length)
    setCurrentStep(Math.min(stepIndex, steps.length - 1))
  }, [progress])

  if (!isGenerating && progress === 0) return null

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {progress < 100 ? "Generating Design" : "Complete!"}
        </span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            progress < 100 ? "bg-primary animate-pulse" : "bg-success",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{steps[currentStep]}</p>
    </div>
  )
}
