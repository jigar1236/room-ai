"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Gallery } from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StyleType } from "@prisma/client";

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

export default function GalleryPage() {
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await fetch(`/api/designs?page=${pageNum}&limit=20`);
      if (!response.ok) throw new Error("Failed to load designs");

      const data = await response.json();
      
      if (append) {
        setDesigns((prev) => [...prev, ...data.designs]);
      } else {
        setDesigns(data.designs || []);
      }
      
      setHasMore(data.pagination?.page < data.pagination?.pages);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to load designs");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadDesigns(page + 1, true);
    }
  };

  const handleFavorite = async (imageId: string) => {
    try {
      const response = await fetch("/api/designs/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      if (response.ok) {
        setDesigns((prev) =>
          prev.map((design) => ({
            ...design,
            generations: design.generations.map((gen) =>
              gen.id === imageId
                ? { ...gen, isFavorite: !gen.isFavorite }
                : gen
            ),
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  const handleDelete = async (designId: string) => {
    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDesigns((prev) => prev.filter((d) => d.id !== designId));
        toast.success("Design deleted");
      }
    } catch (error) {
      toast.error("Failed to delete design");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Your Gallery
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage all your AI-generated interior designs
            </p>
          </div>
          <Button asChild className="btn-shine">
            <Link href="/dashboard">
              <Plus className="w-4 h-4 mr-2" />
              Create New Design
            </Link>
          </Button>
        </div>

        {/* Gallery Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : designs.length > 0 ? (
          <>
            <Gallery
              designs={designs}
              onFavorite={handleFavorite}
              onDelete={handleDelete}
            />
            
            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              No designs yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start creating stunning AI-powered interior designs. Upload a room
              photo and let our AI transform it into your dream space.
            </p>
            <Button asChild size="lg" className="btn-shine">
              <Link href="/dashboard">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Design
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

