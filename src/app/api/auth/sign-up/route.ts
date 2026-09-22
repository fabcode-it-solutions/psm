import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { findUserByEmail, createUser, updateUser } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { wishlistCategories } from "@/db/schema/wishlist";
import { db } from "@/db/db";
import { checkRateLimit } from "@/actions/rateLimiter";
import { RATE_LIMITS } from "@/config/rate-limit-config";

const RegisterSchema = z.object({
  email: z.email("Invalid email format"),

  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: Request) {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Use application/json" },
        { status: 415 }
      );
    }
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const result = await checkRateLimit(ip, RATE_LIMITS.SIGNUP);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { countryCode, username } = body;
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed ",
          details: z.treeifyError(validation.error),
        },
        { status: 400 }
      );
    }
    const { phoneNumber, email, password } = validation.data;

    const existing = await findUserByEmail({ email });
    if (existing && existing?.loginType == "Email") {
      return NextResponse.json(
        { error: "Account with this email already exists" },
        { status: 409 }
      );
    }
    if (
      (existing && existing?.loginType == "Google") ||
      existing?.loginType == "Facebook"
    ) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await updateUser(
        { id: existing.id },
        {
          password: hashedPassword,
          loginType: "Email",
        }
      );
      return NextResponse.json(
        {
          success: true,
          data: user,
          message: "Your account has been updated",
          status: 200,
        },
        { status: 200 }
      );
    }
    const user = await createUser({
      phoneNumber,
      email,
      password,
      countryCode,
      username,
    });
    if (user && "error" in user) {
      return NextResponse.json({ error: user.error }, { status: 409 });
    }
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    await db.insert(wishlistCategories).values({
      name: "All Saved Items",
      userId: user.id,
      note: "all",
      slug: "all-" + user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
        message:
          "Your account has been created! We've sent a verification email to your inbox",
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
