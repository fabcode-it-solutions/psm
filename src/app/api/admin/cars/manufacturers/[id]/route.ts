import { db } from "@/db/db";
import { manufacturers } from "@/db/schema/default";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const manufacturerId = parseInt(id);

    if (!manufacturerId || isNaN(manufacturerId)) {
      return NextResponse.json(
        {
          error: "Valid Manufacturer ID is required",
        },
        { status: 400 }
      );
    }

    // Check if manufacturer exists before deletion
    const [existing] = await db
      .select({ id: manufacturers.id })
      .from(manufacturers)
      .where(eq(manufacturers.id, manufacturerId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        {
          error: "Manufacturer not found",
        },
        { status: 404 }
      );
    }

    await db.delete(manufacturers).where(eq(manufacturers.id, manufacturerId));

    return NextResponse.json(
      {
        success: true,
        message: "Manufacturer deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting manufacturer:", error);

    if (error instanceof Error && error.message.includes("foreign key constraint")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete manufacturer as it is referenced by other records" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete manufacturer" },
      { status: 500 }
    );
  }
}
)
export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const manufacturerId = parseInt(id);

    if (isNaN(manufacturerId) || manufacturerId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid Manufacturer ID" },
        { status: 400 }
      );
    }

    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Use application/json" },
        { status: 415 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const allowedFields = ["name", "description", "subTitle", "logo", "image", "status"];
    const updateData: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "logo") {
          updateData.logoMediaId = body[key] ? Number(body[key]) : null;
        } else if (key === "image") {
          updateData.imageMediaId = body[key] ? Number(body[key]) : null;
        } else {
          updateData[key] = body[key];
        }
      }
    }

    // Validate required fields if provided
    if (body.name !== undefined && (!body.name || typeof body.name !== "string" || body.name.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "Name must be a non-empty string" },
        { status: 400 }
      );
    }

    if (body.status !== undefined && !["active", "inactive"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Status must be either 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Check if manufacturer exists
    const [existing] = await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, manufacturerId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Manufacturer not found" },
        { status: 404 }
      );
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const [updatedManufacturer] = await db
      .update(manufacturers)
      .set(updateData)
      .where(eq(manufacturers.id, manufacturerId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedManufacturer,
        message: "Manufacturer updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating manufacturer:", error);

    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return NextResponse.json(
          { success: false, error: "A manufacturer with this name already exists" },
          { status: 409 }
        );
      }

      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          { success: false, error: "Invalid media reference provided" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update manufacturer. Please try again later",
      },
      { status: 500 }
    );
  }
})

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const manufacturerId = parseInt(id);

    if (isNaN(manufacturerId) || manufacturerId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid Manufacturer ID" },
        { status: 400 }
      );
    }

    const [manufacturer] = await db
      .select()
      .from(manufacturers)
      .where(eq(manufacturers.id, manufacturerId))
      .limit(1);

    if (!manufacturer) {
      return NextResponse.json(
        { success: false, error: "Manufacturer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: manufacturer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch manufacturer",
      },
      { status: 500 }
    );
  }
}