import { NextRequest, NextResponse } from "next/server";
import { getUserRecentDevices } from "@/utils/user-activity-helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Correctly type params as a Promise
) {
  try {
    const { id } = await params;  // Await and destructure the id
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const devices = await getUserRecentDevices(userId, 10);

    return NextResponse.json({
      success: true,
      devices,
    });
  } catch (error) {
    console.error("Get user devices error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}