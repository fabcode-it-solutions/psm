import { db } from "@/db/db";
import { carBrands } from "@/db/schema/default";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// export async function DELETE(req: NextRequest) {
export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const brandId = parseInt(id);
    if (!brandId) {
      return NextResponse.json(
        {
          error: "Brand Id is required",
        },
        { status: 400 }
      );
    }
    await db.delete(carBrands).where(eq(carBrands.id, brandId));

    return NextResponse.json(
      {
        success: true,
        message: "Brand deleted successfully",
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
        { success: false, error: "Invalid Brand ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const allowedFields = ["name", "description", "logo", "image", "status"];
    const updateData: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    if (body.logo !== undefined) {
      updateData.logoMediaId = body.logo ? Number(body.logo) : null;
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
      .from(carBrands)
      .where(eq(carBrands.id, categoryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    const [updatedCategory] = await db
      .update(carBrands)
      .set(updateData)
      .where(eq(carBrands.id, categoryId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedCategory,
        message: "Brand updated successfully.",
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