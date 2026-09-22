/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { bannedDevices } from "@/db/schema/userBlocks";

export const GET = (
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const devices = await db
        .select()
        .from(bannedDevices)
        .orderBy(bannedDevices.createdAt);

      return NextResponse.json({
        success: true,
        devices,
      });
    } catch (error) {
      console.error("Fetch banned devices error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);