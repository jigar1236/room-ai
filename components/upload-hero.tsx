"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, ImageIcon, X, Loader2, Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadHeroProps {
  onImageSelect: (file: File, preview: string) => void;
  isUploading?: boolean;
  className?: string;
}

export function UploadHero({
  onImageSelect,
  isUploading = false,
  className,
}: UploadHeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setPreview(result);
          onImageSelect(file, result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (preview) {
    return (
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden glass gradient-border animate-scale-in",
          className
        )}
      >
        <div className="aspect-video max-h-[500px] overflow-hidden">
          <img
            src={preview}
            alt="Room preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Room Image Ready</p>
              <p className="text-xs text-white/70">
                Select a style below to generate designs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Change Image
          </Button>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm font-medium">Processing your image...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "upload-zone cursor-pointer rounded-2xl p-8 md:p-12 text-center transition-all duration-300",
        isDragging && "dragging",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="max-w-md mx-auto space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse-glow">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold text-foreground">
            Upload Your Room
          </h3>
          <p className="text-muted-foreground">
            Drag and drop your room photo here, or click to browse
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
            <ImageIcon className="w-3.5 h-3.5" />
            PNG, JPG, WEBP
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
            Up to 10MB
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
            Min 512×512px
          </span>
        </div>
        <Button
          size="lg"
          className="btn-shine bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Image
        </Button>
      </div>
    </div>
  );
}

