/**
 * Image Generation Service
 * 
 * Supports multiple providers (in order of priority):
 * 1. Fal.ai (FLUX) - FREE tier, reliable
 * 2. Replicate (Stable Diffusion) - Has free tier
 * 3. OpenAI (DALL-E 3) - High quality (paid)
 * 4. Placeholder mode - When no API configured
 */

import Replicate from "replicate";
import * as fal from "@fal-ai/serverless-client";
import { logger } from "./logger";
import { StyleType, RoomType } from "@prisma/client";

// API Keys - check at runtime
const FAL_KEY = process.env.FAL_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Configure Fal.ai
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY,
  });
}

// Style descriptions for prompts
const STYLE_PROMPTS: Record<StyleType, string> = {
  MODERN_MINIMALIST: "modern minimalist interior design, clean lines, neutral colors, sleek furniture, uncluttered, white walls, natural light, contemporary",
  SCANDINAVIAN: "scandinavian interior design, light oak wood, white walls, cozy hygge atmosphere, natural light, minimalist furniture, warm textiles",
  INDUSTRIAL: "industrial interior design, exposed brick, metal pipes, concrete floors, vintage Edison bulbs, raw materials, loft style",
  BOHEMIAN: "bohemian interior design, colorful textiles, layered patterns, many plants, vintage furniture, eclectic global decor, artistic",
  TRADITIONAL: "traditional interior design, elegant classic furniture, rich wood tones, ornate details, timeless sophistication",
  COASTAL: "coastal interior design, ocean blues, sandy whites, natural textures, rattan furniture, beach house style, relaxed",
  MID_CENTURY_MODERN: "mid-century modern interior design, iconic retro furniture, organic shapes, warm woods, bold accent colors, 1960s style",
  JAPANESE_ZEN: "japanese zen interior design, minimal furniture, natural materials, shoji screens, peaceful atmosphere, wabi-sabi",
  CONTEMPORARY: "contemporary interior design, current trends, bold art, mixed materials, sophisticated neutral palette",
  RUSTIC: "rustic interior design, reclaimed wood, stone accents, cozy farmhouse, natural warmth, vintage charm",
  ART_DECO: "art deco interior design, geometric patterns, luxurious materials, gold accents, glamorous 1920s style",
  MEDITERRANEAN: "mediterranean interior design, terracotta tiles, arched doorways, wrought iron, warm earth tones, Spanish villa",
  LUXURY_MODERN: "luxury modern interior design, premium finishes, designer furniture, marble accents, elegant lighting, high-end",
  CUSTOM: "beautiful professional interior design, high quality, photorealistic",
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

export interface GenerationInput {
  originalImageUrl: string;
  style: StyleType;
  roomType: RoomType;
  instructions?: string;
  numVariations?: number;
}

export interface GeneratedImageResult {
  url: string;
  metadata?: Record<string, any>;
}

/**
 * Main generation function - routes to appropriate provider
 */
export async function generateDesignImages(
  input: GenerationInput
): Promise<GeneratedImageResult[]> {
  const numVariations = input.numVariations || 4;
  
  const configStatus = {
    FAL_KEY: !!FAL_KEY,
    REPLICATE_API_TOKEN: !!REPLICATE_API_TOKEN,
    OPENAI_API_KEY: !!OPENAI_API_KEY,
  };
  
  logger.info("Starting design generation", {
    style: input.style,
    roomType: input.roomType,
    numVariations,
    configuredApis: configStatus,
  });

  console.log("🔧 API Configuration:", configStatus);

  // Try Fal.ai first (FREE & reliable)
  if (FAL_KEY) {
    try {
      console.log("🎨 Trying Fal.ai...");
      const result = await generateWithFal(input, numVariations);
      console.log("✅ Fal.ai succeeded!");
      return result;
    } catch (error) {
      console.error("❌ Fal.ai failed:", error);
      logger.error("Fal.ai generation failed", error);
    }
  }

  // Try Replicate
  if (REPLICATE_API_TOKEN) {
    try {
      console.log("🎨 Trying Replicate...");
      const result = await generateWithReplicate(input, numVariations);
      console.log("✅ Replicate succeeded!");
      return result;
    } catch (error) {
      console.error("❌ Replicate failed:", error);
      logger.error("Replicate generation failed", error);
    }
  }

  // Try OpenAI
  if (OPENAI_API_KEY) {
    try {
      console.log("🎨 Trying OpenAI...");
      const result = await generateWithOpenAI(input, numVariations);
      console.log("✅ OpenAI succeeded!");
      return result;
    } catch (error) {
      console.error("❌ OpenAI failed:", error);
      logger.error("OpenAI generation failed", error);
    }
  }

  // Fallback to placeholder
  console.log("⚠️ No working API - using placeholder mode");
  logger.warn("No image generation API configured or all failed - using placeholder");
  return generatePlaceholder(input.originalImageUrl, numVariations, input.style);
}

/**
 * Generate with Fal.ai (FREE tier available!)
 * Uses FLUX model for high quality results
 */
async function generateWithFal(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  const styleDesc = STYLE_PROMPTS[input.style];
  const roomName = ROOM_TYPE_NAMES[input.roomType];
  
  const prompt = `A stunning ${roomName} interior with ${styleDesc}.
Professional architectural photography, photorealistic, ultra HD 8k resolution,
perfect natural lighting, high-end designer furniture and premium decor,
interior design magazine cover quality, detailed textures, elegant and luxurious atmosphere.
${input.instructions ? `Additional details: ${input.instructions}` : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < numVariations; i++) {
    try {
      console.log(`🖼️ Generating image ${i + 1}/${numVariations}...`);
      
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
        },
        logs: true,
      }) as any;

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
      console.error(`Failed to generate image ${i + 1}:`, error);
      logger.error(`Failed to generate Fal variation ${i}`, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No images generated from Fal.ai");
  }

  logger.info("Fal.ai generation completed", { count: results.length });
  return results;
}

/**
 * Generate with Replicate (Stable Diffusion)
 */
async function generateWithReplicate(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });

  const styleDesc = STYLE_PROMPTS[input.style];
  const roomName = ROOM_TYPE_NAMES[input.roomType];
  
  const prompt = `A stunning ${roomName} interior with ${styleDesc}. 
Professional interior design photography, 8k resolution, photorealistic, 
architectural digest quality, perfect lighting, high-end furniture.
${input.instructions ? `Additional: ${input.instructions}` : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < numVariations; i++) {
    try {
      console.log(`🖼️ Generating Replicate image ${i + 1}/${numVariations}...`);
      
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90,
          },
        }
      ) as string[];

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

/**
 * Generate with OpenAI DALL-E 3
 */
async function generateWithOpenAI(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  const styleDesc = STYLE_PROMPTS[input.style];
  const roomName = ROOM_TYPE_NAMES[input.roomType];
  
  const prompt = `A photorealistic ${roomName} interior design in ${styleDesc} style. 
Professional architectural photography, perfect lighting, high-end furniture and decor, 
8k resolution, interior design magazine quality.
${input.instructions ? input.instructions : ""}`;

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < Math.min(numVariations, 4); i++) {
    try {
      console.log(`🖼️ Generating OpenAI image ${i + 1}/${numVariations}...`);
      
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
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
      });

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

/**
 * Placeholder when no API is configured
 */
function generatePlaceholder(
  originalImageUrl: string,
  numVariations: number,
  style: StyleType
): GeneratedImageResult[] {
  const results: GeneratedImageResult[] = [];
  
  for (let i = 0; i < numVariations; i++) {
    results.push({
      url: originalImageUrl,
      metadata: {
        isPlaceholder: true,
        variationIndex: i,
        style,
        message: "⚠️ Preview Mode - Add FAL_KEY, REPLICATE_API_TOKEN, or OPENAI_API_KEY to enable AI image generation",
      },
    });
  }

  return results;
}

/**
 * Check which providers are configured
 */
export function getConfiguredProviders(): string[] {
  const providers: string[] = [];
  if (FAL_KEY) providers.push("fal");
  if (REPLICATE_API_TOKEN) providers.push("replicate");
  if (OPENAI_API_KEY) providers.push("openai");
  return providers;
}

/**
 * Check if any image generation is configured
 */
export function isImageGenerationConfigured(): boolean {
  return !!(FAL_KEY || REPLICATE_API_TOKEN || OPENAI_API_KEY);
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): Record<string, boolean> {
  return {
    FAL_KEY: !!FAL_KEY,
    REPLICATE_API_TOKEN: !!REPLICATE_API_TOKEN,
    OPENAI_API_KEY: !!OPENAI_API_KEY,
  };
}
