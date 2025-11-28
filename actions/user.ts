"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { UpdateUserProfileSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";
import { getUserCredits } from "@/lib/credits";
import { revalidatePath } from "next/cache";

// Re-export auth service functions
export {
  signUp,
  signIn,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "@/lib/services/user.service";

/**
 * Update user profile
 */
export async function updateUserProfile(data: { name?: string; image?: string }) {
  try {
    const userId = await requireUserId();
    const validated = UpdateUserProfileSchema.parse(data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validated,
    });

    logger.info("User profile updated", { userId });
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, user };
  } catch (error) {
    logger.error("Failed to update user profile", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Get user credits balance
 */
export async function getUserCreditBalance() {
  try {
    const userId = await requireUserId();
    const balance = await getUserCredits(userId);

    return { success: true, balance };
  } catch (error) {
    logger.error("Failed to get user credits", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get credits",
    };
  }
}

/**
 * Redeem credits (for promotional codes, etc.)
 */
export async function redeemCredits(code: string) {
  try {
    const userId = await requireUserId();

    // Placeholder - implement actual redemption logic
    // Check code against database of valid codes
    // Award credits if valid

    logger.info("Credit redemption attempted", { userId, code });

    return {
      success: false,
      error: "Invalid redemption code",
    };
  } catch (error) {
    logger.error("Failed to redeem credits", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to redeem credits",
    };
  }
}

