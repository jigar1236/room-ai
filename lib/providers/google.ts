/**
 * Google Image Generation Provider
 * Uses Gemini models for image generation (following reference pattern)
 *
 * NOTE: The model 'gemini-2.5-flash-preview-image' from the reference code may not be
 * publicly available. Set GEMINI_IMAGE_MODEL environment variable to a model that
 * supports image generation, or this provider will try fallback models.
 *
 * Follows the reference pattern from comic generation code
 */

import {
  GoogleGenAI,
  Modality,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/genai";
import { logger } from "../logger";
import { StyleType, RoomType } from "@prisma/client";
import { GenerationInput, GeneratedImageResult } from "../imagen";

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Model configuration from environment variables
// Try different model names as fallback - some may not be available in all regions
// Note: Most Gemini models don't support image generation. Only specific preview models do.
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash";
const FALLBACK_MODELS = [
  "gemini-2.5-flash-image-preview", // Try this first - might work without aspectRatio
  "gemini-2.5-flash-preview-image", // Original reference model
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
];

// Models that support aspect ratio configuration
const MODELS_WITH_ASPECT_RATIO = ["imagen-4.0-generate-preview-06-06"];

// --- HELPER: Initialize Gemini Client ---
const getAiClient = () => {
  const apiKey = GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ CRITICAL: GEMINI_API_KEY is missing in environment variables"
    );
    throw new Error("AI_SERVICE_UNAVAILABLE");
  }
  console.log("✓ Gemini API client initialized");
  return new GoogleGenAI({ apiKey });
};
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
 * Check if Google API is configured
 */
export function isGoogleConfigured(): boolean {
  return !!GOOGLE_API_KEY;
}

/**
 * Generate images using Gemini 2.5 Flash Preview Image model
 * Supports reference images via base64 for style consistency
 */
