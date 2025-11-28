"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import {
  StartGenerationSchema,
  ReplaceFurnitureSchema,
  GenerateMoodboardSchema,
  GenerateShoppingListSchema,
} from "@/lib/validate";
import { logger } from "@/lib/logger";
import { deductCredits, getCreditsRequired, refundCredits } from "@/lib/credits";
import { generateRoomRedesign } from "@/lib/gemini";
import { generateSegmentationMask, generateMockSegmentationMask } from "@/lib/masks";
import { uploadGeneratedImage } from "@/lib/blob";
import { GenerationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Upload room image
 */
export async function uploadRoomImage(
  roomId: string,
  imageData: string, // Base64 or URL
  type: "original" | "mask" | "item_mask"
) {
  try {
    const userId = await requireUserId();

    // Verify room ownership
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        project: { userId },
      },
    });

    if (!room) {
      return { success: false, error: "Room not found or unauthorized" };
    }

    // In production, convert base64 to File/Buffer and upload
    // For now, assuming imageData is a URL
    const blobUrl = imageData; // Placeholder - actual upload logic needed

    const asset = await prisma.asset.create({
      data: {
        roomId,
        type,
        blobUrl,
        blobKey: `rooms/${roomId}/${type}-${Date.now()}`,
        mimeType: "image/jpeg",
        size: 0, // Would be set from actual upload
      },
    });

    logger.info("Room image uploaded", { assetId: asset.id, roomId, type });
    revalidatePath(`/projects/${room.projectId}/rooms/${roomId}`);

    return { success: true, asset };
  } catch (error) {
    logger.error("Failed to upload room image", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Start generation (redesign mode)
 */
export async function startGeneration(data: {
  roomId: string;
  mode: "redesign" | "replace" | "moodboard" | "shopping_list";
  style?: string;
  roomType: string;
  numVariations?: number;
  keepFurniture?: boolean;
  instructions?: string;
  isHighRes?: boolean;
}) {
  try {
    const userId = await requireUserId();
    const validated = StartGenerationSchema.parse(data);

    // Verify room ownership
    const room = await prisma.room.findFirst({
      where: {
        id: validated.roomId,
        project: { userId },
      },
      include: {
        assets: {
          where: { type: "original" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!room) {
      return { success: false, error: "Room not found or unauthorized" };
    }

    if (room.assets.length === 0) {
      return { success: false, error: "No room image uploaded" };
    }

    const roomImageUrl = room.assets[0].blobUrl;
    const creditsRequired = getCreditsRequired(validated.isHighRes || false, validated.numVariations || 4);

    // Check and deduct credits
    const creditResult = await deductCredits(
      userId,
      creditsRequired,
      `Generation: ${validated.mode}`,
      undefined
    );

    if (!creditResult.success) {
      return { success: false, error: creditResult.error || "Insufficient credits" };
    }

    // Capture transaction ID for refund handling
    const creditTransactionId = creditResult.transactionId;
    if (!creditTransactionId) {
      logger.error("Credit deduction succeeded but no transaction ID returned");
      return { success: false, error: "Failed to record credit transaction" };
    }

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        roomId: validated.roomId,
        mode: validated.mode,
        style: validated.style as any,
        roomType: validated.roomType as any,
        status: GenerationStatus.PENDING,
        creditsUsed: creditsRequired,
        numVariations: validated.numVariations || 4,
        keepFurniture: validated.keepFurniture || false,
        instructions: validated.instructions,
        startedAt: new Date(),
        metadata: {
          creditTransactionId, // Store transaction ID in metadata for refund
        },
      },
    });

    // Start async generation process
    processGeneration(generation.id, creditTransactionId, {
      roomImageUrl,
      mode: validated.mode,
      style: validated.style,
      roomType: validated.roomType,
      numVariations: validated.numVariations || 4,
      keepFurniture: validated.keepFurniture || false,
      instructions: validated.instructions,
    }).catch((error) => {
      logger.error("Generation process failed", error, { generationId: generation.id });
    });

    logger.info("Generation started", { generationId: generation.id, userId });
    revalidatePath(`/projects/${room.projectId}/rooms/${validated.roomId}`);

    return { success: true, generation };
  } catch (error) {
    logger.error("Failed to start generation", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start generation",
    };
  }
}

/**
 * Async generation process
 */
async function processGeneration(
  generationId: string,
  creditTransactionId: string,
  input: {
    roomImageUrl: string;
    mode: string;
    style?: string;
    roomType: string;
    numVariations: number;
    keepFurniture: boolean;
    instructions?: string;
  }
) {
  try {
    await prisma.generation.update({
      where: { id: generationId },
      data: { status: GenerationStatus.PROCESSING },
    });

    // Generate segmentation mask
    let maskUrl: string | undefined;
    try {
      maskUrl = await generateMockSegmentationMask(input.roomImageUrl);
    } catch (error) {
      logger.warn("Failed to generate mask, continuing without mask", error);
    }

    // Call Gemini AI
    const result = await generateRoomRedesign({
      roomImageUrl: input.roomImageUrl,
      maskUrl,
      mode: input.mode as any,
      roomType: input.roomType,
      style: input.style,
      keepFurniture: input.keepFurniture,
      numVariations: input.numVariations,
      instructions: input.instructions,
    });

    // Upload generated images (placeholder - actual implementation needed)
    const uploadedImages: string[] = [];
    for (const image of result.images) {
      // In production, convert base64 to buffer and upload
      const uploaded = await uploadGeneratedImage(
        Buffer.from(image), // Placeholder
        `generations/${generationId}/${Date.now()}.png`,
        "image/png"
      );
      uploadedImages.push(uploaded.url);
    }

    // Update generation record
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.COMPLETED,
        completedAt: new Date(),
        metadata: result.metadata,
        prompt: "Generated", // Would contain actual prompt used
      },
    });

    // Create asset records for generated images
    for (const imageUrl of uploadedImages) {
      await prisma.asset.create({
        data: {
          roomId: (await prisma.generation.findUnique({ where: { id: generationId } }))!.roomId,
          type: "generated",
          blobUrl: imageUrl,
          blobKey: `generations/${generationId}/${Date.now()}`,
          mimeType: "image/png",
          size: 0,
        },
      });
    }

    logger.info("Generation completed", { generationId });
  } catch (error) {
    logger.error("Generation process error", error, { generationId });

    // Refund credits on failure
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        room: {
          include: {
            project: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (generation) {
      // Get the credit transaction ID from generation metadata
      const metadata = generation.metadata as { creditTransactionId?: string } | null;
      const creditTransactionId = metadata?.creditTransactionId;

      if (creditTransactionId) {
        await refundCredits(
          generation.room.project.userId,
          generation.creditsUsed,
          creditTransactionId,
          "Generation failed"
        );
      } else {
        logger.error("Cannot refund credits: transaction ID not found in generation metadata", {
          generationId,
        });
      }

      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : "Generation failed",
        },
      });
    }
  }
}

