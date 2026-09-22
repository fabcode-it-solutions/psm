// File: src/app/api/parts/bulk/status/route.ts

import { db } from "@/db/db";
import { parts } from "@/db/schema/parts";
import { users } from "@/db/schema/auth";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const { partIds, status, userId } = body;

      // Validate input
      if (!partIds || !Array.isArray(partIds) || partIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "Part IDs are required" },
          { status: 400 }
        );
      }

      if (!status || !["active", "draft", "archived"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Valid status is required (active, draft, archived)" },
          { status: 400 }
        );
      }

      // Optional: Check user permissions
      if (userId) {
        const checkUser = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!checkUser[0] || checkUser[0].role !== "superAdmin") {
          return NextResponse.json(
            { success: false, error: "Action not allowed" },
            { status: 403 }
          );
        }
      }

      // Update parts status
      const result = await db
        .update(parts)
        .set({
          status: status,
          updatedAt: new Date(),
        })
        .where(inArray(parts.id, partIds))
        .returning({ id: parts.id, title: parts.title });

      return NextResponse.json(
        {
          success: true,
          message: `Successfully updated ${result.length} part(s)`,
          data: result,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating parts status:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update parts status",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
);