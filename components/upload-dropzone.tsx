"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface UploadDropzoneProps {
  onUpload?: (file: File) => void
  className?: string
}

export function UploadDropzone({ onUpload, className }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        console.log("[v0] File dropped:", file.name)
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        onUpload?.(file)
      }
    },
    [onUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        console.log("[v0] File selected:", file.name)
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        onUpload?.(file)
      }
    },
    [onUpload],
  )

  const handleRemove = () => {
    console.log("[v0] Image removed")
    setPreview(null)
  }

  if (preview) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden", className)}>
        <img src={preview || "/placeholder.svg"} alt="Uploaded preview" className="w-full h-64 object-cover" />
        <Button size="icon" variant="destructive" className="absolute top-2 right-2" onClick={handleRemove}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Drop your room photo here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse (PNG, JPG up to 10MB)</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span>Best results with well-lit, clear photos</span>
        </div>
      </div>
    </div>
  )
}
