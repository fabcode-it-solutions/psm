import { db } from "@/db/db";
import { metafieldDefinitions } from "@/db/schema/metafields";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const partId = parseInt(id);
        
    const [existing] = await db
      .select()
      .from(metafieldDefinitions)
      .where(eq(metafieldDefinitions.id, partId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Metafield definition not found" },
        { status: 404 }
      );
    }

 
    await db
      .delete(metafieldDefinitions)
      .where(eq(metafieldDefinitions.id, partId));

    return NextResponse.json({
      success: true,
      message: "Metafield definition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete part" },
      { status: 500 }
    );
  }
}
)