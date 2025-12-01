/**
 * OpenRouter Image Generation Provider (FULLY FIXED)
 */

import { RoomType, StyleType } from "@prisma/client";
import OpenAI from "openai";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "openai/gpt-5-image";

/**
 * Create OpenAI client configured for OpenRouter
 */
export const createOpenAIClient = () => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://room-ai.com",
      "X-Title": "RoomAI Image Generation",
    },
  });
};

// Style prompts
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

export function isOpenRouterConfigured(): boolean {
  return !!OPENROUTER_API_KEY;
}

/**
 * Detect if model uses image via /chat/completions
 */
function usesChatImage(model: string): boolean {
  return (
    model.startsWith("openai/gpt-image-1") ||
    model.includes("google/gemini-3-pro-image-preview") ||
    model.includes("gpt-image") ||
    model.includes("black-forest-labs/flux-2-pro")
  );
}

/**
 * Detect if model uses /images endpoint
 */
function usesImageEndpoint(model: string): boolean {
  return (
    model.includes("stable") || model.includes("sd") || model.includes("flux")
  );
}

/**
 * Generate images using OpenRouter
 */
export async function generateWithOpenRouter(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;
  const roomName = ROOM_TYPE_NAMES[input.roomType];

  const prompt = `A photorealistic ${roomName} interior design in ${styleDesc} style. 
8k resolution, perfect lighting, high-end furniture, architectural photography.
${input.instructions ?? ""}`;

  const results: GeneratedImageResult[] = [];
  console.log("🚀 ~ generateWithOpenRouter ~ results:", results);

  const isChatImage = usesChatImage(OPENROUTER_MODEL);
  const isImageAPI = usesImageEndpoint(OPENROUTER_MODEL);

  for (let i = 0; i < Math.min(numVariations, 4); i++) {
    try {
      let imageUrl: string | null = null;

      // ==========================
      // 1️⃣ CHAT → IMAGE MODELS
      // ==========================
      if (isChatImage) {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer":
                process.env.NEXT_PUBLIC_APP_URL ?? "https://room-ai.com",
              "X-Title": "RoomAI Image Generation",
            },
            body: JSON.stringify({
              model: OPENROUTER_MODEL,
              messages: [
                {
                  role: "user",
                  content: [{ type: "input_text", text: prompt }],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        console.log("🚀 ~ generateWithOpenRouter isChatImage ~ data:", data);

        imageUrl = data?.choices?.[0]?.message?.content?.[0]?.image_url || null;
        console.log(
          "🚀 ~ generateWithOpenRouter isChatImage~ imageUrl:",
          imageUrl
        );
      }

      // ==========================
      // 2️⃣ DIRECT IMAGE MODELS
      // ==========================
      else if (isImageAPI) {
        const response = await fetch("https://openrouter.ai/api/v1/images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            prompt,
            size: "1024x1024",
          }),
        });

        const data = await response.json();
        console.log("🚀 ~ generateWithOpenRouter isImageAPI ~ data:", data);

        imageUrl = data?.data?.[0]?.url || null;
        console.log(
          "🚀 ~ generateWithOpenRouter isImageAPI ~ imageUrl:",
          imageUrl
        );
      }

      if (!imageUrl) throw new Error("Image URL missing from OpenRouter");

      results.push({
        url: imageUrl,
        metadata: {
          provider: "openrouter",
          model: OPENROUTER_MODEL,
          variationIndex: i,
        },
      });
    } catch (error) {
      logger.error(`OpenRouter variation ${i} failed`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from OpenRouter");
  }

  return results;
}
