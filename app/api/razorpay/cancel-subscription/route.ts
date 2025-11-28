import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { cancelSubscription } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 }
      );
    }

    // Verify subscription ownership
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        razorpaySubscriptionId: subscriptionId,
        userId,
      },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        { error: "Subscription not found or unauthorized" },
        { status: 404 }
      );
    }

    // Cancel in Razorpay
    await cancelSubscription(subscriptionId);

    // Update in database
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "CANCELLED",
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });

    logger.info("Subscription cancelled", {
      subscriptionId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    logger.error("Cancel subscription API error", error);

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