/**
 * Replace furniture
 */
export async function replaceFurniture(data: {
  roomId: string;
  itemMaskUrl: string;
  style?: string;
  instructions?: string;
}) {
  try {
    const userId = await requireUserId();
    const validated = ReplaceFurnitureSchema.parse(data);

    // Similar to startGeneration but for replace mode
    return await startGeneration({
      roomId: validated.roomId,
      mode: "replace",
      style: validated.style,
      roomType: "OTHER", // Would get from room
      instructions: validated.instructions,
    });
  } catch (error) {
    logger.error("Failed to replace furniture", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to replace furniture",
    };
  }
}

/**
 * Generate moodboard
 */
export async function generateMoodboard(data: {
  roomId: string;
  roomType: string;
  style: string;
}) {
  try {
    const userId = await requireUserId();
    const validated = GenerateMoodboardSchema.parse(data);

    return await startGeneration({
      roomId: validated.roomId,
      mode: "moodboard",
      roomType: validated.roomType,
      style: validated.style,
      numVariations: 1,
    });
  } catch (error) {
    logger.error("Failed to generate moodboard", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate moodboard",
    };
  }
}

/**
 * Generate shopping list
 */
export async function generateShoppingList(generationId: string) {
  try {
    const userId = await requireUserId();
    const validated = GenerateShoppingListSchema.parse({ generationId });

    const generation = await prisma.generation.findFirst({
      where: {
        id: validated.generationId,
        room: {
          project: { userId },
        },
      },
      include: {
        room: {
          include: {
            assets: {
              where: { type: "generated" },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!generation) {
      return { success: false, error: "Generation not found or unauthorized" };
    }

    if (generation.room.assets.length === 0) {
      return { success: false, error: "No generated image found" };
    }

    const imageUrl = generation.room.assets[0].blobUrl;

    // Call Gemini for shopping list generation
    const result = await generateRoomRedesign({
      roomImageUrl: imageUrl,
      mode: "shopping_list",
      roomType: generation.roomType,
    });

    // Update generation metadata with shopping list
    await prisma.generation.update({
      where: { id: validated.generationId },
      data: {
        metadata: {
          ...(generation.metadata as object || {}),
          shopping_list: result.metadata.shopping_list,
        },
      },
    });

    return { success: true, shoppingList: result.metadata.shopping_list };
  } catch (error) {
    logger.error("Failed to generate shopping list", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate shopping list",
    };
  }
}

