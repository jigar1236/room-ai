/**
 * Replicate Image Generation Provider
 * Uses Stable Diffusion/FLUX models
 */

import Replicate from "replicate";
import { logger } from "../logger";
import { StyleType, RoomType } from "@prisma/client";
import { GenerationInput, GeneratedImageResult } from "../imagen";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

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
 * Check if Replicate is configured
 */
export function isReplicateConfigured(): boolean {
  return !!REPLICATE_API_TOKEN;
}

/**
 * Generate images using Replicate (Stable Diffusion)
 */
export async function generateWithReplicate(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });

  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;
  const roomName = ROOM_TYPE_NAMES[input.roomType] || ROOM_TYPE_NAMES.OTHER;

  const prompt = `A stunning ${roomName} interior with ${styleDesc}. 
Professional interior design photography, 8k resolution, photorealistic, 
architectural digest quality, perfect lighting, high-end furniture.
${input.instructions ? `Additional: ${input.instructions}` : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < numVariations; i++) {
    try {
      console.log(`🖼️ Generating Replicate image ${i + 1}/${numVariations}...`);

      const output = (await replicate.run("black-forest-labs/flux-schnell", {
        input: {
          prompt: prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
        },
      })) as string[];

      if (output && output.length > 0) {
        results.push({
          url: output[0],
          metadata: {
            provider: "replicate",
            model: "flux-schnell",
            variationIndex: i,
            style: input.style,
          },
        });
        console.log(`✓ Image ${i + 1} generated successfully`);
      }
    } catch (error) {
      console.error(`Failed to generate Replicate image ${i + 1}:`, error);
      logger.error(`Failed to generate Replicate variation ${i}`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from Replicate");
  }

  logger.info("Replicate generation completed", { count: results.length });
  return results;
}
