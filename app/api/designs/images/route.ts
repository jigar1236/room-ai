import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/actions/generation";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await deleteImage(imageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete image", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to delete image",
      },
      { status: 500 }
    );
  }
}
