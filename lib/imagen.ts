/**
 * Image Generation Service
 *
 * Supports multiple providers (in order of priority):
 * 1. OpenRouter (Multiple models via unified API) - Supports DALL-E 3, Stable Diffusion, etc.
 * 2. Hugging Face (FLUX.1-dev) - Via Nebius provider
 * 3. Google (Imagen-3.0) - FREE tier, large quota, no billing required
 * 4. Fal.ai (FLUX) - FREE tier, reliable
 * 5. Replicate (Stable Diffusion) - Has free tier
 * 6. OpenAI (DALL-E 3) - High quality (paid)
 * 7. Placeholder mode - When no API configured
 */

import { RoomType, StyleType } from "@prisma/client";
import { logger } from "./logger";
import { generateWithGoogle, isGoogleConfigured } from "./providers/google";

// API Keys - check at runtime
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
const FAL_KEY = process.env.FAL_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
    HF_TOKEN: !!HF_TOKEN,
    GOOGLE_API_KEY: !!GOOGLE_API_KEY,
    FAL_KEY: !!FAL_KEY,
    REPLICATE_API_TOKEN: !!REPLICATE_API_TOKEN,
    OPENAI_API_KEY: !!OPENAI_API_KEY,
    OPENROUTER_API_KEY: !!OPENROUTER_API_KEY,
  };

  logger.info("Starting design generation", {
    style: input.style,
    roomType: input.roomType,
    numVariations,
    configuredApis: configStatus,
  });

  console.log("🔧 API Configuration:", configStatus);

  // Try Hugging Face first (FLUX.1-dev via Nebius)
  // if (isHuggingFaceConfigured()) {
  //   try {
  //     console.log("🎨 Trying Hugging Face...");
  //     const result = await generateWithHuggingFace(input, numVariations);
  //     console.log("✅ Hugging Face succeeded!");
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Hugging Face failed:", error);
  //     logger.error("Hugging Face generation failed", error);
  //   }
  // }

  // Try Google Imagen-3.0 (FREE tier, large quota, no billing)
  if (isGoogleConfigured()) {
    try {
      console.log("🎨 Trying Google Imagen...");
      const result = await generateWithGoogle(input, numVariations);
      console.log("✅ Google Imagen succeeded!");
      return result;
    } catch (error) {
      console.error("❌ Google Imagen failed:", error);
      logger.error("Google Imagen generation failed", error);
    }
  }

  // Try OpenRouter (supports multiple models)
  // if (isOpenRouterConfigured()) {
  //   try {
  //     console.log("🎨 Trying OpenRouter...");
  //     const result = await generateWithOpenRouter(input, numVariations);
  //     console.log("✅ OpenRouter succeeded!");
  //     return result;
  //   } catch (error) {
  //     console.error("❌ OpenRouter failed:", error);
  //     logger.error("OpenRouter generation failed", error);
  //   }
  // }

  // Try Fal.ai (FREE & reliable)
  // if (isFalConfigured()) {
  //   try {
  //     console.log("🎨 Trying Fal.ai...");
  //     const result = await generateWithFal(input, numVariations);
  //     console.log("✅ Fal.ai succeeded!");
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Fal.ai failed:", error);
  //     logger.error("Fal.ai generation failed", error);
  //   }
  // }

  // Try Replicate
  // if (isReplicateConfigured()) {
  //   try {
  //     console.log("🎨 Trying Replicate...");
  //     const result = await generateWithReplicate(input, numVariations);
  //     console.log("✅ Replicate succeeded!");
  //     return result;
  //   } catch (error) {
  //     console.error("❌ Replicate failed:", error);
  //     logger.error("Replicate generation failed", error);
  //   }
  // }

  // Try OpenAI
  // if (isOpenAIConfigured()) {
  //   try {
  //     console.log("🎨 Trying OpenAI...");
  //     const result = await generateWithOpenAI(input, numVariations);
  //     console.log("✅ OpenAI succeeded!");
  //     return result;
  //   } catch (error) {
  //     console.error("❌ OpenAI failed:", error);
  //     logger.error("OpenAI generation failed", error);
  //   }
  // }

  // Fallback to placeholder
  console.log("⚠️ No working API - using placeholder mode");
  logger.warn(
    "No image generation API configured or all failed - using placeholder"
  );
  return generatePlaceholder(
    input.originalImageUrl,
    numVariations,
    input.style
  );
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
        message:
          "⚠️ Preview Mode - Add OPENROUTER_API_KEY, HF_TOKEN, GOOGLE_API_KEY, FAL_KEY, REPLICATE_API_TOKEN, or OPENAI_API_KEY to enable AI image generation",
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
  // if (isHuggingFaceConfigured()) providers.push("huggingface");
  if (isGoogleConfigured()) providers.push("google");
  // if (isOpenRouterConfigured()) providers.push("openrouter");
  // if (isFalConfigured()) providers.push("fal");
  // if (isReplicateConfigured()) providers.push("replicate");
  // if (isOpenAIConfigured()) providers.push("openai");
  return providers;
}

/**
 * Check if any image generation is configured
 */
export function isImageGenerationConfigured(): boolean {
  return !!(
    // isHuggingFaceConfigured() ||
    isGoogleConfigured()
    // isOpenRouterConfigured()
    // ||
    // isFalConfigured()
    // ||
    // isReplicateConfigured() ||
    // isOpenAIConfigured()
  );
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): Record<string, boolean> {
  return {
    // HF_TOKEN: isHuggingFaceConfigured(),
    GOOGLE_API_KEY: isGoogleConfigured(),
    // OPENROUTER_API_KEY: isOpenRouterConfigured(),
    // FAL_KEY: isFalConfigured(),
    // REPLICATE_API_TOKEN: isReplicateConfigured(),
    // OPENAI_API_KEY: isOpenAIConfigured(),
  };
}
