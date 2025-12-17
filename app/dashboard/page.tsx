"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { UploadHero } from "@/components/upload-hero";
import { StyleGrid } from "@/components/style-grid";
import { GenerationCard } from "@/components/generation-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Wand2,
  ImageIcon,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { StyleType, RoomType } from "@prisma/client";
import Link from "next/link";

const ROOM_TYPES = [
  { value: "LIVING_ROOM", label: "Living Room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "BATHROOM", label: "Bathroom" },
  { value: "DINING_ROOM", label: "Dining Room" },
  { value: "OFFICE", label: "Home Office" },
  { value: "BALCONY", label: "Balcony" },
  { value: "OTHER", label: "Other" },
];

interface GeneratedDesign {
  id: string;
  imageUrl: string;
  isFavorite: boolean;
}

interface RecentDesign {
  id: string;
  originalUrl: string;
  style: StyleType | null;
  status: string;
  createdAt: string;
  generations: {
    id: string;
    imageUrl: string;
    isFavorite: boolean;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>(null);
  const [roomType, setRoomType] = useState<RoomType>("LIVING_ROOM");
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedDesign[]>([]);
  const [recentDesigns, setRecentDesigns] = useState<RecentDesign[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);

  const userName = session?.user?.name?.split(" ")[0] || "Designer";

  // Load recent designs and credits when session is ready
  useEffect(() => {
    if (status === "authenticated") {
      loadRecentDesigns();
      loadCredits();
    }
  }, [status]);

  const loadRecentDesigns = async () => {
    try {
      const response = await fetch("/api/designs/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentDesigns(data.designs || []);
      }
    } catch (error) {
      // Silent fail - recent designs are optional
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const loadCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage({ file, preview });
    setGeneratedImages([]);
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStyle) {
      toast.error("Please upload an image and select a style");
      return;
    }

    if (credits !== null && credits < 1) {
      toast.error("Insufficient credits. Please purchase more credits to continue.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage.file);
      formData.append("style", selectedStyle);
      formData.append("roomType", roomType);
      if (instructions.trim()) {
        formData.append("instructions", instructions.trim());
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Generation failed");
      }

      const data = await response.json();

      if (data.generations && data.generations.length > 0) {
        setGeneratedImages(
          data.generations.map((gen: any) => ({
            id: gen.id,
            imageUrl: gen.imageUrl,
            isFavorite: gen.isFavorite || false,
          }))
        );
        toast.success("Designs generated successfully!");
        loadCredits(); // Refresh credits
        loadRecentDesigns(); // Refresh recent designs
      } else {
        throw new Error("No images were generated");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate designs"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/designs/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: id }),
      });

      if (response.ok) {
        setGeneratedImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back, {userName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform your space with AI-powered interior design
            </p>
          </div>
          {credits !== null && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl glass border border-primary/30 shadow-md">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Credits</p>
                <p className="text-lg font-bold text-foreground">
                  <span className="text-primary">{credits}</span> remaining
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <section className="space-y-6 animate-fade-in stagger-1">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground">Upload a photo of your room to begin</p>
          </div>
          <UploadHero
            onImageSelect={handleImageSelect}
            isUploading={isGenerating}
          />
        </section>

        {/* Style Selection - Only show when image is uploaded */}
        {selectedImage && (
          <section className="space-y-6 animate-fade-in-up">
            <StyleGrid
              selectedStyle={selectedStyle}
              onSelect={setSelectedStyle}
            />

            {/* Options */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="room-type" className="text-base font-semibold">Room Type</Label>
                <Select
                  value={roomType}
                  onValueChange={(v) => setRoomType(v as RoomType)}
                >
                  <SelectTrigger id="room-type" className="h-12 bg-card border-border/50 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="instructions" className="text-base font-semibold">
                  Custom Instructions{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="E.g., Add more plants, use warmer colors..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[48px] bg-card border-border/50 resize-none shadow-sm"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col items-center gap-3 pt-6">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!selectedStyle || isGenerating}
                className="btn-shine bg-gradient-to-r from-primary via-primary/90 to-primary text-base px-10 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Designs...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate 4 Designs
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Uses 1 credit • Results in ~30 seconds
              </p>
            </div>
          </section>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <section className="py-16 animate-fade-in">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl glass border-2 border-primary/30 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-14 h-14 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
              </div>
              <div className="space-y-3 max-w-lg">
                <h3 className="text-2xl font-bold">
                  Creating Your Designs
                </h3>
                <p className="text-muted-foreground text-base">
                  Our AI is analyzing your room and generating 4 unique design
                  variations. This usually takes about 30 seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Please wait...</span>
              </div>
            </div>
          </section>
        )}

        {/* Generated Results */}
        {generatedImages.length > 0 && (
          <section className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">
                  Your Generated Designs
                </h2>
                <p className="text-muted-foreground">
                  Click on any design to view full size or download
                </p>
              </div>
              <Button variant="outline" className="glass border-border/50 shadow-sm" asChild>
                <Link href="/gallery" className="flex items-center gap-2">
                  View Gallery
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`animate-fade-in stagger-${index + 1}`}
                >
                  <GenerationCard
                    id={image.id}
                    imageUrl={image.imageUrl}
                    isFavorite={image.isFavorite}
                    onFavorite={handleFavorite}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Designs */}
        {!isLoadingRecent && recentDesigns.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">
                  Recent Designs
                </h2>
                <p className="text-muted-foreground">
                  Your previously generated designs
                </p>
              </div>
              <Button variant="ghost" className="hover:bg-accent/50" asChild>
                <Link href="/gallery" className="flex items-center gap-2">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDesigns.slice(0, 4).map((design) => (
                <div key={design.id} className="space-y-3">
                  {design.generations[0] && (
                    <GenerationCard
                      id={design.generations[0].id}
                      imageUrl={design.generations[0].imageUrl}
                      isFavorite={design.generations[0].isFavorite}
                      onFavorite={handleFavorite}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State for New Users */}
        {!selectedImage && !isLoadingRecent && recentDesigns.length === 0 && (
          <section className="py-16 animate-fade-in">
            <div className="text-center max-w-lg mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl glass border border-border/50 flex items-center justify-center shadow-md">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  No designs yet
                </h3>
                <p className="text-muted-foreground">
                  Upload your first room photo above to start creating stunning
                  AI-powered interior designs.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
