/**
 * AI Gateway Image Generation Provider
 * Uses AI Gateway API for image generation
 *
 * This version is optimized for interior design:
 * - Uses user-uploaded room photo as base
 * - Preserves architecture & perspective
 * - Applies chosen style + custom instructions
 */

import { RoomType, StyleType } from "@prisma/client";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
const AI_GATEWAY_ENDPOINT = process.env.AI_GATEWAY_ENDPOINT || "https://api.aigateway.com/v1/images/generate";
const AI_GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || "stable-diffusion-xl";

// --- STYLE PROMPTS (INTERIOR DESIGN FOCUSED) ---
const STYLE_PROMPTS: Record<StyleType, string> = {
  MODERN_MINIMALIST:
    "Apply modern minimalist interior design: clean lines, neutral palette, hidden storage, matte finishes, simple geometric furniture, minimal décor, focus on space and light.",
  SCANDINAVIAN:
    "Apply Scandinavian design: light oak wood furniture, white or light walls, pastel accents, soft textiles, cozy hygge feel, simple forms, plants, lots of natural light.",
  INDUSTRIAL:
    "Apply industrial design: exposed brick, metal fixtures, concrete textures, visible pipes, raw materials, leather seating, loft-style vibe, moody warm lighting.",
  BOHEMIAN:
    "Apply bohemian design: layered colorful textiles, patterns, many indoor plants, rattan and wood furniture, eclectic art, relaxed and artistic atmosphere.",
  TRADITIONAL:
    "Apply traditional design: classic furniture, rich woods, elegant moldings, neutral base with deep accent colors, symmetry, timeless and formal but comfortable.",
  COASTAL:
    "Apply coastal design: white and beige base, ocean blue accents, light woods, rattan and jute textures, airy curtains, relaxed beach house feeling.",
  MID_CENTURY_MODERN:
    "Apply mid-century modern design: low-profile wood furniture, tapered legs, simple organic shapes, warm woods, muted bold colors, minimal clutter.",
  JAPANESE_ZEN:
    "Apply Japanese zen design: low minimal furniture, natural woods, tatami-like textures, shoji-inspired surfaces, soft indirect lighting, calm and balanced space.",
  CONTEMPORARY:
    "Apply contemporary design: clean lines, mixed materials, neutral base with bold art accents, large statement pieces, refined and current design trends.",
  RUSTIC:
    "Apply rustic design: reclaimed wood, stone accents, cozy textiles, farmhouse elements, warm earthy colors, visible grain and natural textures.",
  ART_DECO:
    "Apply art deco design: bold geometric patterns, lacquered and glossy finishes, metallic accents (gold, brass), deep jewel tones, glamorous 1920s feel.",
  MEDITERRANEAN:
    "Apply Mediterranean design: warm earthy walls, terracotta or stone flooring, arches, wrought iron details, rustic wood, relaxed villa atmosphere.",
  LUXURY_MODERN:
    "Apply luxury modern design: premium finishes, marble or stone surfaces, designer furniture, statement lighting, minimal clutter, very high-end look.",
  CUSTOM:
    "Apply a beautiful, professional, photorealistic interior design style suitable for high-end clients, with cohesive materials, furniture and lighting.",
};

const ROOM_TYPE_NAMES: Record<RoomType, string> = {
  LIVING_ROOM: "living room",
  BEDROOM: "bedroom",
  KITCHEN: "kitchen",
  BATHROOM: "bathroom",
  DINING_ROOM: "dining room",
  OFFICE: "home office",
  BALCONY: "balcony",
  OTHER: "room",
};

/**
 * Build a strong interior-design prompt based on:
 * - room type
 * - style
 * - user custom instructions
 * - reference image usage
 */
function buildInteriorPrompt(input: GenerationInput): string {
  const roomName = ROOM_TYPE_NAMES[input.roomType] || ROOM_TYPE_NAMES.OTHER;
  const styleDescription =
    STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;

  const hasCustomInstructions =
    typeof input.instructions === "string" && input.instructions.trim().length > 0;

  const customInstructionBlock = hasCustomInstructions
    ? `\nCUSTOM REQUEST FROM CLIENT:\n${input.instructions?.trim()}\n`
    : "";

  // You can tweak wording over time to "train" behaviour further.
  return `
You are an interior renovation AI assistant for professional designers.

The client has uploaded a real photo of a ${roomName}. 
Your job is to redesign ONLY the interior of that SAME room, keeping the architecture and perspective consistent.

ROOM TYPE:
- ${roomName}

DESIGN STYLE:
- ${input.style}
- ${styleDescription}

STRUCTURAL CONSTRAINTS (DO NOT CHANGE):
- Keep the same wall positions, shape and proportions.
- Keep the same doors, windows and openings in the same place.
- Do NOT move or resize windows or doors.
- Keep the same ceiling height and room geometry.
- Keep the same camera angle, point of view and perspective.
- The redesigned image must clearly look like the same physical room.

WHAT YOU MUST CHANGE (DESIGN TRANSFORMATION):
- Replace furniture with pieces that match the selected style.
- Update wall finishes, paint and textures to fit the style.
- Update flooring material and pattern, keeping the same overall layout.
- Add or adjust décor items (artwork, rugs, plants, cushions, accessories).
- Improve lighting: ceiling lights, lamps and natural light atmosphere.
- Ensure realistic shadows, reflections and materials.
- Avoid clutter; make it look like a finished, styled project.

QUALITY REQUIREMENTS:
- Ultra photorealistic interior render.
- High resolution output suitable for client presentation.
- Clean edges, no distortions or surreal artifacts.
- Must look like a real photo of a professionally designed interior.

${customInstructionBlock}
IMPORTANT:
- Use the uploaded room image as the base structure and geometry.
- This is NOT a new imaginary space; it is a makeover of the SAME room.
- Do NOT generate cartoon or illustration styles; keep it realistic.
`.trim();
}

