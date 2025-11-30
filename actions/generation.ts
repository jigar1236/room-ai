"use server";

import { requireUserId } from "@/lib/auth";
import { deductCredits, getCreditsRequired, refundCredits } from "@/lib/credits";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { uploadRoomImage, uploadGeneratedImage } from "@/lib/blob";
import { generateDesignImages } from "@/lib/imagen";
import { GenerationStatus, StyleType, RoomType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Create a new design and generate AI images
 */
export async function createDesign(data: {
  imageBuffer: Buffer;
  imageName: string;
  imageMimeType: string;
  style: StyleType;
  roomType: RoomType;
  instructions?: string;
}) {
  const userId = await requireUserId();

  // Check and deduct credits
  const creditsRequired = getCreditsRequired(false, 4);
  const creditResult = await deductCredits(
    userId,
    creditsRequired,
    "Design generation",
    undefined
  );

  if (!creditResult.success) {
    throw new Error(creditResult.error || "Insufficient credits");
  }

  const creditTransactionId = creditResult.transactionId;
  if (!creditTransactionId) {
    throw new Error("Failed to record credit transaction");
  }

  let design;

  try {
    // Upload original image
    const uploadResult = await uploadRoomImage(
      data.imageBuffer,
      `designs/${userId}/${Date.now()}-${data.imageName}`,
      data.imageMimeType
    );

    // Create design record
    design = await prisma.design.create({
      data: {
        userId,
        name: `Design ${new Date().toLocaleDateString()}`,
        roomType: data.roomType,
        style: data.style,
        originalUrl: uploadResult.url,
        originalKey: uploadResult.key,
        instructions: data.instructions,
        status: GenerationStatus.PROCESSING,
        creditsUsed: creditsRequired,
      },
    });

    // Generate AI images
    const generatedImages = await generateDesignImages({
      originalImageUrl: uploadResult.url,
      style: data.style,
      roomType: data.roomType,
      instructions: data.instructions,
      numVariations: 4,
    });

    // Save generated images
    const savedImages = await Promise.all(
      generatedImages.map(async (imageData, index) => {
        try {
          let imageUrl = imageData.url;
          let imageKey = imageData.url;

          // If base64, upload to blob storage
          if (imageData.url.startsWith("data:image")) {
            const base64Data = imageData.url.split(",")[1];
            if (base64Data) {
              const buffer = Buffer.from(base64Data, "base64");
              const uploaded = await uploadGeneratedImage(
                buffer,
                `generated/${design!.id}/${Date.now()}-${index}.png`,
                "image/png"
              );
              imageUrl = uploaded.url;
              imageKey = uploaded.key;
            }
          }

          return prisma.generatedImage.create({
            data: {
              designId: design!.id,
              imageUrl,
              imageKey,
              metadata: imageData.metadata,
            },
          });
        } catch (error) {
          logger.error("Failed to save generated image", error, { index });
          return null;
        }
      })
    );

    const validImages = savedImages.filter((img) => img !== null);

    if (validImages.length === 0) {
      throw new Error("No images were generated successfully");
    }

    // Update design status
    await prisma.design.update({
      where: { id: design.id },
      data: { status: GenerationStatus.COMPLETED },
    });

    revalidatePath("/dashboard");
    revalidatePath("/gallery");

    return {
      designId: design.id,
      generations: validImages.map((img) => ({
        id: img!.id,
        imageUrl: img!.imageUrl,
        isFavorite: img!.isFavorite,
      })),
    };
  } catch (error) {
    logger.error("Design generation failed", error);

    // Refund credits
    try {
      await refundCredits(
        userId,
        creditsRequired,
        creditTransactionId,
        "Generation failed"
      );
    } catch (refundError) {
      logger.error("Failed to refund credits", refundError);
    }

    // Update design status if it exists
    if (design) {
      await prisma.design.update({
        where: { id: design.id },
        data: {
          status: GenerationStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : "Generation failed",
        },
      });
    }

    throw error instanceof Error ? error : new Error("Failed to generate design");
  }
}

/**
 * Get user's recent designs
 */
export async function getRecentDesigns(limit: number = 8) {
  const userId = await requireUserId();

  const designs = await prisma.design.findMany({
    where: {
      userId,
      status: GenerationStatus.COMPLETED,
    },
    include: {
      generations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return designs;
}

/**
 * Get all user designs for gallery
 */
export async function getAllDesigns(options?: {
  page?: number;
  limit?: number;
  favoritesOnly?: boolean;
}) {
  const userId = await requireUserId();
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    userId,
    status: GenerationStatus.COMPLETED,
  };

  if (options?.favoritesOnly) {
    where.generations = {
      some: { isFavorite: true },
    };
  }

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where,
      include: {
        generations: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.design.count({ where }),
  ]);

  return {
    designs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Toggle favorite status of a generated image
 */
export async function toggleFavorite(imageId: string) {
  const userId = await requireUserId();

  // Verify ownership
  const image = await prisma.generatedImage.findFirst({
    where: {
      id: imageId,
      design: { userId },
    },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  const updated = await prisma.generatedImage.update({
    where: { id: imageId },
    data: { isFavorite: !image.isFavorite },
  });

  revalidatePath("/gallery");

  return { isFavorite: updated.isFavorite };
}

/**
 * Delete a design and all its generated images
 */
export async function deleteDesign(designId: string) {
  const userId = await requireUserId();

  // Verify ownership
  const design = await prisma.design.findFirst({
    where: { id: designId, userId },
  });

  if (!design) {
    throw new Error("Design not found");
  }

  await prisma.design.delete({
    where: { id: designId },
  });

  revalidatePath("/gallery");

  return { success: true };
}

/**
 * Get a single design by ID
 */
export async function getDesign(designId: string) {
  const userId = await requireUserId();

  const design = await prisma.design.findFirst({
    where: { id: designId, userId },
    include: {
      generations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!design) {
    throw new Error("Design not found");
  }

  return design;
}
