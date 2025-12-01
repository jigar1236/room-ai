/**
 * OpenAI Image Generation Provider
 * Uses DALL-E 3 for high quality results
 */

import { RoomType, StyleType } from "@prisma/client";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Generate images using OpenAI DALL-E 3
 */
export async function generateWithOpenAI(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;
  const roomName = ROOM_TYPE_NAMES[input.roomType] || ROOM_TYPE_NAMES.OTHER;

  const prompt = `A photorealistic ${roomName} interior design in ${styleDesc} style. 
Professional architectural photography, perfect lighting, high-end furniture and decor, 
8k resolution, interior design magazine quality.
${input.instructions ? input.instructions : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < Math.min(numVariations, 4); i++) {
    try {
      console.log(`🖼️ Generating OpenAI image ${i + 1}/${numVariations}...`);

      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.data?.[0]?.url) {
        results.push({
          url: data.data[0].url,
          metadata: {
            provider: "openai",
            model: "dall-e-3",
            variationIndex: i,
            style: input.style,
          },
        });
        console.log(`✓ Image ${i + 1} generated successfully`);
      }
    } catch (error) {
      console.error(`Failed to generate OpenAI image ${i + 1}:`, error);
      logger.error(`Failed to generate OpenAI variation ${i}`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from OpenAI");
  }

  logger.info("OpenAI generation completed", { count: results.length });
  return results;
}