export async function generateWithGoogle(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not configured");
  }

  const ai = getAiClient();

  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;
  const roomName = ROOM_TYPE_NAMES[input.roomType] || ROOM_TYPE_NAMES.OTHER;

  const prompt = `A stunning ${roomName} interior with ${styleDesc}.
Professional architectural photography, photorealistic, ultra HD 8k resolution,
perfect natural lighting, high-end designer furniture and premium decor,
interior design magazine cover quality, detailed textures, elegant and luxurious atmosphere.
${input.instructions ? `Additional details: ${input.instructions}` : ""}`;

  const results: GeneratedImageResult[] = [];

  // Fetch reference image if provided (for style consistency)
  let referenceImageBase64: string | null = null;
  if (input.originalImageUrl) {
    try {
      const resp = await fetch(input.originalImageUrl);
      const arrayBuffer = await resp.arrayBuffer();
      referenceImageBase64 = Buffer.from(arrayBuffer).toString("base64");
      console.log("✓ Reference image loaded for style consistency");
    } catch (e) {
      console.warn(
        "⚠️ Failed to load reference image, continuing without it:",
        e
      );
    }
  }

  for (let i = 0; i < numVariations; i++) {
    let lastError: Error | null = null;
    let success = false;

    // Try primary model first, then fallback models
    const modelsToTry = [
      GEMINI_IMAGE_MODEL,
      ...FALLBACK_MODELS.filter((m) => m !== GEMINI_IMAGE_MODEL),
    ];

    // Build base config - most models don't support aspectRatio (define once, reuse)
    const baseConfig: any = {
      responseModalities: [Modality.IMAGE],
      // Speed optimizations
      temperature: 0.7, // Lower = faster & more consistent
      candidateCount: 1, // Only generate 1 image
      maxOutputTokens: 4096, // Limit output tokens for efficiency
      topP: 0.9, // Nucleus sampling for faster generation
      topK: 40, // Top-K sampling (lower = faster)
      // Safety settings
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    };

    // Build parts array once (text prompt + optional reference image)
    const parts: any[] = [{ text: prompt }];
    if (referenceImageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: referenceImageBase64,
        },
      });
    }

    for (const modelName of modelsToTry) {
      try {
        console.log(
          `🖼️ Generating Google Gemini image ${i + 1}/${numVariations} with model: ${modelName}...`
        );

        // Try without aspectRatio first (most models don't support it)
        let config = { ...baseConfig };

        // Only add imageConfig for models that explicitly support aspectRatio
        if (MODELS_WITH_ASPECT_RATIO.includes(modelName)) {
          config.imageConfig = {
            aspectRatio: "16:9", // Wide format for rooms
            imageSize: "1K", // Best speed/quality balance
          };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config,
        });

        const responseParts = response.candidates?.[0]?.content?.parts;
        if (!responseParts) {
          throw new Error("No image generated");
        }

        const imagePart = responseParts.find((p) => p.inlineData);

        if (imagePart && imagePart.inlineData) {
          const imageBase64 = imagePart.inlineData.data;
          const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

          results.push({
            url: imageUrl,
            metadata: {
              provider: "google",
              model: modelName,
              variationIndex: i,
              style: input.style,
            },
          });
          console.log(
            `✓ Image ${i + 1} generated successfully with model: ${modelName}`
          );
          success = true;
          break; // Success, move to next variation
        } else {
          throw new Error("Failed to generate valid image data");
        }
      } catch (error: any) {
        lastError = error;
        const errorMessage =
          error?.message || JSON.stringify(error?.error || error);

        // If it's a 404 (model not found), try next model
        if (error?.status === 404 || errorMessage?.includes("not found")) {
          console.warn(`⚠️ Model ${modelName} not available, trying next...`);
          continue;
        }

        // If aspect ratio is not supported, try without it
        if (
          error?.status === 400 &&
          (errorMessage?.includes("Aspect ratio") ||
            errorMessage?.includes("aspectRatio"))
        ) {
          console.warn(
            `⚠️ Model ${modelName} doesn't support aspectRatio, trying without it...`
          );
          try {
            // Use base config without imageConfig
            const retryResponse = await ai.models.generateContent({
              model: modelName,
              contents: { parts },
              config: baseConfig,
            });

            const retryResponseParts =
              retryResponse.candidates?.[0]?.content?.parts;
            if (retryResponseParts) {
              const retryImagePart = retryResponseParts.find(
                (p) => p.inlineData
              );
              if (retryImagePart && retryImagePart.inlineData) {
                const imageBase64 = retryImagePart.inlineData.data;
                const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
                results.push({
                  url: imageUrl,
                  metadata: {
                    provider: "google",
                    model: modelName,
                    variationIndex: i,
                    style: input.style,
                  },
                });
                console.log(
                  `✓ Image ${i + 1} generated successfully with model: ${modelName} (without aspectRatio)`
                );
                success = true;
                break;
              }
            }
          } catch (retryError) {
            // If retry also fails, continue to next model
            console.warn(
              `⚠️ Retry without aspectRatio also failed for ${modelName}`
            );
          }
          continue;
        }

        // If model doesn't support image generation, try next model
        if (
          error?.status === 400 &&
          errorMessage?.includes("response modalities")
        ) {
          console.warn(
            `⚠️ Model ${modelName} doesn't support image generation, trying next...`
          );
          continue;
        }

        // For other errors, log and try next model
        console.warn(`⚠️ Error with model ${modelName}:`, errorMessage);
        continue;
      }
    }

    if (!success) {
      console.error(
        `Failed to generate Google Gemini image ${i + 1} with any model. Last error:`,
        lastError
      );
      logger.error(`Failed to generate Google variation ${i}`, lastError);
    }
  }

  if (results.length === 0) {
    const triedModels = [
      GEMINI_IMAGE_MODEL,
      ...FALLBACK_MODELS.filter((m) => m !== GEMINI_IMAGE_MODEL),
    ];
    const errorMsg =
      `No images generated from Google Gemini. Tried models: ${triedModels.join(", ")}. ` +
      `The Gemini image generation models may not be available in your region or API version. ` +
      `Try setting GEMINI_IMAGE_MODEL environment variable to a supported model, or use a different provider.`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  logger.info("Google Gemini generation completed", { count: results.length });
  return results;
}
