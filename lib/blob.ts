import { del, head, put } from "@vercel/blob";
import { logger } from "./logger";
import { validateImageFile } from "./validate";

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set");
}

export interface BlobUploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

/**
 * Upload room image to Vercel Blob
 */
export async function uploadRoomImage(
  file: File | Buffer,
  filename: string,
  mimeType: string = "image/jpeg"
): Promise<BlobUploadResult> {
  try {
    // Get file size before upload as fallback
    const fileSize = file instanceof Buffer ? file.length : (file as File).size;

    const blob = await put(filename, file, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    });

    logger.info("Room image uploaded", { url: blob.url, key: blob.pathname });

    return {
      url: blob.url,
      key: blob.pathname,
      size: (blob as unknown as { size: number }).size ?? fileSize,
      mimeType:
        (blob as unknown as { contentType: string }).contentType || mimeType,
    };
  } catch (error) {
    logger.error("Failed to upload room image", error);
    throw new Error("Failed to upload image to storage");
  }
}

/**
 * Upload segmentation mask image
 */
export async function uploadMaskImage(
  file: File | Buffer,
  filename: string,
  mimeType: string = "image/png"
): Promise<BlobUploadResult> {
  try {
    const blob = await put(filename, file, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    });

    logger.info("Mask image uploaded", { url: blob.url, key: blob.pathname });

    return {
      url: blob.url,
      key: blob.pathname,
      size: (blob as unknown as { size: number }).size,
      mimeType:
        (blob as unknown as { contentType: string }).contentType || mimeType,
    };
  } catch (error) {
    logger.error("Failed to upload mask image", error);
    throw new Error("Failed to upload mask to storage");
  }
}

/**
 * Upload generated AI image
 */
export async function uploadGeneratedImage(
  file: File | Buffer,
  filename: string,
  mimeType: string = "image/png"
): Promise<BlobUploadResult> {
  try {
    const blob = await put(filename, file, {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: mimeType,
    });

    logger.info("Generated image uploaded", {
      url: blob.url,
      key: blob.pathname,
    });

    return {
      url: blob.url,
      key: blob.pathname,
      size: (blob as unknown as { size: number }).size,
      mimeType:
        (blob as unknown as { contentType: string }).contentType || mimeType,
    };
  } catch (error) {
    logger.error("Failed to upload generated image", error);
    throw new Error("Failed to upload generated image to storage");
  }
}

/**
 * Delete blob from Vercel Blob storage
 */
export async function deleteBlob(key: string): Promise<void> {
  try {
    await del(key, { token: BLOB_READ_WRITE_TOKEN });
    logger.info("Blob deleted", { key });
  } catch (error) {
    logger.error("Failed to delete blob", error, { key });
    // Don't throw - deletion failures are not critical
  }
}

/**
 * Get blob metadata
 */
export async function getBlobMetadata(key: string): Promise<{
  size: number;
  mimeType: string;
  uploadedAt: Date;
} | null> {
  try {
    const blob = await head(key, { token: BLOB_READ_WRITE_TOKEN });
    return {
      size: blob.size,
      mimeType: blob.contentType || "application/octet-stream",
      uploadedAt: new Date(blob.uploadedAt),
    };
  } catch (error) {
    logger.error("Failed to get blob metadata", error, { key });
    return null;
  }
}

/**
 * Validate and upload image file
 */
export async function validateAndUploadImage(
  file: File,
  filename: string
): Promise<BlobUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file");
  }

  return uploadRoomImage(file, filename, file.type);
}
