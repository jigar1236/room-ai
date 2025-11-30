"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GenerationCard } from "@/components/generation-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Heart,
  Grid3X3,
  LayoutGrid,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { StyleType } from "@prisma/client";
import { DESIGN_STYLES } from "./style-grid";

interface GalleryImage {
  id: string;
  imageUrl: string;
  isFavorite: boolean;
  createdAt: string;
}

interface GalleryDesign {
  id: string;
  originalUrl: string;
  style: StyleType | null;
  roomType: string;
  createdAt: string;
  generations: GalleryImage[];
}

interface GalleryProps {
  designs: GalleryDesign[];
  onFavorite?: (imageId: string) => void;
  onDelete?: (designId: string) => void;
  className?: string;
}

export function Gallery({
  designs,
  onFavorite,
  onDelete,
  className,
}: GalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"masonry" | "grid">("masonry");

  // Get all images from designs
  const allImages = designs.flatMap((design) =>
    design.generations.map((gen) => ({
      ...gen,
      designId: design.id,
      style: design.style,
      roomType: design.roomType,
      originalUrl: design.originalUrl,
      designCreatedAt: design.createdAt,
    }))
  );

  // Apply filters
  const filteredImages = allImages.filter((image) => {
    if (showFavoritesOnly && !image.isFavorite) return false;
    if (filterStyle !== "all" && image.style !== filterStyle) return false;
    return true;
  });

  const handleDownload = async (imageId: string, format: "png" | "jpg") => {
    const image = allImages.find((img) => img.id === imageId);
    if (!image) return;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roomai-design-${imageId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Image downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px] bg-card"
            />
          </div>
          <Select value={filterStyle} onValueChange={setFilterStyle}>
            <SelectTrigger className="w-[160px] bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {DESIGN_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-2"
          >
            <Heart
              className={cn(
                "w-4 h-4",
                showFavoritesOnly && "fill-current"
              )}
            />
            Favorites
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "masonry" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("masonry")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredImages.length} images</span>
        <span>•</span>
        <span>{designs.length} designs</span>
        {showFavoritesOnly && (
          <>
            <span>•</span>
            <span className="text-primary flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              Showing favorites only
            </span>
          </>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
        <div
          className={cn(
            viewMode === "masonry"
              ? "masonry-grid"
              : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          )}
        >
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                viewMode === "masonry" && "masonry-item",
                `animate-fade-in stagger-${Math.min((index % 6) + 1, 6)}`
              )}
            >
              <GenerationCard
                id={image.id}
                imageUrl={image.imageUrl}
                isFavorite={image.isFavorite}
                onFavorite={onFavorite}
                onDownload={handleDownload}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            No designs found
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {showFavoritesOnly
              ? "You haven't favorited any designs yet. Click the heart icon on a design to add it to your favorites."
              : filterStyle !== "all"
              ? "No designs match the selected filter. Try a different style or clear the filter."
              : "Start by uploading a room photo and generating some designs!"}
          </p>
          {(showFavoritesOnly || filterStyle !== "all") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setShowFavoritesOnly(false);
                setFilterStyle("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

