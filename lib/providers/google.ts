/**
 * Google Image Generation Provider
 * Uses Gemini models for image generation (following reference pattern)
 *
 * NOTE: The model 'gemini-2.5-flash-preview-image' from the reference code may not be
 * publicly available. Set GEMINI_IMAGE_MODEL environment variable to a model that
 * supports image generation, or this provider will try fallback models.
 *
 * This version is optimized for interior design:
 * - Uses user-uploaded room photo as base
 * - Preserves architecture & perspective
 * - Applies chosen style + custom instructions
 */

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Modality,
} from "@google/genai";
import { RoomType, StyleType } from "@prisma/client";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

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

  // You can tweak wording over time to “train” behaviour further.
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
 * Check if Google API is configured
 */
export function isGoogleConfigured(): boolean {
  return !!GOOGLE_API_KEY;
}

/**
 * Generate images using Gemini models
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
  const prompt = buildInteriorPrompt(input);

  const results: GeneratedImageResult[] = [];

  // Fetch reference image if provided (for style consistency and geometry)
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

    // Base generation configuration
    const baseConfig: any = {
      responseModalities: [Modality.IMAGE],
      // Speed/quality tradeoffs
      temperature: 0.7,
      candidateCount: 1,
      maxOutputTokens: 4096,
      topP: 0.9,
      topK: 40,
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

    // Build content parts: text prompt + optional reference image
    const parts: any[] = [
      {
        text: prompt,
      },
    ];

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

        // Start with base config
        let config: any = { ...baseConfig };

        // Only add imageConfig for models that explicitly support aspectRatio
        if (MODELS_WITH_ASPECT_RATIO.includes(modelName)) {
          config.imageConfig = {
            aspectRatio: "16:9", // Good for room layouts
            imageSize: "1K", // Balance of speed/quality
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

        const imagePart = responseParts.find((p: any) => p.inlineData);

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
            const retryResponse = await ai.models.generateContent({
              model: modelName,
              contents: { parts },
              config: baseConfig,
            });

            const retryResponseParts =
              retryResponse.candidates?.[0]?.content?.parts;
            if (retryResponseParts) {
              const retryImagePart = retryResponseParts.find(
                (p: any) => p.inlineData
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
