"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { StyleType } from "@prisma/client";

export interface StyleOption {
  id: StyleType;
  name: string;
  description: string;
  thumbnail: string;
}

export const DESIGN_STYLES: StyleOption[] = [
  {
    id: "MODERN_MINIMALIST",
    name: "Modern Minimalist",
    description: "Clean lines, neutral colors, functional simplicity",
    thumbnail: "/modern-minimalist-interior.png",
  },
  {
    id: "SCANDINAVIAN",
    name: "Scandinavian",
    description: "Light woods, cozy textures, natural light",
    thumbnail: "/scandinavian-interior.png",
  },
  {
    id: "INDUSTRIAL",
    name: "Industrial",
    description: "Exposed brick, metal accents, urban edge",
    thumbnail: "/industrial-interior.png",
  },
  {
    id: "BOHEMIAN",
    name: "Bohemian",
    description: "Eclectic patterns, rich colors, global influences",
    thumbnail: "/bohemian-interior.png",
  },
  {
    id: "MID_CENTURY_MODERN",
    name: "Mid-Century Modern",
    description: "Retro charm with organic curves",
    thumbnail: "/mid-century-modern-living-room.png",
  },
  {
    id: "COASTAL",
    name: "Coastal",
    description: "Beach-inspired blues, whites, natural textures",
    thumbnail: "/coastal-interior-design.jpg",
  },
  {
    id: "TRADITIONAL",
    name: "Traditional",
    description: "Timeless elegance with rich fabrics",
    thumbnail: "/traditional-interior.png",
  },
  {
    id: "JAPANESE_ZEN",
    name: "Japanese Zen",
    description: "Peaceful minimalism with natural materials",
    thumbnail: "/japanese-zen-interior.jpg",
  },
  {
    id: "LUXURY_MODERN",
    name: "Luxury Modern",
    description: "Premium finishes, sophisticated palette",
    thumbnail: "/modern-apartment-living-room.png",
  },
  {
    id: "CONTEMPORARY",
    name: "Contemporary",
    description: "Current trends, bold statements",
    thumbnail: "/modern-home-office.png",
  },
  {
    id: "RUSTIC",
    name: "Rustic",
    description: "Natural wood, warm textures, cozy vibes",
    thumbnail: "/industrial-loft-interior.jpg",
  },
  {
    id: "ART_DECO",
    name: "Art Deco",
    description: "Geometric patterns, glamorous details",
    thumbnail: "/beach-house-interior.png",
  },
];

interface StyleGridProps {
  selectedStyle: StyleType | null;
  onSelect: (style: StyleType) => void;
  className?: string;
}

export function StyleGrid({ selectedStyle, onSelect, className }: StyleGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-display text-xl font-semibold">Choose Your Style</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Select the design style that best matches your vision
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {DESIGN_STYLES.map((style, index) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "group relative rounded-xl overflow-hidden transition-all duration-300 opacity-0 animate-fade-in",
              `stagger-${Math.min(index + 1, 6)}`,
              selectedStyle === style.id
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:ring-1 hover:ring-border"
            )}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={style.thumbnail}
                alt={style.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-medium text-white">{style.name}</p>
              <p className="text-xs text-white/70 line-clamp-1">{style.description}</p>
            </div>
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                selectedStyle === style.id
                  ? "bg-primary/10"
                  : "bg-transparent group-hover:bg-white/5"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

