/**
 * OpenAI Image Provider
 * Uses gpt-image-1 for real redesigned room rendering
 */

import { RoomType, StyleType } from "@prisma/client";
import OpenAI from "openai";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Model name
const OPENAI_IMAGE_MODEL = "gpt-image-1";

export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

// Style prompt configuration
const STYLE_PROMPTS: Record<StyleType, string> = {
  MODERN_MINIMALIST:
    "clean minimal interior, neutral palette, matte materials, clean lines, light wood furniture, hidden storage, modern lighting",
  SCANDINAVIAN:
    "Nordic interior, oak wood, white paint, pastel textiles, cozy soft lighting, minimalist décor, warm atmosphere",
  INDUSTRIAL:
    "industrial interior, concrete texture, brick walls, metallic lighting fixtures, dark leather sofas",
  BOHEMIAN:
    "boho style interior, layered textiles, colorful patterns, plants everywhere, ethnic art",
  TRADITIONAL:
    "classic elegant interior, rich wood textures, ornate furniture, golden frames",
  COASTAL:
    "white coastal interior, blue accents, rattan materials, airy atmosphere",
  MID_CENTURY_MODERN:
    "mid-century modern clean furniture, tapered legs, dark wood, simple décor",
  JAPANESE_ZEN:
    "japanese zen minimal interior, low furniture, wooden textures, soft lights",
  CONTEMPORARY:
    "current trend contemporary design, bold art pieces, mix of materials",
  RUSTIC:
    "rustic cabin interior, reclaimed wood, vintage decorations, warm tones",
  ART_DECO:
    "art deco glamorous interior, geometric golden metal finish, velvet seating",
  MEDITERRANEAN:
    "spanish-inspired interior, terracotta tile work, soft arch forms",
  LUXURY_MODERN:
    "luxury modern interior with marble textures, designer furniture, dramatic lighting",
  CUSTOM:
    "premium photoreal interior suitable for professional magazine showcase",
};

// Room name mapping
const ROOM_NAMES: Record<RoomType, string> = {
  LIVING_ROOM: "living room",
  BEDROOM: "bedroom",
  KITCHEN: "kitchen",
  BATHROOM: "bathroom",
  DINING_ROOM: "dining room",
  OFFICE: "home office",
  BALCONY: "balcony",
  OTHER: "room",
};

// Prompt builder
function buildPrompt(input: GenerationInput): string {
  const roomName = ROOM_NAMES[input.roomType];
  const style = STYLE_PROMPTS[input.style] ?? STYLE_PROMPTS.CUSTOM;

  return `
You are an interior redesign AI.

Redesign the given ${roomName} while keeping original structure and architecture.
Keep same:
- wall positions
- window placement
- floor geometry
- perspective & viewing angle

Transform using style: ${input.style}

Style definition:
${style}

Improve:
- furniture replacement to match style
- flooring material
- curtains
- ambient lighting
- wall textures
- decorative pieces

Final result must:
- be photorealistic, ultra-high detail
- look like same physical room
- preserve geometry, windows, and layout
- represent real professional interior design work

${
  input.instructions ? `Client Custom Instructions:\n${input.instructions}` : ""
}
  `.trim();
}

/**
 * Generate redesigned interior using OpenAI AI model
 */
export async function generateWithOpenAI(
  input: GenerationInput,
  count: number
): Promise<GeneratedImageResult[]> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const results: GeneratedImageResult[] = [];

  // Note: OpenAI DALL-E doesn't support image-to-image generation
  // The prompt should describe the room transformation based on the original image
  const prompt = buildPrompt(input);

  for (let i = 0; i < count; i++) {
    try {
      // Note: OpenAI DALL-E doesn't support image-to-image generation
      // We can only use text-to-image, so the prompt should describe the room transformation
      const response = await openai.images.generate({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: "1024x1024",
      });

      const base64 = response.data?.[0]?.b64_json;

      const finalUrl = `data:image/png;base64,${base64}`;
      results.push({
        url: finalUrl,
        metadata: {
          provider: "openai",
          model: OPENAI_IMAGE_MODEL,
          variationIndex: i,
          style: input.style,
        },
      });
    } catch (err) {
      console.error("Generation failed:", err);
      logger.error("OpenAI image generation failed", err);
    }
  }

  return results;
}
