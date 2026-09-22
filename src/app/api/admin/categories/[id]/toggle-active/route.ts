import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export const PATCH = withFullCsrfProtection(
  async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const id = pathSegments[pathSegments.length - 2];
      const categoryId = parseInt(id);

      if (isNaN(categoryId)) {
        return NextResponse.json(
          { success: false, error: "Invalid category ID" },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { isActive } = body;

      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { success: false, error: "isActive must be a boolean" },
          { status: 400 }
        );
      }

      const [existing] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }

      const [updated] = await db
        .update(categories)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(categories.id, categoryId))
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: `Category ${
            isActive ? "Unhidden" : "Hidden"
          } successfully.`,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error toggling category status:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to toggle category status. Please try again later.",
        },
        { status: 500 }
      );
    }
  }
);
