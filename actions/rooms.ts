"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { CreateRoomSchema, UpdateRoomSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

/**
 * Create a new room
 */
export async function createRoom(data: {
  name: string;
  roomType: string;
  projectId: string;
}) {
  try {
    const userId = await requireUserId();
    const validated = CreateRoomSchema.parse(data);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, userId },
    });

    if (!project) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    const room = await prisma.room.create({
      data: {
        name: validated.name,
        roomType: validated.roomType as any,
        projectId: validated.projectId,
      },
    });

    logger.info("Room created", { roomId: room.id, projectId: validated.projectId });
    revalidatePath(`/projects/${validated.projectId}`);
    revalidatePath("/projects");

    return { success: true, room };
  } catch (error) {
    logger.error("Failed to create room", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create room",
    };
  }
}

/**
 * Delete a room
 */
export async function deleteRoom(roomId: string) {
  try {
    const userId = await requireUserId();

    // Verify ownership through project
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        project: {
          userId,
        },
      },
      include: { project: true },
    });

    if (!room) {
      return { success: false, error: "Room not found or unauthorized" };
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    logger.info("Room deleted", { roomId, projectId: room.projectId });
    revalidatePath(`/projects/${room.projectId}`);
    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    logger.error("Failed to delete room", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete room",
    };
  }
}

/**
 * Update room
 */
export async function updateRoom(
  roomId: string,
  data: { name?: string; roomType?: string }
) {
  try {
    const userId = await requireUserId();
    const validated = UpdateRoomSchema.parse(data);

    // Verify ownership
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        project: {
          userId,
        },
      },
      include: { project: true },
    });

    if (!room) {
      return { success: false, error: "Room not found or unauthorized" };
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: validated,
    });

    logger.info("Room updated", { roomId });
    revalidatePath(`/projects/${room.projectId}/rooms/${roomId}`);
    revalidatePath(`/projects/${room.projectId}`);

    return { success: true, room: updated };
  } catch (error) {
    logger.error("Failed to update room", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update room",
    };
  }
}