/**
 * Check if AI Gateway API is configured
 */
export function isAIGatewayConfigured(): boolean {
  return !!AI_GATEWAY_API_KEY;
}

/**
 * Convert image URL → base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch original image");
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

/**
 * Generate images using AI Gateway API
 * Supports reference images via base64 for img2img style generation
 */
export async function generateWithAIGateway(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY is not configured");
  }

  const prompt = buildInteriorPrompt(input);
  const results: GeneratedImageResult[] = [];

  // Fetch reference image if provided (for style consistency and geometry)
  let referenceImageBase64: string | null = null;
  if (input.originalImageUrl) {
    try {
      referenceImageBase64 = await imageUrlToBase64(input.originalImageUrl);
      console.log("✓ Reference image loaded for style consistency");
    } catch (e) {
      console.warn(
        "⚠️ Failed to load reference image, continuing without it:",
        e
      );
    }
  }

  for (let i = 0; i < numVariations; i++) {
    try {
      console.log(
        `🖼️ Generating AI Gateway image ${i + 1}/${numVariations}...`
      );
      console.log(`📍 Using endpoint: ${AI_GATEWAY_ENDPOINT}`);
      console.log(`🤖 Using model: ${AI_GATEWAY_MODEL}`);

      // Build request body - flexible to work with different API structures
      const requestBody: any = {
        model: AI_GATEWAY_MODEL,
        prompt,
        n: 1, // Generate one image per request
        size: "1024x1024", // Standard size for interior design
      };

      // Add reference image if available (for img2img)
      if (referenceImageBase64) {
        requestBody.image = referenceImageBase64;
        requestBody.mode = "img2img"; // Indicate image-to-image mode
      }

      console.log(`📤 Request body keys: ${Object.keys(requestBody).join(", ")}`);

      const response = await fetch(AI_GATEWAY_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AI_GATEWAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error Details:`);
        console.error(`   Status: ${response.status} ${response.statusText}`);
        console.error(`   Endpoint: ${AI_GATEWAY_ENDPOINT}`);
        console.error(`   Response: ${errorText}`);
        
        // Provide helpful error message for 405
        if (response.status === 405) {
          throw new Error(
            `AI Gateway API error: 405 Method Not Allowed. ` +
            `The endpoint "${AI_GATEWAY_ENDPOINT}" may be incorrect. ` +
            `Please check your AI_GATEWAY_ENDPOINT environment variable. ` +
            `Common endpoints: /v1/images/generations, /v1/chat/completions, /api/v1/generate. ` +
            `Response: ${errorText}`
          );
        }
        
        throw new Error(
          `AI Gateway API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      let imageUrl: string | null = null;
      let imageBase64: string | null = null;

      // Try common response formats
      if (data.image) {
        imageUrl = data.image;
      } else if (data.data?.[0]?.url) {
        imageUrl = data.data[0].url;
      } else if (data.data?.[0]?.b64_json) {
        imageBase64 = data.data[0].b64_json;
      } else if (data.url) {
        imageUrl = data.url;
      } else if (data.images?.[0]) {
        imageUrl = data.images[0];
      } else if (typeof data === "string") {
        // Some APIs return base64 directly as string
        imageBase64 = data;
      }

      if (!imageUrl && !imageBase64) {
        console.error("Unexpected response format:", JSON.stringify(data, null, 2));
        throw new Error("Failed to parse image from AI Gateway response");
      }

      const finalUrl = imageBase64
        ? `data:image/png;base64,${imageBase64}`
        : imageUrl!;

      results.push({
        url: finalUrl,
        metadata: {
          provider: "ai-gateway",
          model: AI_GATEWAY_MODEL,
          variationIndex: i,
          style: input.style,
        },
      });

      console.log(`✓ Image ${i + 1} generated successfully`);
    } catch (error: any) {
      const errorMessage =
        error?.message || JSON.stringify(error?.error || error);
      console.error(`❌ Failed to generate AI Gateway image ${i + 1}:`, errorMessage);
      logger.error(`Failed to generate AI Gateway variation ${i}`, error);

      // If it's the first image and it fails, throw the error
      if (i === 0) {
        throw error;
      }
      // Otherwise, continue with remaining variations
    }
  }

  if (results.length === 0) {
    const errorMsg =
      `No images generated from AI Gateway. ` +
      `Check your AI_GATEWAY_API_KEY, AI_GATEWAY_ENDPOINT, and AI_GATEWAY_MODEL environment variables.`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  logger.info("AI Gateway generation completed", { count: results.length });
  return results;
}
