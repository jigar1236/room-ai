import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { startGeneration } from "@/actions/generation";
import { StartGenerationSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const validated = StartGenerationSchema.parse(body);

    const result = await startGeneration(validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("Generation started via API", { generationId: result.generation?.id, userId });

    return NextResponse.json({
      success: true,
      generation: result.generation,
    });
  } catch (error) {
    logger.error("Generate API error", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start generation" },
      { status: 500 }
    );
  }
}

