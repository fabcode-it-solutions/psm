import { db } from "@/db/db";
import { follows, users } from "@/db/schema/auth";
import { QueryParams } from "@/types";
import { eq, desc, count, ilike, sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const params: QueryParams = {
      id: url.searchParams.get("id") || undefined,
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "14",
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
      includeBuilds: url.searchParams.get("includeBuilds") || undefined,
    };
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(params.limit || "10", 10))
    );
    const offset = (page - 1) * limit;
    const search = params.search?.trim() || "";
    const id = params.id?.trim() || "";
    let whereCondition = undefined;

    if (search) {
      whereCondition = ilike(users.username, `%${search}%`);
    }

    if (params.includeBuilds === "followers") {
      if (id) {
        whereCondition = eq(follows.followingId, Number(id));
      }
      const totalCountResult = await db
        .select({ count: count().as("count") })
        .from(follows)
        .leftJoin(users, eq(users.id, follows.followerId))
        .where(whereCondition ?? undefined);

      const totalItems = Number(totalCountResult[0]?.count || 0);
      const totalPages = Math.ceil(totalItems / limit);
      const rows = await db
        .select({
          id: users.id,
          username: sql<string>`
                CASE 
                  WHEN ${users.username} IS NOT NULL THEN ${users.username}
                  WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
                  ELSE 'Guest'
                END
              `.as("username"),
          isMutual: sql<boolean>`
      EXISTS (
        SELECT 1 
        FROM ${follows} f2
        WHERE f2.follower_id = ${users.id} 
          AND f2.following_id = ${id}
      )
    `.as("isMutual"),
          profileImage: users.profileImage,
        })
        .from(follows)
        .leftJoin(users, eq(users.id, follows.followerId))
        .where(whereCondition ?? undefined)
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset);

      const response = {
        data: rows,
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
    }
    if (id) {
      whereCondition = eq(follows.followerId, Number(id));
    }
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(follows)
      .leftJoin(users, eq(users.id, follows.followingId))
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);
    const rows = await db
      .select({
        id: users.id,
        username: sql<string>`
                CASE 
                  WHEN ${users.username} IS NOT NULL THEN ${users.username}
                  WHEN ${users.firstName} IS NOT NULL THEN ${users.firstName}
                  ELSE 'Guest'
                END
              `.as("username"),
        profileImage: users.profileImage,
      })
      .from(follows)
      .leftJoin(users, eq(users.id, follows.followingId))
      .where(whereCondition ?? undefined)
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset);

    const response = {
      data: rows,
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
    console.error("<----------Brand Route Error------------>");
    console.error(error);
    console.error("<----------End Brand Route Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
