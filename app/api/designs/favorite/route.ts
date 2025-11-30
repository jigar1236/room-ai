"use server";

import { NextRequest, NextResponse } from "next/server";

import { toggleFavorite } from "@/actions/generation";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const result = await toggleFavorite(imageId);

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to toggle favorite", error);

    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}
