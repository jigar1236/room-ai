import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "./logger";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Lazy initialization to avoid errors during build
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

/**
 * Verify Razorpay webhook signature using SHA256 HMAC
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    logger.warn(
      "RAZORPAY_WEBHOOK_SECRET not set, skipping webhook verification"
    );
    return true; // In development, allow if secret not set
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      logger.error("Invalid Razorpay webhook signature", {
        received: signature.substring(0, 10) + "...",
        expected: expectedSignature.substring(0, 10) + "...",
      });
    }

    return isValid;
  } catch (error) {
    logger.error("Error verifying webhook signature", error);
    return false;
  }
}

/**
 * Create Razorpay subscription
 */
export async function createSubscription(
  planId: string,
  customerId: string,
  metadata?: Record<string, unknown>
) {
  try {
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: (metadata as Record<string, string>) || {},
    });

    logger.info("Razorpay subscription created", {
      subscriptionId: subscription.id,
      planId,
      customerId,
    });

    return subscription;
  } catch (error) {
    logger.error("Failed to create Razorpay subscription", error, {
      planId,
      customerId,
    });
    throw error;
  }
}

/**
 * Create Razorpay order for credit pack
 */
export async function createOrder(
  amount: number, // in paise
  receipt: string,
  notes?: Record<string, unknown>
) {
  try {
    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: (notes as Record<string, string>) || {},
    });

    logger.info("Razorpay order created", { orderId: order.id, amount });

    return order;
  } catch (error) {
    logger.error("Failed to create Razorpay order", error, { amount, receipt });
    throw error;
  }
}

/**
 * Cancel Razorpay subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await getRazorpay().subscriptions.cancel(subscriptionId);

    logger.info("Razorpay subscription cancelled", { subscriptionId });

    return subscription;
  } catch (error) {
    logger.error("Failed to cancel Razorpay subscription", error, {
      subscriptionId,
    });
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await getRazorpay().subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error("Failed to fetch Razorpay subscription", error, {
      subscriptionId,
    });
    throw error;
  }
}

/**
 * Get payment details
 */
export async function getPayment(paymentId: string) {
  try {
    const payment = await getRazorpay().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error("Failed to fetch Razorpay payment", error, { paymentId });
    throw error;
  }
}
