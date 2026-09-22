import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const { tag } = await req.json();

    if (!tag) {
      return NextResponse.json(
        { message: "Tag is required" },
        { status: 400 }
      );
    }

    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 }
    );
  }
})
