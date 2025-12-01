/**
 * Fal.ai Image Generation Provider
 * Uses FLUX model for high quality results
 */

import * as fal from "@fal-ai/serverless-client";
import { logger } from "../logger";
import { StyleType, RoomType } from "@prisma/client";
import { GenerationInput, GeneratedImageResult } from "../imagen";

const FAL_KEY = process.env.FAL_KEY;

// Configure Fal.ai
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY,
  });
}

// Style descriptions for prompts
const STYLE_PROMPTS: Record<StyleType, string> = {
  MODERN_MINIMALIST:
    "modern minimalist interior design, clean lines, neutral colors, sleek furniture, uncluttered, white walls, natural light, contemporary",
  SCANDINAVIAN:
    "scandinavian interior design, light oak wood, white walls, cozy hygge atmosphere, natural light, minimalist furniture, warm textiles",
  INDUSTRIAL:
    "industrial interior design, exposed brick, metal pipes, concrete floors, vintage Edison bulbs, raw materials, loft style",
  BOHEMIAN:
    "bohemian interior design, colorful textiles, layered patterns, many plants, vintage furniture, eclectic global decor, artistic",
  TRADITIONAL:
    "traditional interior design, elegant classic furniture, rich wood tones, ornate details, timeless sophistication",
  COASTAL:
    "coastal interior design, ocean blues, sandy whites, natural textures, rattan furniture, beach house style, relaxed",
  MID_CENTURY_MODERN:
    "mid-century modern interior design, iconic retro furniture, organic shapes, warm woods, bold accent colors, 1960s style",
  JAPANESE_ZEN:
    "japanese zen interior design, minimal furniture, natural materials, shoji screens, peaceful atmosphere, wabi-sabi",
  CONTEMPORARY:
    "contemporary interior design, current trends, bold art, mixed materials, sophisticated neutral palette",
  RUSTIC:
    "rustic interior design, reclaimed wood, stone accents, cozy farmhouse, natural warmth, vintage charm",
  ART_DECO:
    "art deco interior design, geometric patterns, luxurious materials, gold accents, glamorous 1920s style",
  MEDITERRANEAN:
    "mediterranean interior design, terracotta tiles, arched doorways, wrought iron, warm earth tones, Spanish villa",
  LUXURY_MODERN:
    "luxury modern interior design, premium finishes, designer furniture, marble accents, elegant lighting, high-end",
  CUSTOM:
    "beautiful professional interior design, high quality, photorealistic",
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
 * Check if Fal.ai is configured
 */
export function isFalConfigured(): boolean {
  return !!FAL_KEY;
}

/**
 * Generate images using Fal.ai (FREE tier available!)
 * Uses FLUX model for high quality results
 */
export async function generateWithFal(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!FAL_KEY) {
    throw new Error("FAL_KEY is not configured");
  }

  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;
  const roomName = ROOM_TYPE_NAMES[input.roomType] || ROOM_TYPE_NAMES.OTHER;

  const prompt = `A stunning ${roomName} interior with ${styleDesc}.
Professional architectural photography, photorealistic, ultra HD 8k resolution,
perfect natural lighting, high-end designer furniture and premium decor,
interior design magazine cover quality, detailed textures, elegant and luxurious atmosphere.
${input.instructions ? `Additional details: ${input.instructions}` : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < numVariations; i++) {
    try {
      console.log(`🖼️ Generating Fal.ai image ${i + 1}/${numVariations}...`);

      const result = (await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
        },
        logs: true,
      })) as any;

      if (result?.images?.[0]?.url) {
        results.push({
          url: result.images[0].url,
          metadata: {
            provider: "fal",
            model: "flux-schnell",
            variationIndex: i,
            style: input.style,
            seed: result.seed,
          },
        });
        console.log(`✓ Image ${i + 1} generated successfully`);
      }
    } catch (error) {
      console.error(`Failed to generate Fal.ai image ${i + 1}:`, error);
      logger.error(`Failed to generate Fal variation ${i}`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from Fal.ai");
  }

  logger.info("Fal.ai generation completed", { count: results.length });
  return results;
}
