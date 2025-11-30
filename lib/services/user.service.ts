"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { awardMonthlyCredits } from "@/lib/credits";
import {
  SignUpSchema,
  SignInSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from "@/lib/validate";
import { sendEmail, getAppUrl } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { render } from "@react-email/render";
import VerificationEmail from "@/emails/verification-email";
import PasswordResetEmail from "@/emails/password-reset-email";

// Token expiry times
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = SignUpSchema.parse(data);

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
        include: {
          emailVerificationTokens: {
            where: {
              expires: {
                gt: new Date(),
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });
    } catch (dbError: any) {
      logger.error("Database connection error", dbError);
      // Check if it's a connection error
      if (dbError?.message?.includes("Can't reach database server") || 
          dbError?.code === "P1001" || 
          dbError?.code === "P1017") {
        return {
          success: false,
          error: "Unable to connect to the database. Please try again later.",
        };
      }
      // Re-throw other database errors
      throw dbError;
    }

    if (existingUser) {
      // If user exists but email is not verified, check if we should resend
      if (!existingUser.emailVerified) {
        const hasValidToken = existingUser.emailVerificationTokens.length > 0;
        if (hasValidToken) {
          return {
            success: false,
            message: "A verification email has already been sent. Please check your inbox or wait before requesting another.",
          };
        }
        // User exists but no valid token, create new one
        try {
          const token = generateToken();
          await prisma.emailVerificationToken.create({
            data: {
              token,
              userId: existingUser.id,
              expires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
            },
          });

          const verificationUrl = getAppUrl(`/auth/verify-email?token=${token}`);
          const emailHtml = await render(
            VerificationEmail({
              verificationUrl,
              userName: existingUser.name || undefined,
            })
          );

          await sendEmail({
            to: validated.email,
            subject: "Verify your RoomAI email address",
            html: emailHtml,
          });

          return {
            success: false,
            message: "A verification email has been sent. Please check your inbox.",
          };
        } catch (dbError: any) {
          logger.error("Database error while creating verification token", dbError);
          if (dbError?.message?.includes("Can't reach database server") || 
              dbError?.code === "P1001" || 
              dbError?.code === "P1017") {
            return {
              success: false,
              error: "Unable to connect to the database. Please try again later.",
            };
          }
          throw dbError;
        }
      }

      return {
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          password: hashedPassword,
        },
      });
    } catch (dbError: any) {
      logger.error("Database error while creating user", dbError);
      // Check if it's a connection error
      if (dbError?.message?.includes("Can't reach database server") || 
          dbError?.code === "P1001" || 
          dbError?.code === "P1017") {
        return {
          success: false,
          error: "Unable to connect to the database. Please try again later.",
        };
      }
      // Check if it's a unique constraint violation (user was created between check and create)
      if (dbError?.code === "P2002") {
        return {
          success: false,
          message: "An account with this email already exists. Please sign in instead.",
        };
      }
      // Re-throw other database errors
      throw dbError;
    }

    // Create verification token
    let token;
    try {
      token = generateToken();
      await prisma.emailVerificationToken.create({
        data: {
          token,
          userId: user.id,
          expires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
        },
      });
    } catch (dbError: any) {
      logger.error("Database error while creating verification token", dbError);
      if (dbError?.message?.includes("Can't reach database server") || 
          dbError?.code === "P1001" || 
          dbError?.code === "P1017") {
        return {
          success: false,
          error: "Unable to connect to the database. Please try again later.",
        };
      }
      throw dbError;
    }

    // Send verification email
    const verificationUrl = getAppUrl(`/auth/verify-email?token=${token}`);
    const emailHtml = await render(
      VerificationEmail({
        verificationUrl,
        userName: validated.name,
      })
    );

    await sendEmail({
      to: validated.email,
      subject: "Verify your RoomAI email address",
      html: emailHtml,
    });

    logger.info("New user signed up", {
      userId: user.id,
      email: user.email,
    });

    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    logger.error("Failed to sign up user", error);
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = SignInSchema.parse(data);

    // Check if user exists and is verified
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    if (!user.emailVerified) {
      return {
        success: false,
        error: "Please verify your email before signing in. Check your inbox for the verification link.",
      };
    }

    if (!user.password) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validated.password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Return success - client will handle NextAuth signIn
    return { success: true };
  } catch (error) {
    logger.error("Failed to sign in user", error);
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
}

