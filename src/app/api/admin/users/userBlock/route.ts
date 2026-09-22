import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { AdminBlockedUser, users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { bannedDevices } from "@/db/schema/userBlocks";

import { getUserMostRecentDevice, } from "@/utils/user-activity-helper";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { userId, adminId, reason, blockTime, blockDevice, blockIp } = 
      await req.json();

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

    // ✅ KEY FIX: Get the BLOCKED USER's most recent device/IP from activities
    const recentDevice = await getUserMostRecentDevice(userId);
    
    if (!recentDevice && (blockDevice || blockIp)) {
      return NextResponse.json({
        success: false,
        message: "Cannot block device/IP: User has no recent activity recorded",
      }, { status: 400 });
    }

    const ipAddress = recentDevice?.ipAddress || "unknown";
    const deviceFingerprint = recentDevice?.deviceFingerprint || "unknown";

    const finalBlockTime = blockTime
      ? new Date(blockTime)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Block the user account
    const existingBlock = await db
      .select()
      .from(AdminBlockedUser)
      .where(eq(AdminBlockedUser.userId, userId));

    if (existingBlock.length > 0) {
      await db
        .update(AdminBlockedUser)
        .set({
          adminId,
          reason: reason || "No reason provided",
          blockTime: finalBlockTime,
        })
        .where(eq(AdminBlockedUser.userId, userId));
    } else {
      await db.insert(AdminBlockedUser).values({
        userId,
        adminId,
        reason: reason || "No reason provided",
        blockTime: finalBlockTime,
      });
    }

    // Block device/IP if requested
    if (blockDevice || blockIp) {
      await db.insert(bannedDevices).values({
        userId: userId, // Track which user this ban belongs to
        ipAddress: blockIp ? ipAddress : null,
        deviceFingerprint: blockDevice ? deviceFingerprint : null,
        reason: reason || "No reason provided",
        bannedBy: adminId,
        expiresAt: finalBlockTime,
      });
    }

    return NextResponse.json({
      success: true,
      message: "User blocked successfully",
      blockedDevice: blockDevice,
      blockedIp: blockIp,
      ipAddress: blockIp ? ipAddress : undefined,
      deviceFingerprint: blockDevice ? deviceFingerprint?.substring(0, 20) + "..." : undefined,
      lastActivity: recentDevice?.createdAt,
    });
  } catch (error) {
    console.error("Block User Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};

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
      .update(AdminBlockedUser)
      .set({ blockTime: new Date() })
      .where(eq(AdminBlockedUser.userId, userId));

    return NextResponse.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock User Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
)