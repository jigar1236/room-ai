import { RoomType, StyleType } from "@prisma/client";
import { GenerationInput, GeneratedImageResult } from "../imagen";

const SD_BASE_URL = "http://127.0.0.1:7860";
const SD_IMG2IMG_ENDPOINT = `${SD_BASE_URL}/sdapi/v1/img2img`;
const SD_MODELS_ENDPOINT = `${SD_BASE_URL}/sdapi/v1/sd-models`;

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

  // Detailed prompt for Stable Diffusion img2img
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
- ${roomName} interior design, ${input.style.toLowerCase()} style, high quality, realistic lighting, professional interior photo
`.trim();
}

/**
 * Convert image URL → base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch original image");
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

/**
 * Main Local Stable Diffusion img2img generator
 */
export async function generateWithLocalStableDiffusion(
  input: GenerationInput,
  numVariations: number
): Promise<GeneratedImageResult[]> {
  console.log(`🎨 Using Local Stable Diffusion (img2img) - Generating ${numVariations} variations`);

  const initImageBase64 = await imageUrlToBase64(input.originalImageUrl);
  const prompt = buildInteriorPrompt(input);

  console.log(`📝 Prompt: ${prompt.substring(0, 150)}...`);

  const results: GeneratedImageResult[] = [];

  // Ensure we generate exactly the requested number of variations (default 4)
  const variationsToGenerate = Math.max(1, numVariations || 4);
  console.log(`🖼️ Will generate ${variationsToGenerate} image variations`);

  // IMPORTANT: sequential generation (CPU-safe)
  for (let i = 0; i < variationsToGenerate; i++) {
    console.log(`🖼️ Generating variation ${i + 1}/${variationsToGenerate}`);

    try {
      const res = await fetch(SD_IMG2IMG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          init_images: [initImageBase64],
          prompt,
          denoising_strength: 0.55,
          steps: 20, // Increased steps for better quality
          width: 512,
          height: 512,
          sampler_name: "Euler a",
          cfg_scale: 7.5, // Slightly higher CFG for better prompt adherence
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`❌ Generation ${i + 1} failed:`, err);
        throw new Error(`Stable Diffusion img2img failed: ${err}`);
      }

      const data = await res.json();

      if (!data.images || !data.images[0]) {
        console.error(`❌ Generation ${i + 1} returned no image`);
        throw new Error("Stable Diffusion returned no image");
      }

      results.push({
        url: `data:image/png;base64,${data.images[0]}`,
        metadata: {
          provider: "local-stable-diffusion",
          variation: i,
          prompt,
        },
      });

      console.log(`✅ Variation ${i + 1}/${variationsToGenerate} completed`);
    } catch (error) {
      console.error(`❌ Failed to generate variation ${i + 1}:`, error);
      // Continue with remaining variations instead of failing completely
      // But if it's the first one, throw the error
      if (i === 0) {
        throw error;
      }
    }
  }

  console.log(`✅ Completed: Generated ${results.length}/${variationsToGenerate} images`);
  
  // Ensure we return at least some results
  if (results.length === 0) {
    throw new Error("Failed to generate any images");
  }

  return results;
}

/**
 * Health check – is Local Stable Diffusion running?
 */
export async function isLocalSDRunning(): Promise<boolean> {
  try {
    const res = await fetch(SD_MODELS_ENDPOINT, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
