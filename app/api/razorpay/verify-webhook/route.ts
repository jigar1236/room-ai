import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/lib/credits";
import { CreditTransactionType, SubscriptionStatus } from "@prisma/client";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const body = await request.text();
    const payload = JSON.parse(body);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      logger.error("Invalid webhook signature", { event: payload.event });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    logger.info("Razorpay webhook received", {
      event: payload.event,
      entity: payload.payload?.entity?.id,
    });

    // Handle different webhook events
    switch (payload.event) {
      case "payment.authorized":
      case "payment.captured":
        await handlePaymentSuccess(payload.payload.payment.entity);
        break;

      case "subscription.activated":
      case "subscription.charged":
        await handleSubscriptionActivated(payload.payload.subscription.entity);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload.payload.subscription.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payload.payment.entity);
        break;

      default:
        logger.warn("Unhandled webhook event", { event: payload.event });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Webhook processing error", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payment: any) {
  try {
    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId: payment.order_id,
        status: "pending",
      },
    });

    if (order) {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "completed",
          razorpayPaymentId: payment.id,
        },
      });

      // Add credits to user
      await addCredits(
        order.userId,
        order.credits,
        CreditTransactionType.PURCHASED,
        `Credit pack purchase - Order ${order.razorpayOrderId}`,
        order.id
      );

      logger.info("Payment processed, credits added", {
        orderId: order.id,
        userId: order.userId,
        credits: order.credits,
      });
    }
  } catch (error) {
    logger.error("Error handling payment success", error);
  }
}

async function handleSubscriptionActivated(subscription: any) {
  try {
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        razorpaySubscriptionId: subscription.id,
      },
    });

    if (dbSubscription) {
      // Determine monthly credits based on plan (would map from plan_id)
      const monthlyCredits = 100; // Default - would be based on plan

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          monthlyCredits,
          currentPeriodStart: new Date(subscription.current_start * 1000),
          currentPeriodEnd: new Date(subscription.current_end * 1000),
        },
      });

      // Award monthly credits
      await addCredits(
        dbSubscription.userId,
        monthlyCredits,
        CreditTransactionType.SUBSCRIPTION_BONUS,
        `Monthly subscription credits - ${subscription.id}`,
        dbSubscription.id
      );

      logger.info("Subscription activated, credits awarded", {
        subscriptionId: subscription.id,
        userId: dbSubscription.userId,
        credits: monthlyCredits,
      });
    }
  } catch (error) {
    logger.error("Error handling subscription activation", error);
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        razorpaySubscriptionId: subscription.id,
      },
    });

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      logger.info("Subscription cancelled", {
        subscriptionId: subscription.id,
        userId: dbSubscription.userId,
      });
    }
  } catch (error) {
    logger.error("Error handling subscription cancellation", error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        razorpayOrderId: payment.order_id,
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "failed",
        },
      });

      logger.info("Payment failed", {
        orderId: order.id,
        paymentId: payment.id,
      });
    }
  } catch (error) {
    logger.error("Error handling payment failure", error);
  }
}

