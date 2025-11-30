import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { CreateOrderSchema } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const validated = CreateOrderSchema.parse(body);

    // Calculate amount in paise
      const amount = validated.credits * 10; // Convert to paise

    // Create Razorpay order
    // const order = await createOrder(amount, `credits-${userId}-${Date.now()}`);

    // // Create order record in database
    // const dbOrder = await prisma.order.create({
    //   data: {
    //     userId,
    //     razorpayOrderId: order.id,
    //     amount,
    //     credits: validated.credits,
    //     status: "pending",
    //   },
    // });

    // logger.info("Credit pack order created", {
    //   orderId: order.id,
    //   userId,
    //   credits: validated.credits,
    //   amount,
    // });

    return NextResponse.json({
      success: true,
      // order: {
      //   id: order.id,
      //   amount: order.amount,
      //   currency: order.currency,
      //   status: order.status,
      //   dbId: dbOrder.id,
      // },
    });
  } catch (error) {
    logger.error("Create order API error", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

