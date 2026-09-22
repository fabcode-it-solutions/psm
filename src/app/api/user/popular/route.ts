import { db } from "@/db/db";
import { users, follows } from "@/db/schema/auth";
import { builds } from "@/db/schema/builds";
import { listings } from "@/db/schema/listings";
import { count, desc, asc, eq, ilike, sql, and, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    // === Extract Params ===
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10))
    );
    const offset = (page - 1) * limit;
    const search = url.searchParams.get("search")?.trim() || "";
    const sortBy = url.searchParams.get("sortBy") || "followersCount";
    const sortOrder =
      url.searchParams.get("sortOrder")?.toLowerCase() === "asc"
        ? "asc"
        : "desc";

    // === Where Condition ===
    let whereCondition = undefined;
    if (search) {
      whereCondition = ilike(users.username, `%${search}%`);
    }

    if (id && id != undefined && id != "undefined") {
      whereCondition = whereCondition
        ? and(whereCondition, ne(users.id, Number(id)))
        : ne(users.id, Number(id));
    }

    // === Count Total Users ===
    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(users)
      .where(whereCondition ?? undefined);
    const followerUser = alias(follows, "followerUser");
    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // === Fetch Users with Followers Count ===
    const popularUsers = await db
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
        followersCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followingId} = ${users.id})
    `.as("followerCount"),
        followingCount: sql<number>`
      (SELECT COUNT(*) FROM ${follows} WHERE ${follows.followerId} = ${users.id})
    `.as("followingCount"),
        buildsCounts: sql<number>`
      (SELECT COUNT(*) FROM ${builds} WHERE ${builds.userId} = ${users.id})
    `.as("buildsCount"),
        listingCounts: sql<number>`
      (SELECT COUNT(*) FROM ${listings} WHERE ${listings.userId} = ${users.id})
    `.as("listingCounts"),
        followers: sql<string>`
      (
        SELECT COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', u.id,
              'username', CASE                            
                            WHEN u.username IS NOT NULL THEN u.username
                            WHEN u.first_name IS NOT NULL THEN u.first_name
                            ELSE 'Guest'
                          END,
              'profileImage', u.profile_image
            )
          ), '[]'::json
        )
        FROM ${follows} f
        JOIN ${users} u ON u.id = f.follower_id
        WHERE f.following_id = ${users.id}
      )
    `.as("followers"),
      })
      .from(users)
      .leftJoin(followerUser, eq(followerUser.followerId, users.id))
      .leftJoin(follows, eq(follows.followerId, users.id))
      .leftJoin(builds, eq(builds.userId, users.id))
      .where(whereCondition ?? undefined)
      .groupBy(users.id)
      .orderBy(
        sortBy === "username"
          ? sortOrder === "desc"
            ? desc(users.username)
            : asc(users.username)
          : sortBy === "createdAt"
          ? sortOrder === "desc"
            ? desc(users.createdAt)
            : asc(users.createdAt)
          : // default followersCount
          sortOrder === "desc"
          ? desc(sql`COUNT(${follows.followerId})`)
          : asc(sql`COUNT(${follows.followerId})`)
      )
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        success: true,
        data: popularUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("<---------- Popular Users API Error ---------->");
    console.error(error);
    console.error("<---------- End Popular Users API Error ---------->");

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
