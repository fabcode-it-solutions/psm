import { checkRateLimit } from "@/actions/rateLimiter";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { media } from "@/db/schema/media";
import { userReports } from "@/db/schema/userBlocks";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, eq, ilike, asc, desc, count, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported content type. Use application/json." },
      { status: 415 }
    );
  }
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const result = await checkRateLimit(ip, {
    route: "/api/user/report",
    limit: 10,
    windowMs: 1 * 60 * 1000,
    blockMs: 10 * 60 * 1000,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    reporterUserId,
    reportedUserId,
    reason,
    description,
    category,
    imageMediaId,
  } = body;

  if (!reporterUserId || !reportedUserId || !reason) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: reporterUserId, reportedUserId, or reason.",
      },
      { status: 400 }
    );
  }

  try {
    const existing = await db
      .select()
      .from(userReports)
      .where(
        and(
          eq(userReports.reporterUserId, reporterUserId),
          eq(userReports.reportedUserId, reportedUserId),
          eq(userReports.status, "pending")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Report already submitted and pending review.",
        },
        { status: 200 }
      );
    }
    const statusRecord = [
      {
        timestamp: new Date(),
        label: "Reported User",
      },
    ];
    const result = await db
      .insert(userReports)
      .values({
        reporterUserId,
        reportedUserId,
        reason,
        description,
        category,
        statusRecord,
        imageMediaId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "User reported successfully.",
        data: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
})

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const params = {
      id: url.searchParams.get("id") || undefined,
      reporter: url.searchParams.get("reporter") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      search: url.searchParams.get("search") || undefined,
      status: url.searchParams.get("status") || undefined,
      sortBy: url.searchParams.get("sortBy") || "createdAt",
      sortOrder: url.searchParams.get("sortOrder") || "desc",
    };

    if (params.id) {
      const reportId = Number(params.id);
      if (isNaN(reportId)) {
        return NextResponse.json(
          { error: "Invalid report ID" },
          { status: 400 }
        );
      }

      const report = await db
        .select({
          id: userReports.id,
          reporterUserId: userReports.reporterUserId,
          reportedUserId: userReports.reportedUserId,
          reportedUserName: sql<string>`
                CASE 
                  WHEN ${users.anonymous} = TRUE THEN 'Anonymous'
                  WHEN ${users.username} IS NOT NULL THEN ${users.username}
                  WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
                  ELSE 'Guest'
                END
              `.as("reportedUserName"),
          reason: userReports.reason,
          description: userReports.description,
          category: userReports.category,
          status: userReports.status,
          adminNotes: userReports.adminNotes,
          reviewedBy: userReports.reviewedBy,
          reviewedAt: userReports.reviewedAt,
          createdAt: userReports.createdAt,
          updatedAt: userReports.updatedAt,
          reportId: userReports.reportId,
          imageUrl: media.url,
          imageAlt: media.altText,
        })
        .from(userReports)
        .leftJoin(media, eq(media.id, userReports.imageMediaId))
        .leftJoin(users, eq(users.id, userReports.reportedUserId))
        .where(eq(userReports.id, reportId));

      if (!report.length) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: report[0] }, { status: 200 });
    }

    // === 2️⃣ Pagination, Search, Filter by Status ===
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(params.limit || "10", 10))
    );
    const offset = (page - 1) * limit;
    const search = params.search?.trim() || "";
    const sortOrder = params.sortOrder.toLowerCase() === "asc" ? asc : desc;

    let whereCondition = undefined;
    if (params.reporter) {
      whereCondition = eq(
        userReports.reporterUserId,
        parseInt(params.reporter)
      );
    }
    if (search) {
      whereCondition = and(
        whereCondition,
        ilike(userReports.reason, `%${search}%`)
      );
    }

    if (params.status) {
      whereCondition = and(
        whereCondition,
        eq(userReports.status, params.status)
      );
    }

    // Count total items
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(userReports)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // Sorting
    const sortColumn =
      params.sortBy === "status"
        ? userReports.status
        : params.sortBy === "updatedAt"
        ? userReports.updatedAt
        : userReports.createdAt;

    const reports = await db
      .select({
        id: userReports.id,
        reporterUserId: userReports.reporterUserId,
        reportedUserId: userReports.reportedUserId,
        reportedUserName: sql<string>`
                CASE 
                  WHEN ${users.anonymous} = TRUE THEN 'Anonymous'
                  WHEN ${users.username} IS NOT NULL THEN ${users.username}
                  WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
                  ELSE 'Guest'
                END
              `.as("reportedUserName"),
        reason: userReports.reason,
        description: userReports.description,
        category: userReports.category,
        status: userReports.status,
        adminNotes: userReports.adminNotes,
        reviewedBy: userReports.reviewedBy,
        reviewedAt: userReports.reviewedAt,
        createdAt: userReports.createdAt,
        updatedAt: userReports.updatedAt,
        reportId: userReports.reportId,
        imageUrl: media.url,
        imageAlt: media.altText,
      })
      .from(userReports)
      .leftJoin(media, eq(media.id, userReports.imageMediaId))
      .leftJoin(users, eq(users.id, userReports.reportedUserId))
      .where(whereCondition ?? undefined)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    const response = {
      data: reports,
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
    console.error("<----------UserReports Route Error------------>");
    console.error(error);
    console.error("<----------End UserReports Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report id is required." },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object is required." },
        { status: 400 }
      );
    }

    const allowedFields = [
      "reason",
      "description",
      "category",
      "status",
      "adminNotes",
      "reviewedBy",
      "reviewedAt",
      "statusRecord",
    ];

    const sanitizedUpdates: Record<string, string | boolean | Date | null> = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    sanitizedUpdates.updatedAt = new Date();

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const result = await db
      .update(userReports)
      .set(sanitizedUpdates)
      .where(eq(userReports.id, Number(id)))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: "Report not found or no changes made." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Report updated successfully.",
        data: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("<---------- Update Report Route Error ---------->");
    console.error(error);
    console.error("<---------- End Error ---------->");

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
};
