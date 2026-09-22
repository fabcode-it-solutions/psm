import { sendEmail } from "@/actions/mailer";
import { db } from "@/db/db";
import { adminBlockUser, AdminSuspendedUser, users } from "@/db/schema/auth";
import { userReports } from "@/db/schema/userBlocks";
import { QueryParams } from "@/types";
import bcrypt from "bcryptjs";
import { desc, asc, count, ilike, or, sql, eq } from "drizzle-orm";
import { getCountryByCallingCode } from "@/utils/countrydata";
import { getLastLoginDatesForUsers } from "@/utils/userActivity";

import { NextResponse } from "next/server";

const generateRandomPassword = (length = 10) => {
  const chars = "ABCDEFGHz0123456789@#$!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const params: QueryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "14",
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
    };
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

    let whereCondition;
    if (search) {
      whereCondition = or(
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.role, `%${search}%`)
      );
    }

    const totalCountResult = await db
      .select({ count: count().as("count") })
      .from(users)
      .where(whereCondition ?? undefined);

    const totalItems = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);
    const sortColumn =
      sortBy === "createdAt"
        ? users.createdAt
        : sortBy === "updatedAt"
        ? users.updatedAt
        : users.username;
    const usersDataRaw = await db
      .select({
        id: users.id,
        profileImage: users.profileImage,
        email: users.email,
        countryCode: users.countryCode,
        createdAt: users.createdAt,
        // lastLoginAt: users.lastLoginAt,

        role: users.role,
        username: users.username,
        firstName: users.firstName,
        isVerified: users.isVerified,
        isBlocked: sql<boolean>`
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM ${adminBlockUser}
          WHERE ${adminBlockUser.userId} = "users"."id"
            AND ${adminBlockUser.blockTime} > NOW()
        ) THEN true
        ELSE false
      END
    `.as("isBlocked"),
        isSuspended: sql<boolean>`
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM ${AdminSuspendedUser}
          WHERE ${AdminSuspendedUser.userId} = "users"."id"
            AND ${AdminSuspendedUser.suspendTime} > NOW()
        ) THEN true
        ELSE false
      END
    `.as("isSuspended"),
        reportsCount: sql<number>`
      COALESCE((
        SELECT COUNT(*)
        FROM ${userReports}
        WHERE ${userReports.reportedUserId} = "users"."id"
      ), 0)
    `.as("reportsCount"),
        flagged: users.flagged,
      })
      .from(users)
      .where(whereCondition ?? undefined)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Get last login dates for all users
    const userIds = usersDataRaw.map(u => u.id);
    const lastLoginDates = await getLastLoginDatesForUsers(userIds);

    const usersData = usersDataRaw.map((u) => ({
      ...u,
      country: getCountryByCallingCode(u.countryCode ?? undefined),
      lastLoginAt: lastLoginDates[u.id],
    }));

    const response = {
      usersData,
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
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { username, email, phoneNumber } = body;

    if (!username || !email || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(ilike(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await db.insert(users).values({
      username,
      email,
      role: "superAdmin",
      phoneNumber,
      password: hashedPassword,
      createdAt: new Date(),
    });
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Your Account Password</h2>
        <div style="background-color: #54DC00; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 24px; letter-spacing: 1px; margin: 0;">${plainPassword}</h1>
        </div>
        <p style="color: #666; text-align: center;">
          Use this password to log in to your account. You can change it after logging in.
        </p>
      </div>
    `;
    await sendEmail({
      to: email,
      subject: "Your Account Password",
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
