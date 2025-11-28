"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { EditorSidebar } from "@/components/editor-sidebar"

interface EditorLayoutProps {
  children: React.ReactNode
  onStyleSelect?: (styleId: string) => void
  onFurnitureSelect?: (furnitureId: string) => void
  onGenerate?: () => void
  isGenerating?: boolean
}

export function EditorLayout({
  children,
  onStyleSelect,
  onFurnitureSelect,
  onGenerate,
  isGenerating,
}: EditorLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 pl-64 pr-80">{children}</main>
      <div className="fixed right-0 top-0 h-full">
        <EditorSidebar
          onStyleSelect={onStyleSelect}
          onFurnitureSelect={onFurnitureSelect}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  )
}
