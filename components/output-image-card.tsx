"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Download, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GeneratedImage } from "@prisma/client"

interface OutputImageCardProps {
  output: GeneratedImage
  onFavorite?: (id: string) => void
  onDownload?: (id: string) => void
  onExpand?: (id: string) => void
}

export function OutputImageCard({ output, onFavorite, onDownload, onExpand }: OutputImageCardProps) {
  const handleFavorite = () => {
    console.log("[v0] Toggle favorite:", output.id)
    onFavorite?.(output.id)
  }

  const handleDownload = () => {
    console.log("[v0] Download image:", output.id)
    onDownload?.(output.id)
  }

  const handleExpand = () => {
    console.log("[v0] Expand image:", output.id)
    onExpand?.(output.id)
  }

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={output.imageUrl || "/placeholder.svg"}
          alt={output.imageKey}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-medium">{(output.metadata as Record<string, string>)?.style}</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleFavorite}
            >
              <Heart className={cn("w-4 h-4", output.isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={handleExpand}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{(output.metadata as Record<string, string>)?.style}</span>
          <span className="text-xs text-muted-foreground">{new Date(output.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
