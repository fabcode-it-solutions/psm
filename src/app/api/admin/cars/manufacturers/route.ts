import { db } from "@/db/db";
import { manufacturers } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { ManufacturerBase, QueryParams } from "@/types";
import { eq, desc, asc, count, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export const  POST = withFullCsrfProtection(async (req: NextRequest): Promise<NextResponse> => {
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

    const { name, logo, image, description, subTitle, status } = body;

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required",
        },
        { status: 400 }
      );
    }
    const insertData: typeof manufacturers.$inferInsert = {
      name,
      logoMediaId: Number(logo),
    };
    if (image) {
      insertData.imageMediaId = Number(image);
    }
    if (subTitle) {
      insertData.subTitle = subTitle;
    }
    if (description) {
      insertData.description = description;
    }
    if (status) {
      insertData.status = status;
    }
    const result = await db
      .insert(manufacturers)
      .values(insertData)
      .returning();

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
        message: "Manufacturer has been added successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Manufacturer creation error:", error);
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
    const params: QueryParams = {
      id: url.searchParams.get("id") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
      includeBuilds: url.searchParams.get("includeBuilds") || undefined,
    };

    const logoMedia = alias(media, "logoMedia");
    const imageMedia = alias(media, "imageMedia");

    // === 1️⃣ Single Manufacturer by ID ===
    if (params.id) {
      const manufacturerId = Number(params.id);
      if (isNaN(manufacturerId)) {
        return NextResponse.json(
          { error: "Invalid manufacturer ID" },
          { status: 400 }
        );
      }

      const manufacturerRows = await db
        .select({
          manufacturerId: manufacturers.id,
          name: manufacturers.name,
          description: manufacturers.description,
          subTitle: manufacturers.subTitle,
          status: manufacturers.status,
          createdAt: manufacturers.createdAt,
          updatedAt: manufacturers.updatedAt,
          logo: {
            id: logoMedia.id,
            url: logoMedia.url,
            type: logoMedia.type,
            alt: logoMedia.altText,
          },
          image: {
            id: imageMedia.id,
            url: imageMedia.url,
            type: imageMedia.type,
            alt: imageMedia.altText,
          },
        })
        .from(manufacturers)
        .leftJoin(logoMedia, eq(manufacturers.logoMediaId, logoMedia.id))
        .leftJoin(imageMedia, eq(manufacturers.imageMediaId, imageMedia.id))
        .where(eq(manufacturers.id, manufacturerId));

      if (!manufacturerRows.length) {
        return NextResponse.json(
          { error: "Manufacturer not found" },
          { status: 404 }
        );
      }

      const manufacturer: ManufacturerBase = {
        id: manufacturerRows[0].manufacturerId,
        name: manufacturerRows[0].name,
        logo: {
          id: Number(manufacturerRows[0].logo?.id),
          alt: manufacturerRows[0].logo?.alt ?? "",
          url: manufacturerRows[0].logo?.url ?? "",
        },
        image: {
          id: Number(manufacturerRows[0].image?.id),
          alt: manufacturerRows[0].image?.alt ?? "",
          url: manufacturerRows[0].image?.url ?? "",
        },
        description: manufacturerRows[0].description,
        subTitle: manufacturerRows[0].subTitle,
        status: manufacturerRows[0].status,
        createdAt: manufacturerRows[0].createdAt,
        updatedAt: manufacturerRows[0].updatedAt,
      };

      return NextResponse.json({ data: manufacturer }, { status: 200 });
    }

    // === 2️⃣ Pagination, Search, Sort ===
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(params.limit || "10", 10))
    );
    const offset = (page - 1) * limit;
    const search = params.search?.trim() || "";
    const sortBy = params.sortBy || "name";
    const sortOrder =
      params.sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";

    let whereCondition = undefined;
    if (search) {
      whereCondition = ilike(manufacturers.name, `%${search}%`);
    }

    // Count total items
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(manufacturers)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    const sortColumn =
      sortBy === "createdAt"
        ? manufacturers.createdAt
        : sortBy === "updatedAt"
        ? manufacturers.updatedAt
        : sortBy === "status"
        ? manufacturers.status
        : sortBy === "subTitle"
        ? manufacturers.subTitle
        : manufacturers.name;

    const result = await db
      .select({
        id: manufacturers.id,
        name: manufacturers.name,
        description: manufacturers.description,
        subTitle: manufacturers.subTitle,
        status: manufacturers.status,
        createdAt: manufacturers.createdAt,
        updatedAt: manufacturers.updatedAt,
        logo: {
          id: logoMedia.id,
          url: logoMedia.url,
          type: logoMedia.type,
          alt: logoMedia.altText,
        },
        image: {
          id: imageMedia.id,
          url: imageMedia.url,
          type: imageMedia.type,
          alt: imageMedia.altText,
        },
      })
      .from(manufacturers)
      .leftJoin(logoMedia, eq(manufacturers.logoMediaId, logoMedia.id))
      .leftJoin(imageMedia, eq(manufacturers.imageMediaId, imageMedia.id))
      .where(whereCondition ?? undefined)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    const response = {
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      success: true,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("<----------Manufacturer Route Error------------>");
    console.error(error);
    console.error("<----------End Manufacturer Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
