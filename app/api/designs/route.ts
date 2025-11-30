import { NextRequest, NextResponse } from "next/server";
import { getAllDesigns } from "@/actions/generation";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const favoritesOnly = searchParams.get("favorites") === "true";

    const result = await getAllDesigns({
      page,
      limit,
      favoritesOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to fetch designs", error);
    
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}

