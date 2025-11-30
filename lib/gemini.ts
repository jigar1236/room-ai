import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  logger.warn("GEMINI_API_KEY not set - AI analysis features will be limited");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Analyze a room image and extract design metadata
 * This is used alongside image generation to provide context
 */
export async function analyzeRoomImage(
  imageUrl: string,
  style: string,
  roomType: string
): Promise<{
  colors: string[];
  materials: string[];
  furniture: string[];
  suggestions: string[];
}> {
  if (!model) {
    logger.warn("Gemini model not available");
    return {
      colors: [],
      materials: [],
      furniture: [],
      suggestions: [],
    };
  }

  try {
    const prompt = `Analyze this ${roomType} image and provide design recommendations for a ${style} style transformation.
    
    Return a JSON object with:
    - colors: Array of 5 recommended color hex codes
    - materials: Array of 5 recommended materials (e.g., "oak wood", "marble", "velvet")
    - furniture: Array of 5 key furniture pieces to include
    - suggestions: Array of 3 design tips
    
    Only return valid JSON, no markdown.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: await fetchImageAsBase64(imageUrl),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        colors: parsed.colors || [],
        materials: parsed.materials || [],
        furniture: parsed.furniture || [],
        suggestions: parsed.suggestions || [],
      };
    }

    return {
      colors: [],
      materials: [],
      furniture: [],
      suggestions: [],
    };
  } catch (error) {
    logger.error("Failed to analyze room image", error);
    return {
      colors: [],
      materials: [],
      furniture: [],
      suggestions: [],
    };
  }
}

/**
 * Generate design metadata for a style
 */
export async function generateStyleMetadata(
  style: string,
  roomType: string
): Promise<{
  colorPalette: string[];
  keyElements: string[];
  moodKeywords: string[];
}> {
  if (!model) {
    return {
      colorPalette: ["#FFFFFF", "#F5F5F5", "#333333"],
      keyElements: ["Clean lines", "Natural materials"],
      moodKeywords: ["Modern", "Elegant"],
    };
  }

  try {
    const prompt = `Generate design metadata for a ${style} ${roomType}. 
    
    Return JSON with:
    - colorPalette: 5 hex color codes typical for this style
    - keyElements: 5 key design elements
    - moodKeywords: 5 mood/atmosphere keywords
    
    Only return valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        colorPalette: parsed.colorPalette || [],
        keyElements: parsed.keyElements || [],
        moodKeywords: parsed.moodKeywords || [],
      };
    }

    return {
      colorPalette: [],
      keyElements: [],
      moodKeywords: [],
    };
  } catch (error) {
    logger.error("Failed to generate style metadata", error);
    return {
      colorPalette: [],
      keyElements: [],
      moodKeywords: [],
    };
  }
}

/**
 * Fetch an image URL and convert to base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (error) {
    logger.error("Failed to fetch image as base64", error);
    throw error;
  }
}

/**
 * Validate that the Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && model);
}
