import { prisma } from "./prisma";
import { logger } from "./logger";
import { CreditTransactionType } from "@prisma/client";

const FREE_MONTHLY_CREDITS = 5;
const CREDITS_PER_REDESIGN = 1;
const CREDITS_PER_4K_REDESIGN = 5;

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId },
    select: { amount: true },
  });

  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, required: number): Promise<boolean> {
  const balance = await getUserCredits(userId);
  return balance >= required;
}

/**
 * Deduct credits from user account (ACID-safe)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  relatedId?: string
): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
  try {
    // Use transaction to ensure ACID safety
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const transactions = await tx.creditTransaction.findMany({
        where: { userId },
        select: { amount: true },
      });
      const currentBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

      // Check if user has enough credits
      if (currentBalance < amount) {
        throw new Error("Insufficient credits");
      }

      // Create deduction transaction
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.SPENT,
          amount: -amount, // Negative amount for deduction
          description,
          relatedId,
        },
      });

      const newBalance = currentBalance - amount;

      logger.info("Credits deducted", {
        userId,
        amount,
        newBalance,
        transactionId: transaction.id,
      });

      return { success: true, newBalance, transactionId: transaction.id };
    });

    return result;
  } catch (error) {
    logger.error("Failed to deduct credits", error, { userId, amount });
    return {
      success: false,
      newBalance: await getUserCredits(userId),
      error: error instanceof Error ? error.message : "Failed to deduct credits",
    };
  }
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  description: string,
  relatedId?: string
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount,
          description,
          relatedId,
        },
      });

      const transactions = await tx.creditTransaction.findMany({
        where: { userId },
        select: { amount: true },
      });
      const newBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

      logger.info("Credits added", {
        userId,
        amount,
        type,
        newBalance,
        transactionId: transaction.id,
      });

      return { success: true, newBalance, transactionId: transaction.id };
    });

    return result;
  } catch (error) {
    logger.error("Failed to add credits", error, { userId, amount });
    throw error;
  }
}

/**
 * Award free monthly credits to user
 */
export async function awardMonthlyCredits(userId: string): Promise<void> {
  try {
    // Check if credits were already awarded this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const recentTransaction = await prisma.creditTransaction.findFirst({
      where: {
        userId,
        type: CreditTransactionType.EARNED,
        description: "Monthly free credits",
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    if (recentTransaction) {
      logger.info("Monthly credits already awarded", { userId });
      return;
    }

    await addCredits(
      userId,
      FREE_MONTHLY_CREDITS,
      CreditTransactionType.EARNED,
      "Monthly free credits"
    );

    logger.info("Monthly credits awarded", { userId, amount: FREE_MONTHLY_CREDITS });
  } catch (error) {
    logger.error("Failed to award monthly credits", error, { userId });
    throw error;
  }
}

/**
 * Calculate credits required for generation
 */
export function getCreditsRequired(isHighRes: boolean, numVariations: number): number {
  const baseCredits = isHighRes ? CREDITS_PER_4K_REDESIGN : CREDITS_PER_REDESIGN;
  return baseCredits * numVariations;
}

/**
 * Refund credits (e.g., if generation fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalTransactionId: string,
  reason: string
): Promise<void> {
  await addCredits(
    userId,
    amount,
    CreditTransactionType.REFUNDED,
    `Refund: ${reason}`,
    originalTransactionId
  );
}

