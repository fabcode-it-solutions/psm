import { db } from "@/db/db";
import { userReports } from "@/db/schema/userBlocks";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const currentUserId = url.searchParams.get("currentUserId");
    const type = url.searchParams.get("type");      
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const uid = Number(userId);
    if (isNaN(uid)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if(type == 'self'){
 const followingRelations = await db
      .select()
      .from(userReports)
      .where(
        and(
          eq(userReports.reportedUserId, Number(currentUserId)),
          eq(userReports.reporterUserId, uid)
        )
      );   
    return NextResponse.json(
      {
        success: true,
        reported: followingRelations.length > 0 ? true : false,
      },
      { status: 200 }
    );
    }
    const followingRelations = await db
      .select()
      .from(userReports)
      .where(
        and(
          eq(userReports.reporterUserId, Number(currentUserId)),
          eq(userReports.reportedUserId, uid)
        )
      );

    return NextResponse.json(
      {
        success: true,
        reported: followingRelations.length > 0 ? true : false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching follow data:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers/following." },
      { status: 500 }
    );
  }
};
