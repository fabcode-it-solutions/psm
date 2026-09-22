/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { userReports } from "@/db/schema/userBlocks";
import { users } from "@/db/schema/auth";
import { sql, desc, asc, eq, ilike, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;
    const sort = url.searchParams.get("sort") || "desc";
    const search = url.searchParams.get("search")?.trim() || "";

    const reportedUsers = alias(users, "reported_users");

    // ✅ Search condition with OR
    let searchCondition: any = undefined;
    if (search) {
      searchCondition = or(
        ilike(users.username, `%${search}%`),
        ilike(reportedUsers.username, `%${search}%`),
        ilike(userReports.reason, `%${search}%`),
        ilike(userReports.category, `%${search}%`)
      );
    }

    // ✅ Query data
    const reports = await db
      .select({
        id: userReports.id,
        reporterUserId: userReports.reporterUserId,
        reportedUserId: userReports.reportedUserId,

        reporterUserName: sql<string>`
          CASE 
            WHEN ${users.anonymous} = TRUE THEN 'Anonymous'
            WHEN ${users.username} IS NOT NULL THEN ${users.username}
            WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
            ELSE 'Guest'
          END
        `.as("reporterUserName"),

        reportedUserName: sql<string>`
          CASE 
            WHEN ${reportedUsers.anonymous} = TRUE THEN 'Anonymous'
            WHEN ${reportedUsers.username} IS NOT NULL THEN ${reportedUsers.username}
            WHEN ${reportedUsers.firstName} IS NOT NULL THEN ${reportedUsers.firstName}
            ELSE 'Guest'
          END
        `.as("reportedUserName"),

        reason: userReports.reason,
        description: userReports.description,
        category: userReports.category,
        status: userReports.status,
        createdAt: userReports.createdAt,
        updatedAt: userReports.updatedAt,
        reviewedBy: userReports.reviewedBy,
        reviewedAt: userReports.reviewedAt,
      })
      .from(userReports)
      .leftJoin(users, eq(users.id, userReports.reporterUserId))
      .leftJoin(reportedUsers, eq(reportedUsers.id, userReports.reportedUserId))
      .where(searchCondition ?? undefined)
      .orderBy(sort === "asc" ? asc(userReports.createdAt) : desc(userReports.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userReports)
      .leftJoin(users, eq(users.id, userReports.reporterUserId))
      .leftJoin(reportedUsers, eq(reportedUsers.id, userReports.reportedUserId))
      .where(searchCondition ?? undefined);

    return new Response(
      JSON.stringify({
        success: true,
        data: reports,
        pagination: {
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
          currentPage: page,
          limit,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("UserReports Route Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500 }
    );
  }
};
