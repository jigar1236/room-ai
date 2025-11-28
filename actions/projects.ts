"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { CreateProjectSchema, UpdateProjectSchema } from "@/lib/validate";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

/**
 * Create a new project
 */
export async function createProject(data: { name: string; description?: string }) {
  try {
    const userId = await requireUserId();
    const validated = CreateProjectSchema.parse(data);

    const project = await prisma.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        userId,
      },
    });

    logger.info("Project created", { projectId: project.id, userId });
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true, project };
  } catch (error) {
    logger.error("Failed to create project", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  try {
    const userId = await requireUserId();

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    logger.info("Project deleted", { projectId, userId });
    revalidatePath("/projects");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    logger.error("Failed to delete project", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  data: { name?: string; description?: string }
) {
  try {
    const userId = await requireUserId();
    const validated = UpdateProjectSchema.parse(data);

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: validated,
    });

    logger.info("Project updated", { projectId, userId });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");

    return { success: true, project: updated };
  } catch (error) {
    logger.error("Failed to update project", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

