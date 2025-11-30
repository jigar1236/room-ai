import { NextResponse } from "next/server";
import { getRecentDesigns } from "@/actions/generation";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const designs = await getRecentDesigns(8);

    return NextResponse.json({ designs });
  } catch (error) {
    logger.error("Failed to fetch recent designs", error);
    
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}

