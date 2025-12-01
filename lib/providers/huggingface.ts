/**
 * Hugging Face Image Generation Provider
 * Uses FLUX.1-dev model via Nebius provider
 */

import { InferenceClient } from "@huggingface/inference";
import { logger } from "../logger";
import { StyleType, RoomType } from "@prisma/client";
import { GenerationInput, GeneratedImageResult } from "../imagen";

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

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
 * Check if Hugging Face is configured
 */
export function isHuggingFaceConfigured(): boolean {
  return !!HF_TOKEN;
}

/**
 * Generate images using Hugging Face FLUX.1-dev
 */
export async function generateWithHuggingFace(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!HF_TOKEN) {
    throw new Error("HF_TOKEN is not configured");
  }

  const client = new InferenceClient(HF_TOKEN);
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
      console.log(
        `🖼️ Generating Hugging Face image ${i + 1}/${numVariations}...`
      );

      const image = await client.textToImage({
        provider: "nebius",
        model: "black-forest-labs/FLUX.1-dev",
        inputs: prompt,
        parameters: {
          num_inference_steps: 5,
        },
      });

      // Convert Blob to data URL or URL
      // Check if it's a Blob-like object
      if (image && typeof image === "object" && "arrayBuffer" in image) {
        // Convert blob to base64 data URL
        const arrayBuffer = await (image as Blob).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = (image as Blob).type || "image/png";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        results.push({
          url: dataUrl,
          metadata: {
            provider: "huggingface",
            model: "FLUX.1-dev",
            variationIndex: i,
            style: input.style,
          },
        });
        console.log(`✓ Image ${i + 1} generated successfully`);
      } else {
        throw new Error("Unexpected response format from Hugging Face");
      }
    } catch (error) {
      console.error(`Failed to generate Hugging Face image ${i + 1}:`, error);
      logger.error(`Failed to generate Hugging Face variation ${i}`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from Hugging Face");
  }

  logger.info("Hugging Face generation completed", { count: results.length });
  return results;
}
