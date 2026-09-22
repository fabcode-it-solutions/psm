import { db } from "@/db/db";
import {  carModels } from "@/db/schema/default";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const brandId = parseInt(id);
    if (!brandId) {
      return NextResponse.json(
        {
          error: "Model Id is required",
        },
        { status: 400 }
      );
    }
    await db.delete(carModels).where(eq(carModels.id, brandId));

    return NextResponse.json(
      {
        success: true,
        message: "Model deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
})

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Model ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const allowedFields = ["name", "description", "image", "status", 'brandId'];
    const updateData: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Handle imageMediaId mapping
    if (body.image !== undefined) {
      updateData.imageMediaId = body.image ? Number(body.image) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(carModels)
      .where(eq(carModels.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    const [updatedCategory] = await db
      .update(carModels)
      .set(updateData)
      .where(eq(carModels.id, categoryId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedCategory,
        message: "Model updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A brand with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update brand. Please try again later",
      },
      { status: 500 }
    );
  }
}
)