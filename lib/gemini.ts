import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";
import { sanitizeInstructions } from "./validate";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

/**
 * MASTER AI PROMPT - Single unified prompt for all generation modes
 */
export const MASTER_AI_PROMPT = `
You are an advanced interior design rendering engine using Gemini 2.5 Flash. Always maintain correct geometry, camera perspective, room structure, walls, ceiling, and window alignment. Avoid faces, text, watermarks, logos, distortions.

INPUTS:
room_image_url: {{room_image_url}}
mask_url: {{mask_url}}
item_mask_url: {{item_mask_url}}
mode: {{mode}} ("redesign" | "replace" | "moodboard" | "shopping_list")
room_type: {{room_type}}
style: {{style}}
keep_furniture: {{keep_furniture}}
num_variations: {{num_variations}}
instructions: {{instructions}}

BEHAVIOR PER MODE:

1) REDESIGN:
- Convert the room into {{style}} interior style.
- Use segmentation mask to preserve geometry.
- Replace furniture only if keep_furniture=false.
- Apply realistic decor, materials, flooring, curtains, lighting.
- Generate {{num_variations}} photorealistic high-quality outputs.
- Include metadata: {colors, materials, textures, shopping_queries}.

2) REPLACE:
- Replace item indicated by item mask.
- Must preserve shadows, reflections, lighting, perspective.
- Generate 3 options with metadata.

3) MOODBOARD:
- Generate an A3 moodboard for {{style}} {{room_type}}.
- Include color palette (HEX), 6–9 textures, 3 furniture references.
- Return metadata.

4) SHOPPING LIST:
- Analyze final image.
- Return JSON:
  [{title, description, approx_dimensions_cm, material, color, ecommerce_search_query, price_range}]

NEGATIVE:
No text, no brands, no people, no warped geometry.

Output ALWAYS includes a valid JSON metadata section.
`;

export interface GenerationInput {
  roomImageUrl: string;
  maskUrl?: string;
  itemMaskUrl?: string;
  mode: "redesign" | "replace" | "moodboard" | "shopping_list";
  roomType: string;
  style?: string;
  keepFurniture?: boolean;
  numVariations?: number;
  instructions?: string;
}

export interface GenerationOutput {
  images: string[]; // Base64 or URLs
  metadata: {
    colors?: string[];
    materials?: string[];
    textures?: string[];
    shopping_queries?: string[];
    shopping_list?: Array<{
      title: string;
      description: string;
      approx_dimensions_cm?: string;
      material?: string;
      color?: string;
      ecommerce_search_query?: string;
      price_range?: string;
    }>;
  };
}

/**
 * Generate room redesign using Gemini 2.5 Flash
 */
export async function generateRoomRedesign(input: GenerationInput): Promise<GenerationOutput> {
  try {
    const sanitizedInstructions = input.instructions
      ? sanitizeInstructions(input.instructions)
      : undefined;

    const prompt = MASTER_AI_PROMPT
      .replace("{{room_image_url}}", input.roomImageUrl)
      .replace("{{mask_url}}", input.maskUrl || "")
      .replace("{{item_mask_url}}", input.itemMaskUrl || "")
      .replace("{{mode}}", input.mode)
      .replace("{{room_type}}", input.roomType)
      .replace("{{style}}", input.style || "")
      .replace("{{keep_furniture}}", String(input.keepFurniture ?? false))
      .replace("{{num_variations}}", String(input.numVariations ?? 4))
      .replace("{{instructions}}", sanitizedInstructions || "");

    logger.info("Calling Gemini API", { mode: input.mode, roomType: input.roomType });

    // For image generation, we'll use the vision capabilities
    // Note: Gemini 2.5 Flash may require different approach for image generation
    // This is a placeholder - actual implementation depends on Gemini API capabilities
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response - Gemini may return JSON or structured text
    // In production, you'd need to parse the actual response format
    let metadata = {};
    try {
      metadata = JSON.parse(text);
    } catch {
      // If not JSON, extract metadata from text
      metadata = { raw_response: text };
    }

    // For actual image generation, you might need to:
    // 1. Use a different Gemini endpoint for image generation
    // 2. Or use Gemini to generate prompts for another image model
    // 3. Or use Gemini Vision API with image inputs

    logger.info("Gemini generation completed", { mode: input.mode });

    return {
      images: [], // Placeholder - actual images would come from image generation API
      metadata: metadata as GenerationOutput["metadata"],
    };
  } catch (error) {
    logger.error("Gemini generation failed", error, { mode: input.mode });
    throw new Error("AI generation failed. Please try again.");
  }
}

/**
 * Generate image variations using Gemini
 * This is a simplified version - actual implementation would use image generation API
 */
export async function generateImageVariations(
  baseImageUrl: string,
  prompt: string,
  numVariations: number = 4
): Promise<string[]> {
  try {
    logger.info("Generating image variations", { numVariations });

    // Placeholder - actual implementation would:
    // 1. Download base image
    // 2. Call image generation API (e.g., Imagen, DALL-E, Stable Diffusion)
    // 3. Return array of image URLs or base64

    // For now, return empty array
    // In production, integrate with actual image generation service
    return [];
  } catch (error) {
    logger.error("Failed to generate image variations", error);
    throw new Error("Failed to generate image variations");
  }
}

/**
 * Upscale and denoise image
 */
export async function upscaleAndDenoiseImage(imageUrl: string): Promise<string> {
  try {
    logger.info("Upscaling and denoising image", { imageUrl });

    // Placeholder - actual implementation would:
    // 1. Download image from URL
    // 2. Use upscaling service (e.g., Real-ESRGAN, Topaz, or API service)
    // 3. Apply denoising
    // 4. Upload result and return URL

    // For now, return original URL
    return imageUrl;
  } catch (error) {
    logger.error("Failed to upscale image", error);
    throw new Error("Failed to upscale image");
  }
}

/**
 * Validate generated image (no text, no warping)
 */
export async function validateGeneratedImage(imageUrl: string): Promise<{
  valid: boolean;
  issues: string[];
}> {
  try {
    // Placeholder - actual implementation would:
    // 1. Download and analyze image
    // 2. Use vision API to detect text, warping, faces
    // 3. Return validation result

    return {
      valid: true,
      issues: [],
    };
  } catch (error) {
    logger.error("Failed to validate image", error);
    return {
      valid: false,
      issues: ["Validation failed"],
    };
  }
}

