import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { generateShoppingList } from "@/actions/generation";
import { GenerateShoppingListSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const validated = GenerateShoppingListSchema.parse(body);

    const result = await generateShoppingList(validated.generationId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    logger.info("Shopping list generated via API", {
      generationId: validated.generationId,
      userId,
    });

    return NextResponse.json({
      success: true,
      shoppingList: result.shoppingList,
    });
  } catch (error) {
    logger.error("Shopping list API error", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}

