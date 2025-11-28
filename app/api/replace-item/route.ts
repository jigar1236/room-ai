import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { replaceFurniture } from "@/actions/generation";
import { ReplaceFurnitureSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const validated = ReplaceFurnitureSchema.parse(body);

    const result = await replaceFurniture(validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("Furniture replacement started via API", {
      generationId: result.generation?.id,
      userId,
    });

    return NextResponse.json({
      success: true,
      generation: result.generation,
    });
  } catch (error) {
    logger.error("Replace item API error", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to replace furniture" },
      { status: 500 }
    );
  }
}

