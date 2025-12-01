import { NextResponse } from "next/server";
import { getConfigStatus, getConfiguredProviders } from "@/lib/imagen";

export async function GET() {
  const status = getConfigStatus();
  const providers = getConfiguredProviders();
  
  return NextResponse.json({
    message: "Image Generation API Configuration",
    configured: providers.length > 0,
    providers: providers,
    details: status,
    help: providers.length === 0 ? {
      message: "No image generation API is configured. Add one of these to your .env file:",
      options: [
        {
          name: "OpenRouter (Multiple models - DALL-E 3, Stable Diffusion, etc.)",
          key: "OPENROUTER_API_KEY",
          getKey: "https://openrouter.ai/keys",
        },
        {
          name: "Fal.ai (Recommended - FREE)",
          key: "FAL_KEY",
          getKey: "https://fal.ai/dashboard/keys",
        },
        {
          name: "Replicate (FREE tier)",
          key: "REPLICATE_API_TOKEN", 
          getKey: "https://replicate.com/account/api-tokens",
        },
        {
          name: "OpenAI (Paid)",
          key: "OPENAI_API_KEY",
          getKey: "https://platform.openai.com/api-keys",
        },
      ],
    } : null,
  });
}

