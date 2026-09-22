import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { createBuild } from "@/models/build.model";
import { getAllCarBrand, getCarBrandById } from "@/models/cars.model";

import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { brandId, modelId, typeId, userId, licensePlate, vinNumber } = body;
    if (!brandId || !modelId || !typeId || !userId) {
      return NextResponse.json(
        {
          error: "Missing Require fields",
        },
        { status: 400 }
      );
    }
    const result = await createBuild({
      brandId,
      modelId,
      typeId,
      userId,
      licensePlate,
      vinNumber,
    });
    if (result && typeof result === "object" && "error" in result) {
      return NextResponse.json(
        {
          error: (result as { error: string }).error,
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Build has been added successfully.",
        result
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Unexpected error: Please try again later" },
      { status: 500 }
    );
  }
}
)

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const result = await getCarBrandById(Number(id));
      if (result && typeof result === "object" && "error" in result) {
        return NextResponse.json(
          {
            error: (result as { error: string }).error,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ data: result }, { status: 200 });
    }
    const result = await getAllCarBrand();
    if (result && typeof result === "object" && "error" in result) {
      return NextResponse.json(
        {
          error: (result as { error: string }).error,
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("<----------Policies Route Error------------>");
    let errorMessage = "An unknown error occurred";
    if (
      typeof error === "object" &&
      error !== null &&
      "errorResponse" in (error as Record<string, unknown>) &&
      typeof (error as { errorResponse?: unknown }).errorResponse ===
        "object" &&
      (error as { errorResponse?: unknown }).errorResponse !== null &&
      "errmsg" in
        ((error as { errorResponse?: { errmsg?: unknown } })
          .errorResponse as Record<string, unknown>)
    ) {
      errorMessage = String(
        (
          (error as { errorResponse?: { errmsg?: unknown } }).errorResponse as {
            errmsg?: unknown;
          }
        ).errmsg
      );
      console.error(errorMessage);
    } else {
      console.error(error);
    }
    console.error("<----------End Policies Route Error------------>");
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