/**
 * Verify email address with token
 */
export async function verifyEmail(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const token = formData.get("token") as string;
    const validated = VerifyEmailSchema.parse({ token });

    // Find token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: validated.token },
      include: { user: true },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: "Invalid or expired verification token",
      };
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return {
        success: false,
        error: "Verification token has expired. Please request a new one.",
      };
    }

    // Check if already verified
    if (verificationToken.user.emailVerified) {
      // Delete token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return {
        success: true,
        message: "Email already verified",
      };
    }

    // Verify email and award credits
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      });

      await tx.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      // Award monthly credits for verified user
      await awardMonthlyCredits(verificationToken.userId);
    });

    logger.info("Email verified", {
      userId: verificationToken.userId,
      email: verificationToken.user.email,
    });

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
    };
  } catch (error) {
    logger.error("Failed to verify email", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        emailVerificationTokens: {
          where: {
            expires: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: "Email is already verified",
      };
    }

    // Delete any existing valid tokens before creating a new one
    // This allows users to resend verification emails if they didn't receive the first one
    if (user.emailVerificationTokens.length > 0) {
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
          expires: {
            gt: new Date(), // Only delete tokens that haven't expired yet
          },
        },
      });
    }

    // Create new token
    const token = generateToken();
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
      },
    });

    // Send email
    const verificationUrl = getAppUrl(`/auth/verify-email?token=${token}`);
    const emailHtml = await render(
      VerificationEmail({
        verificationUrl,
        userName: user.name || undefined,
      })
    );

    await sendEmail({
      to: user.email,
      subject: "Verify your RoomAI email address",
      html: emailHtml,
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    logger.error("Failed to resend verification email", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend verification email",
    };
  }
}

/**
 * Send password reset email
 */
export async function forgotPassword(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const data = {
      email: formData.get("email") as string,
    };

    const validated = ForgotPasswordSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: {
        passwordResetTokens: {
          where: {
            expires: {
              gt: new Date(),
            },
          },
        },
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      };
    }

    // Check if there's a valid token
    if (user.passwordResetTokens.length > 0) {
      return {
        success: false,
        error: "A password reset email has already been sent. Please check your inbox.",
      };
    }

    // Create reset token
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
      },
    });

    // Send email
    const resetUrl = getAppUrl(`/auth/reset-password?token=${token}`);
    const emailHtml = await render(
      PasswordResetEmail({
        resetUrl,
        userName: user.name || undefined,
      })
    );

    await sendEmail({
      to: user.email,
      subject: "Reset your RoomAI password",
      html: emailHtml,
    });

    logger.info("Password reset email sent", {
      userId: user.id,
      email: user.email,
    });

    return {
      success: true,
      message: "Password reset email sent! Please check your inbox.",
    };
  } catch (error) {
    logger.error("Failed to send password reset email", error);
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Invalid email address",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send password reset email",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const data = {
      token: formData.get("token") as string,
      password: formData.get("password") as string,
    };

    const validated = ResetPasswordSchema.parse(data);

    // Find token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validated.token },
      include: { user: true },
    });

    if (!resetToken) {
      return {
        success: false,
        error: "Invalid or expired reset token",
      };
    }

    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return {
        success: false,
        error: "Reset token has expired. Please request a new one.",
      };
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Delete all reset tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      });
    });

    logger.info("Password reset successful", {
      userId: resetToken.userId,
      email: resetToken.user.email,
    });

    return {
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    };
  } catch (error) {
    logger.error("Failed to reset password", error);
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

