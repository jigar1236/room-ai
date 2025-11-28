import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { createSubscription } from "@/lib/razorpay";
import { CreateSubscriptionSchema } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const validated = CreateSubscriptionSchema.parse(body);

    // Get user email for Razorpay customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Create Razorpay customer (if not exists) and subscription
    // Note: In production, you'd create/retrieve Razorpay customer first
    const subscription = await createSubscription(
      validated.planId,
      userId, // Using userId as customer identifier
      {
        userId,
        email: user.email,
      }
    );

    // Create subscription record in database
    const dbSubscription = await prisma.subscription.create({
      data: {
        userId,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: validated.planId,
        status: "ACTIVE",
        planName: validated.planId, // Would map to actual plan name
        monthlyCredits: 0, // Would be set based on plan
      },
    });

    logger.info("Subscription created", {
      subscriptionId: subscription.id,
      userId,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        dbId: dbSubscription.id,
      },
    });
  } catch (error) {
    logger.error("Create subscription API error", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

