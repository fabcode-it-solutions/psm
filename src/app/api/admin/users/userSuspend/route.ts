import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { AdminSuspendedUser, users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId, adminId, reason, suspendTime } = await req.json();

      if (!userId || !adminId) {
        return NextResponse.json(
          { success: false, message: "Missing userId or adminId" },
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
      if (!admin || admin.length === 0) {
        return NextResponse.json(
          { success: false, message: "Admin not found" },
          { status: 404 }
        );
      }

      const finalSuspendTime = suspendTime
        ? new Date(suspendTime)
        : new Date(Date.now() + 150 * 365 * 24 * 60 * 60 * 1000);

      const existingSuspension = await db
        .select()
        .from(AdminSuspendedUser)
        .where(eq(AdminSuspendedUser.userId, userId));

      if (existingSuspension.length > 0) {
        await db
          .update(AdminSuspendedUser)
          .set({
            adminId,
            reason: reason || "No reason provided",
            suspendTime: finalSuspendTime,
            updatedAt: new Date(),
          })
          .where(eq(AdminSuspendedUser.userId, userId));
      } else {
        await db.insert(AdminSuspendedUser).values({
          userId,
          adminId,
          reason: reason || "No reason provided",
          suspendTime: finalSuspendTime,
        });
      }

      return NextResponse.json({
        success: true,
        message: "User suspended Permanently",
      });
    } catch (error) {
      console.error("Suspend User Error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

export const PATCH = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId, adminId } = await req.json();

      if (!userId || !adminId) {
        return NextResponse.json(
          { success: false, message: "Missing userId or adminId" },
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

      await db
        .update(AdminSuspendedUser)
        .set({ 
          suspendTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(AdminSuspendedUser.userId, userId));

      return NextResponse.json({
        success: true,
        message: "User unsuspended successfully",
      });
    } catch (error) {
      console.error("Unsuspend User Error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);