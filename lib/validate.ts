import { z } from "zod";

// Room Type Enum
export const RoomTypeSchema = z.enum([
  "LIVING_ROOM",
  "BEDROOM",
  "KITCHEN",
  "BATHROOM",
  "DINING_ROOM",
  "OFFICE",
  "BALCONY",
  "OTHER",
]);

// Style Type Enum (updated to include LUXURY_MODERN)
export const StyleTypeSchema = z.enum([
  "MODERN_MINIMALIST",
  "SCANDINAVIAN",
  "INDUSTRIAL",
  "BOHEMIAN",
  "TRADITIONAL",
  "COASTAL",
  "MID_CENTURY_MODERN",
  "JAPANESE_ZEN",
  "CONTEMPORARY",
  "RUSTIC",
  "ART_DECO",
  "MEDITERRANEAN",
  "LUXURY_MODERN",
  "CUSTOM",
]);

// Design Schemas (simplified from Project/Room)
export const CreateDesignSchema = z.object({
  style: StyleTypeSchema,
  roomType: RoomTypeSchema,
  instructions: z.string().max(1000).optional(),
});

// User Profile Schema
export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

// Signup Schema
export const SignUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

// Sign In Schema
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Forgot Password Schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Reset Password Schema
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

// Verify Email Schema
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Razorpay Schemas
export const CreateSubscriptionSchema = z.object({
  planId: z.string(),
});

export const CreateOrderSchema = z.object({
  credits: z.number().int().min(10).max(1000),
});

// Credit Pack Pricing (example: 100 credits = ₹999)
const CREDIT_PACKS = {
  10: 99,
  50: 399,
  100: 699,
  250: 1499,
  500: 2499,
  1000: 3999,
} as const;

export function getCreditPackPrice(credits: number): number {
  return CREDIT_PACKS[credits as keyof typeof CREDIT_PACKS] ?? credits * 10;
}

// File Upload Validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 512; // Minimum width/height
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
    };
  }
  return { valid: true };
}

// Sanitize AI instructions to prevent prompt injection
export function sanitizeInstructions(instructions: string): string {
  let sanitized = instructions
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();

  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

// Validate environment variables
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];
  const optional = [
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "BLOB_READ_WRITE_TOKEN",
    "GOOGLE_CLOUD_PROJECT",
    "GOOGLE_CLOUD_LOCATION",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true, missing: [] };
}
