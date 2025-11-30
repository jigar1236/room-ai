"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Download,
  Heart,
  Share2,
  Maximize2,
  Check,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface GenerationCardProps {
  id: string;
  imageUrl: string;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  onDownload?: (id: string, format: "png" | "jpg") => void;
  className?: string;
}

export function GenerationCard({
  id,
  imageUrl,
  isFavorite = false,
  onFavorite,
  onDownload,
  className,
}: GenerationCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg" | null>(null);

  const handleDownload = async (format: "png" | "jpg") => {
    setIsDownloading(true);
    setDownloadFormat(format);
    try {
      if (onDownload) {
        await onDownload(id, format);
      } else {
        // Default download behavior
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `roomai-design-${id}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsDownloading(false);
      setDownloadFormat(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RoomAI Design",
          text: "Check out this AI-generated interior design!",
          url: imageUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(imageUrl);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-xl overflow-hidden glass glass-hover gradient-border",
          className
        )}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt="AI Generated Design"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => onFavorite?.(id)}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isFavorite && "fill-red-500 text-red-500"
                  )}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
                onClick={() => handleDownload("jpg")}
                disabled={isDownloading}
              >
                {isDownloading && downloadFormat === "jpg" ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1.5" />
                )}
                JPG
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
                onClick={() => handleDownload("png")}
                disabled={isDownloading}
              >
                {isDownloading && downloadFormat === "png" ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1.5" />
                )}
                PNG
              </Button>
            </div>
          </div>
        </div>

        {/* Favorite badge */}
        {isFavorite && (
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-border/50">
          <VisuallyHidden>
            <DialogTitle>Design Preview</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt="AI Generated Design - Full Size"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() => handleDownload("jpg")}
                disabled={isDownloading}
              >
                {isDownloading && downloadFormat === "jpg" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download JPG
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() => handleDownload("png")}
                disabled={isDownloading}
              >
                {isDownloading && downloadFormat === "png" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PNG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

