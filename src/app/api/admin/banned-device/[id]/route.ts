import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { bannedDevices } from "@/db/schema/userBlocks";

export const DELETE = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  const banId = Number(id);
  if (isNaN(banId)) {
    return NextResponse.json(
      { success: false, message: "Invalid ban ID" },
      { status: 400 }
    );
  }

  const deleted = await db
    .delete(bannedDevices)
    .where(eq(bannedDevices.id, banId))
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json(
      { success: false, message: "Ban not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Ban removed successfully",
  });
};