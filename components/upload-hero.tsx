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
          "relative rounded-xl overflow-hidden glass border border-border/50 shadow-lg animate-scale-in",
          className
        )}
      >
        <div className="relative w-full h-[500px] overflow-hidden">
          <img
            src={preview}
            alt="Room preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isUploading}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white shadow-md z-10"
        >
          <X className="w-4 h-4 mr-2" />
          Change Image
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-md">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Room Image Ready</p>
              <p className="text-sm text-white/80">
                Select a style below to generate designs
              </p>
            </div>
          </div>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-base font-semibold">Processing your image...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "upload-zone cursor-pointer rounded-xl p-10 md:p-14 text-center transition-all duration-300",
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
      <div className="max-w-lg mx-auto space-y-8">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-2xl glass border-2 border-primary/30 flex items-center justify-center animate-pulse-glow shadow-lg">
            <Upload className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl glass border border-accent/30 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-foreground">
            Upload Your Room
          </h3>
          <p className="text-muted-foreground text-base">
            Drag and drop your room photo here, or click to browse
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border/50">
            <ImageIcon className="w-4 h-4 text-primary" />
            PNG, JPG, WEBP
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border/50">
            Up to 10MB
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border/50">
            Min 512×512px
          </span>
        </div>
        <Button
          size="lg"
          className="btn-shine bg-gradient-to-r from-primary via-primary/90 to-primary hover:shadow-xl text-base px-8 h-12 rounded-xl shadow-lg font-semibold"
        >
          <Upload className="w-5 h-5 mr-2" />
          Choose Image
        </Button>
      </div>
    </div>
  );
}

