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
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface GenerationCardProps {
  id: string;
  imageUrl: string;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  onDownload?: (id: string, format: "png") => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function GenerationCard({
  id,
  imageUrl,
  isFavorite = false,
  onFavorite,
  onDownload,
  onDelete,
  className,
}: GenerationCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload(id, "png");
      } else {
        // Default download behavior
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `roomai-design-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsDownloading(false);
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

  const handleDeleteClick = () => {
    if (!onDelete) return;
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-xl overflow-hidden glass glass-hover border border-border/50 shadow-md",
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 shadow-md"
              onClick={() => onFavorite?.(id)}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFavorite && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 shadow-md"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 shadow-md"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 px-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs font-medium border border-white/20 shadow-md"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              PNG
            </Button>
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-white border border-red-500/30 shadow-md"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Favorite badge */}
        {isFavorite && (
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/20">
              <Heart className="w-5 h-5 fill-white text-white" />
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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

