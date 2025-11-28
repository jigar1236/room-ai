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

// Style Type Enum
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
  "CUSTOM",
]);

// Generation Mode Schema
export const GenerationModeSchema = z.enum(["redesign", "replace", "moodboard", "shopping_list"]);

// Project Schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// Room Schemas
export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  roomType: RoomTypeSchema,
  projectId: z.string().cuid(),
});

export const UpdateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  roomType: RoomTypeSchema.optional(),
});

// Generation Schemas
export const StartGenerationSchema = z.object({
  roomId: z.string().cuid(),
  mode: GenerationModeSchema,
  style: StyleTypeSchema.optional(),
  roomType: RoomTypeSchema,
  numVariations: z.number().int().min(1).max(8).default(4),
  keepFurniture: z.boolean().default(false),
  instructions: z.string().max(1000).optional(),
  isHighRes: z.boolean().default(false), // 4K = 5 credits, standard = 1 credit
});

export const ReplaceFurnitureSchema = z.object({
  roomId: z.string().cuid(),
  itemMaskUrl: z.string().url(),
  style: StyleTypeSchema.optional(),
  instructions: z.string().max(1000).optional(),
});

export const GenerateMoodboardSchema = z.object({
  roomId: z.string().cuid(),
  roomType: RoomTypeSchema,
  style: StyleTypeSchema,
});

export const GenerateShoppingListSchema = z.object({
  generationId: z.string().cuid(),
});

// Upload Schemas
export const UploadRoomImageSchema = z.object({
  roomId: z.string().cuid(),
  type: z.enum(["original", "mask", "item_mask"]),
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
  password: z.string().min(8).regex(/[A-Z]/, "Password must contain at least one uppercase letter")
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
  password: z.string().min(8).regex(/[A-Z]/, "Password must contain at least one uppercase letter")
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
  10: 99,    // ₹0.99 per credit
  50: 399,   // ₹7.98 per credit
  100: 699,  // ₹6.99 per credit
  250: 1499, // ₹5.996 per credit
  500: 2499, // ₹4.998 per credit
  1000: 3999, // ₹3.999 per credit
} as const;

export function getCreditPackPrice(credits: number): number {
  return CREDIT_PACKS[credits as keyof typeof CREDIT_PACKS] ?? credits * 10;
}

// File Upload Validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` };
  }
  return { valid: true };
}

// Sanitize AI instructions to prevent prompt injection
export function sanitizeInstructions(instructions: string): string {
  // Remove potentially dangerous patterns
  let sanitized = instructions
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();

  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

