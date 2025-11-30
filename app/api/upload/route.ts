import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { uploadRoomImage } from "@/actions/generation";
import { validateImageFile } from "@/lib/validate";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: file, projectId" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload via server action - new signature: (projectId, file)
    const result = await uploadRoomImage(projectId, file);

    logger.info("File uploaded via API", { roomId: result.roomId, projectId, userId });

    return NextResponse.json({
      success: true,
      roomId: result.roomId,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    logger.error("Upload API error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

