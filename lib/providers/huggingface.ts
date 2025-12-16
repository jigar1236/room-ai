/**
 * Hugging Face Image Generation Provider
 * Interior Design – Image-to-Image Renovation
 *
 * ✔ Uses uploaded room photo as base (img2img)
 * ✔ Preserves architecture & perspective
 * ✔ Gemini-like interior redesign behavior
 * ✔ Provider-safe (no Nebius locking)
 */

import { InferenceClient } from "@huggingface/inference";
import { RoomType, StyleType } from "@prisma/client";
import { GeneratedImageResult, GenerationInput } from "../imagen";
import { logger } from "../logger";

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY!;
const PRIMARY_MODEL =
  process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-dev";
const FALLBACK_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

// ---------------- STYLE PROMPTS ----------------

const STYLE_PROMPTS: Record<StyleType, string> = {
  MODERN_MINIMALIST:
    "modern minimalist interior design, clean straight lines, neutral palette, matte finishes, minimal décor, open space, soft natural lighting",
  SCANDINAVIAN:
    "scandinavian interior design, white walls, light oak wood furniture, pastel accents, cozy hygge feeling, plants, natural daylight",
  INDUSTRIAL:
    "industrial loft interior, exposed brick walls, black metal fixtures, concrete textures, leather furniture, warm moody lighting",
  BOHEMIAN:
    "bohemian interior design, layered textiles, colorful patterns, indoor plants, eclectic furniture, artistic and relaxed mood",
  TRADITIONAL:
    "traditional interior design, classic furniture, rich wood tones, elegant moldings, symmetrical layout, timeless look",
  COASTAL:
    "coastal interior design, white and beige tones, ocean blue accents, rattan furniture, airy beach house feeling",
  MID_CENTURY_MODERN:
    "mid-century modern interior, low profile furniture, tapered legs, warm wood tones, muted bold colors, clean forms",
  JAPANESE_ZEN:
    "japanese zen interior, minimal furniture, natural wood, tatami textures, soft indirect lighting, calm peaceful atmosphere",
  CONTEMPORARY:
    "contemporary interior design, clean geometry, mixed materials, statement lighting, modern art accents",
  RUSTIC:
    "rustic interior design, reclaimed wood, stone accents, cozy farmhouse warmth, earthy colors",
  ART_DECO:
    "art deco interior design, bold geometry, glossy finishes, gold and brass accents, deep jewel tones, luxury glamour",
  MEDITERRANEAN:
    "mediterranean interior design, warm earth tones, terracotta floors, arches, rustic wood, villa atmosphere",
  LUXURY_MODERN:
    "luxury modern interior, marble and stone surfaces, designer furniture, premium finishes, elegant lighting",
  CUSTOM:
    "high-end professional interior design, cohesive materials, photorealistic, luxury presentation",
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

// ---------------- HELPERS ----------------

function buildInteriorPrompt(input: GenerationInput): string {
  const room = ROOM_TYPE_NAMES[input.roomType] || "room";
  const styleDesc = STYLE_PROMPTS[input.style] || STYLE_PROMPTS.CUSTOM;

  return `
Professional interior renovation of the SAME real ${room}.

DESIGN STYLE:
${styleDesc}

STRICT CONSTRAINTS:
- Preserve original layout, walls, windows, doors and ceiling height
- Same camera angle and perspective
- Do NOT change architecture

DESIGN CHANGES:
- Replace furniture to match the style
- Update wall finishes, flooring and décor
- Improve lighting and realism

QUALITY:
- Ultra photorealistic
- Interior design magazine quality
- Real materials and lighting

${input.instructions ? `CLIENT REQUEST:\n${input.instructions}` : ""}
`.trim();
}

async function fetchImage(url: string): Promise<Buffer> {
  logger.info("🔍 [DEBUG] Fetching image from URL", { url });
  
  try {
    const res = await fetch(url);
    
    logger.info("🔍 [DEBUG] Image fetch response", {
      url,
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unable to read error response");
      logger.error("🔍 [DEBUG] Image fetch failed", {
        url,
        status: res.status,
        statusText: res.statusText,
        errorText: errorText.substring(0, 500),
      });
      throw new Error(`Failed to load reference image: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    logger.info("🔍 [DEBUG] Image fetched successfully", {
      url,
      bufferSize: buffer.length,
      bufferSizeKB: Math.round(buffer.length / 1024),
    });

    return buffer;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("🔍 [DEBUG] Image fetch exception", {
      url,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

function createClient() {
  // 👈 ALWAYS new client → no provider memory
  return new InferenceClient(HF_TOKEN);
}

// ---------------- CONFIG CHECK ----------------

export function isHuggingFaceConfigured(): boolean {
  return !!HF_TOKEN;
}

// ---------------- MAIN GENERATOR ----------------

export async function generateWithHuggingFace(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  logger.info("🔍 [DEBUG] Starting Hugging Face generation", {
    numVariations,
    style: input.style,
    roomType: input.roomType,
    hasOriginalImageUrl: !!input.originalImageUrl,
    originalImageUrl: input.originalImageUrl,
    instructions: input.instructions,
    primaryModel: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    hasToken: !!HF_TOKEN,
  });

  console.log("🔍 [DEBUG] Hugging Face Input:", {
    numVariations,
    style: input.style,
    roomType: input.roomType,
    originalImageUrl: input.originalImageUrl,
    instructions: input.instructions,
  });

  if (!HF_TOKEN) {
    const error = "HUGGINGFACE_API_KEY is not configured";
    logger.error("🔍 [DEBUG] Configuration check failed", { error });
    throw new Error(error);
  }

  if (!input.originalImageUrl) {
    const error = "originalImageUrl is required for image-to-image";
    logger.error("🔍 [DEBUG] Input validation failed", { error });
    throw new Error(error);
  }

  logger.info("🔍 [DEBUG] Fetching base image", {
    url: input.originalImageUrl,
  });

  let baseImage: Buffer;
  try {
    baseImage = await fetchImage(input.originalImageUrl);
    logger.info("🔍 [DEBUG] Base image fetched successfully", {
      size: baseImage.length,
      sizeKB: Math.round(baseImage.length / 1024),
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("🔍 [DEBUG] Failed to fetch base image", {
      error: error.message,
      stack: error.stack,
      url: input.originalImageUrl,
    });
    throw error;
  }

  const prompt = buildInteriorPrompt(input);
  logger.info("🔍 [DEBUG] Generated prompt", {
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 200) + "...",
  });

  const results: GeneratedImageResult[] = [];

  for (let i = 0; i < numVariations; i++) {
    logger.info("🔍 [DEBUG] Starting variation generation", {
      variationIndex: i + 1,
      totalVariations: numVariations,
    });

    let model = PRIMARY_MODEL;
    let success = false;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2 && !success; attempt++) {
      logger.info("🔍 [DEBUG] Attempting generation", {
        variationIndex: i + 1,
        attempt: attempt + 1,
        model,
        maxAttempts: 2,
      });

      try {
        const client = createClient();
        logger.info("🔍 [DEBUG] Created HF client", {
          model,
          variationIndex: i + 1,
        });

        const requestParams = {
          model,
          prompt,
          strength: 0.3,
          guidance_scale: 7,
          num_inference_steps: 28,
          width: 1024,
          height: 768,
          imageSize: baseImage.length,
        };

        logger.info("🔍 [DEBUG] Calling imageToImage API", requestParams);

        const startTime = Date.now();
        const image = await client.imageToImage({
          model,
          inputs: new Blob([baseImage.buffer as ArrayBuffer]),
          parameters: {
            prompt,
            strength: 0.3,
            guidance_scale: 7,
            num_inference_steps: 28,
            width: 1024,
            height: 768,
          },
        });
        const duration = Date.now() - startTime;

        logger.info("🔍 [DEBUG] API call completed", {
          model,
          variationIndex: i + 1,
          durationMs: duration,
          hasImage: !!image,
        });

        const buffer = Buffer.from(await image.arrayBuffer());
        logger.info("🔍 [DEBUG] Image buffer created", {
          model,
          variationIndex: i + 1,
          bufferSize: buffer.length,
          bufferSizeKB: Math.round(buffer.length / 1024),
        });

        results.push({
          url: `data:image/png;base64,${buffer.toString("base64")}`,
          metadata: {
            provider: "huggingface",
            model,
            variationIndex: i,
            style: input.style,
          },
        });

        console.log(`✓ HF image ${i + 1} generated with ${model}`);
        logger.info("🔍 [DEBUG] Variation generated successfully", {
          variationIndex: i + 1,
          model,
          totalResults: results.length,
        });
        success = true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error;

        // Extract more details from the error
        const errorDetails: any = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          model,
          variationIndex: i + 1,
          attempt: attempt + 1,
        };

        // Try to extract HTTP status if available
        if ((error as any).status) {
          errorDetails.status = (error as any).status;
        }
        if ((error as any).statusText) {
          errorDetails.statusText = (error as any).statusText;
        }
        if ((error as any).response) {
          errorDetails.hasResponse = true;
          try {
            const responseText = await (error as any).response?.text?.();
            errorDetails.responsePreview = responseText?.substring(0, 500);
          } catch {
            // Ignore response parsing errors
          }
        }

        logger.error("🔍 [DEBUG] HF model failed", errorDetails);
        console.error(`❌ [DEBUG] HF model ${model} failed:`, error.message);

        if (attempt === 0) {
          logger.info("🔍 [DEBUG] Switching to fallback model", {
            from: model,
            to: FALLBACK_MODEL,
            variationIndex: i + 1,
          });
          model = FALLBACK_MODEL;
        } else {
          logger.error("🔍 [DEBUG] All attempts failed for variation", {
            variationIndex: i + 1,
            lastError: error.message,
          });
        }
      }
    }

    if (!success) {
      logger.error("🔍 [DEBUG] Variation generation failed completely", {
        variationIndex: i + 1,
        lastError: lastError?.message,
        lastErrorStack: lastError?.stack,
      });
    }
  }

  logger.info("🔍 [DEBUG] Generation loop completed", {
    totalVariations: numVariations,
    successfulResults: results.length,
    failedVariations: numVariations - results.length,
  });

  if (!results.length) {
    const error = "No images generated from Hugging Face";
    logger.error("🔍 [DEBUG] No results generated", {
      error,
      numVariations,
      primaryModel: PRIMARY_MODEL,
      fallbackModel: FALLBACK_MODEL,
    });
    throw new Error(error);
  }

  logger.info("🔍 [DEBUG] Hugging Face generation succeeded", {
    resultCount: results.length,
    modelsUsed: [...new Set(results.map((r) => r.metadata?.model))],
  });

  return results;
}
