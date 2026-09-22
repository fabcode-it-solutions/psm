import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import bcrypt from "bcryptjs";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId, adminId, newPassword } = await req.json();

      if (!userId || !adminId || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const user = await db.select().from(users).where(eq(users.id, userId));
      if (!user || user.length === 0) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const admin = await db.select().from(users).where(eq(users.id, adminId));
      if (!admin || admin.length === 0 || admin[0].role !== "superAdmin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change Password Error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);