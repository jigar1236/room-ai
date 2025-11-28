"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { EditorSidebar } from "@/components/editor-sidebar"
import { UploadDropzone } from "@/components/upload-dropzone"
import { BeforeAfterSlider } from "@/components/before-after-slider"
import { OutputImageCard } from "@/components/output-image-card"
import { GenerationProgress } from "@/components/generation-progress"
import { CreditBadge } from "@/components/credit-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { mockRooms, mockProjects, mockUser } from "@/lib/mock-data"
import { ArrowLeft, Upload, Layers, ImageIcon, History, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function RoomEditorPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const roomId = params.roomId as string

  const [isGenerating, setIsGenerating] = useState(false)
  const [hasUploaded, setHasUploaded] = useState(true)
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null)

  const room = mockRooms.find((r) => r.id === roomId)
  const project = mockProjects.find((p) => p.id === projectId)

  if (!room || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Room not found</h1>
          <p className="text-muted-foreground mt-2">The room you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleUpload = (file: File) => {
    console.log("[v0] File uploaded:", file.name)
    setHasUploaded(true)
  }

  const handleStyleSelect = (styleId: string) => {
    console.log("[v0] Style selected:", styleId)
  }

  const handleFurnitureSelect = (furnitureId: string) => {
    console.log("[v0] Furniture selected:", furnitureId)
  }

  const handleGenerate = () => {
    console.log("[v0] Generation started")
    setIsGenerating(true)
  }

  const handleGenerationComplete = () => {
    console.log("[v0] Generation complete")
    setIsGenerating(false)
  }

  const handleFavorite = (id: string) => {
    console.log("[v0] Toggle favorite:", id)
  }

  const handleDownload = (id: string) => {
    console.log("[v0] Download:", id)
  }

  const handleExpand = (id: string) => {
    console.log("[v0] Expand:", id)
    setSelectedOutput(id)
  }

  const latestOutput = room.outputs[0]

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <main className="flex-1 pl-64 pr-80">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/projects/${projectId}`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xl hover:bg-transparent">
                        {room.name}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {mockRooms
                        .filter((r) => r.projectId === projectId)
                        .map((r) => (
                          <DropdownMenuItem key={r.id} asChild>
                            <Link href={`/projects/${projectId}/rooms/${r.id}`}>{r.name}</Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge variant="secondary">{room.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CreditBadge credits={mockUser.credits} total={mockUser.totalCredits} variant="compact" />
            </div>
          </div>

          <GenerationProgress isGenerating={isGenerating} onComplete={handleGenerationComplete} />

          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList>
              <TabsTrigger value="editor">
                <Layers className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="compare">
                <ImageIcon className="w-4 h-4 mr-2" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <History className="w-4 h-4 mr-2" />
                Gallery ({room.outputs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {!hasUploaded ? (
                <div className="max-w-2xl mx-auto">
                  <UploadDropzone onUpload={handleUpload} />
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Original Photo</h3>
                      <Button variant="outline" size="sm" onClick={() => setHasUploaded(false)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Replace
                      </Button>
                    </div>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border">
                      <img
                        src={room.originalImage || "/placeholder.svg"}
                        alt="Original room"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">AI Generated Preview</h3>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                      {latestOutput ? (
                        <img
                          src={latestOutput.image || "/placeholder.svg"}
                          alt="Generated preview"
                          className="w-full h-full object-cover"
                        />
                      ) : isGenerating ? (
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-4">Generating your design...</p>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Select a style and click Generate to see your room transformed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare">
              {latestOutput ? (
                <BeforeAfterSlider
                  beforeImage={room.originalImage}
                  afterImage={latestOutput.image}
                  beforeLabel="Original"
                  afterLabel={latestOutput.style}
                  className="max-w-4xl mx-auto"
                />
              ) : (
                <div className="text-center py-16">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No designs to compare</h3>
                  <p className="text-muted-foreground mt-1">Generate a design first to use the comparison view</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gallery">
              {room.outputs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {room.outputs.map((output) => (
                    <OutputImageCard
                      key={output.id}
                      output={output}
                      onFavorite={handleFavorite}
                      onDownload={handleDownload}
                      onExpand={handleExpand}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No generated designs yet</h3>
                  <p className="text-muted-foreground mt-1">Your generated designs will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="fixed right-0 top-0 h-full">
        <EditorSidebar
          onStyleSelect={handleStyleSelect}
          onFurnitureSelect={handleFurnitureSelect}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  )
}
