"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { mockStyles } from "@/lib/mock-data"

interface StylePickerProps {
  onSelect?: (styleId: string) => void
  className?: string
}

export function StylePicker({ onSelect, className }: StylePickerProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const handleSelect = (styleId: string) => {
    console.log("[v0] Style selected:", styleId)
    setSelectedStyle(styleId)
    onSelect?.(styleId)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-medium text-foreground">Choose a Style</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mockStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => handleSelect(style.id)}
            className={cn(
              "relative rounded-lg overflow-hidden border-2 transition-all duration-200 group",
              selectedStyle === style.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-border",
            )}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={style.thumbnail || "/placeholder.svg"}
                alt={style.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-xs font-medium text-white truncate">{style.name}</p>
            </div>
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
