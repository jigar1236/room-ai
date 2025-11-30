import { NextRequest, NextResponse } from "next/server";
import { createDesign } from "@/actions/generation";
import { StyleType, RoomType } from "@prisma/client";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const style = formData.get("style") as StyleType;
    const roomType = formData.get("roomType") as RoomType;
    const instructions = formData.get("instructions") as string | null;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    if (!style) {
      return NextResponse.json(
        { error: "Style is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await createDesign({
      imageBuffer: buffer,
      imageName: image.name,
      imageMimeType: image.type,
      style,
      roomType: roomType || "LIVING_ROOM",
      instructions: instructions || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Generation API error", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate design",
      },
      { status: 500 }
    );
  }
}
