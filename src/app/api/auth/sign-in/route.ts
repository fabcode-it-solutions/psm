/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { findUserByEmail } from "@/models/user.model";
import { db } from "@/db/db";
import { and, eq, gt } from "drizzle-orm";
// import { checkRateLimit } from "@/actions/rateLimiter";
import { adminBlockUser, users } from "@/db/schema/auth";
import { getTimeLeft } from "@/utils/dateUtils";
import { recordUserActivity } from "@/utils/userActivity";
// import { RATE_LIMITS } from "@/config/rate-limit-config";

const NODE_ENV = process.env.NODE_ENV;
export const POST = async (request: Request) => {
  try {
    // const ip = request.headers.get("x-forwarded-for") || "unknown";
    // const result = await checkRateLimit(ip, RATE_LIMITS.SIGNIN);
    // if (!result.success) {
    //   return NextResponse.json({ error: result.message }, { status: 429 });
    // }
    const payload = await request.json();
    const { email, password } = payload;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    // const userExist = await findUserByEmail({ email });
 const [userExist] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    if (!userExist) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please proceed to create a new account to continue.",
        },
        { status: 409 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password does not match" },
        { status: 401 }
      );
    }
    userExist.password = "";
    if (userExist.id) {
      const [isBlocked] = await db
        .select()
        .from(adminBlockUser)
        .where(
          and(
            eq(adminBlockUser.userId, userExist.id),
            gt(adminBlockUser.blockTime, new Date())
          )
        )
        .limit(1);
      if (isBlocked) {
        if (isBlocked.blockTime) {
          const message = getTimeLeft(isBlocked.blockTime);
          return NextResponse.json(
            {
              error: message,
              status: 403,
            },
            { status: 403 }
          );
        }
      }
    }

    // Record login activity
    await recordUserActivity(userExist.id, "login",);

    return NextResponse.json(
      { message: "Login successful. Welcome back!", userExist },
      { status: 200 }
    );
  } catch (error: any) {
    if (NODE_ENV == "development") {
      console.log(error);
    }
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
