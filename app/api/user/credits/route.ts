import { NextResponse } from "next/server";
import { getUserCredits } from "@/lib/credits";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await auth();

    logger.info("Credits API called", {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { credits: 0, totalCredits: 100, error: "Not authenticated" },
        { status: 200 } // Return 200 so frontend doesn't fail
      );
    }

    const credits = await getUserCredits(session.user.id);

    return NextResponse.json({
      credits,
      totalCredits: 100,
    });
  } catch (error) {
    logger.error("Failed to fetch credits", error);

    return NextResponse.json(
      { credits: 0, totalCredits: 100, error: "Failed to fetch" },
      { status: 200 }
    );
  }
}
