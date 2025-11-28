"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { mockStyles, mockFurniture } from "@/lib/mock-data"
import { Check, Sparkles, Sofa, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorSidebarProps {
  onStyleSelect?: (styleId: string) => void
  onFurnitureSelect?: (furnitureId: string) => void
  onGenerate?: () => void
  isGenerating?: boolean
}

export function EditorSidebar({
  onStyleSelect,
  onFurnitureSelect,
  onGenerate,
  isGenerating = false,
}: EditorSidebarProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([])
  const [brightness, setBrightness] = useState([50])
  const [creativity, setCreativity] = useState([70])

  const handleStyleSelect = (styleId: string) => {
    console.log("[v0] Style selected:", styleId)
    setSelectedStyle(styleId)
    onStyleSelect?.(styleId)
  }

  const handleFurnitureToggle = (furnitureId: string) => {
    console.log("[v0] Furniture toggled:", furnitureId)
    setSelectedFurniture((prev) =>
      prev.includes(furnitureId) ? prev.filter((id) => id !== furnitureId) : [...prev, furnitureId],
    )
    onFurnitureSelect?.(furnitureId)
  }

  const handleGenerate = () => {
    console.log("[v0] Generate clicked with:", {
      style: selectedStyle,
      furniture: selectedFurniture,
      brightness: brightness[0],
      creativity: creativity[0],
    })
    onGenerate?.()
  }

  return (
    <div className="w-80 bg-card border-l border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Design Editor</h2>
        <p className="text-sm text-muted-foreground">Customize your room transformation</p>
      </div>

      <Tabs defaultValue="styles" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="styles"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Styles
          </TabsTrigger>
          <TabsTrigger
            value="furniture"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Sofa className="w-4 h-4 mr-2" />
            Furniture
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="styles" className="m-0 p-4">
            <div className="grid grid-cols-2 gap-2">
              {mockStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={cn(
                    "relative rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedStyle === style.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-border",
                  )}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={style.thumbnail || "/placeholder.svg"}
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs font-medium text-white truncate">{style.name}</p>
                  </div>
                  {selectedStyle === style.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="furniture" className="m-0 p-4">
            <div className="space-y-2">
              {mockFurniture.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFurnitureToggle(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg border-2 transition-all duration-200",
                    selectedFurniture.includes(item.id)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted",
                  )}
                >
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} • {item.price}
                    </p>
                  </div>
                  {selectedFurniture.includes(item.id) && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="m-0 p-4 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Brightness</Label>
                <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
              </div>
              <Slider value={brightness} onValueChange={setBrightness} max={100} step={1} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">AI Creativity</Label>
                <span className="text-sm text-muted-foreground">{creativity[0]}%</span>
              </div>
              <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!selectedStyle || isGenerating}>
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Design
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">Uses 1 credit per generation</p>
      </div>
    </div>
  )
}
