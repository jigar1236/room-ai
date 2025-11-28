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
    const roomId = formData.get("roomId") as string;
    const type = formData.get("type") as "original" | "mask" | "item_mask";

    if (!file || !roomId || !type) {
      return NextResponse.json(
        { error: "Missing required fields: file, roomId, type" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Convert file to base64 or upload directly
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload via server action
    const result = await uploadRoomImage(roomId, dataUrl, type);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("File uploaded via API", { roomId, type, userId });

    return NextResponse.json({
      success: true,
      asset: result.asset,
    });
  } catch (error) {
    logger.error("Upload API error", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

