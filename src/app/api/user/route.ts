import { addMonths } from "date-fns";
import { db } from "@/db/db";
import { addresses, follows, usernameHistory, users } from "@/db/schema/auth";
import { builds } from "@/db/schema/builds";
import { carBrands, carModels, carModelTypes } from "@/db/schema/default";
import { media } from "@/db/schema/media";
import { userSocialMedia } from "@/db/schema/socialMedia";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/actions/rateLimiter";
import { RATE_LIMITS } from "@/config/rate-limit-config";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
export type ErrorWithResponse = {
  errorResponse: {
    errmsg?: string;
  };
};
export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const id = url.searchParams.get("id");
    const logoMedia = alias(media, "logoMedia");
    if (!email && !id) {
      return NextResponse.json(
        { error: "Email or id is required." },
        { status: 400 }
      );
    }
    if (id == "undefined") {
      return NextResponse.json(
        { error: "Email or id is required." },
        { status: 400 }
      );
    }
    const condition = email ? eq(users.email, email) : eq(users.id, Number(id));
    // 1. Get the user
    const userResult = await db.select().from(users).where(condition).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const [lastUsernameChanged] = await db
      .select()
      .from(usernameHistory)
      .where(eq(usernameHistory.userId, user.id))
      .orderBy(desc(usernameHistory.changedAt))
      .limit(1);

    const lastDetails: {
      allowed: boolean;
      pending: null | Date;
    } = {
      allowed: true,
      pending: null,
    };

    if (lastUsernameChanged) {
      const now = new Date();
      const lastChanged = new Date(lastUsernameChanged.changedAt);
      const nextAllowed = addMonths(lastChanged, 3);

      if (now < nextAllowed) {
        lastDetails.allowed = false;
        lastDetails.pending = lastChanged;
      }
    }

    // 2. Get builds with brand, model, type info
    const buildsWithInfo = await db
      .select({
        buildId: builds.id,
        licensePlate: builds.licensePlate,
        vinNumber: builds.vinNumber,
        createdAt: builds.createdAt,
        brand: {
          id: carBrands.id,
          name: carBrands.name,
          logo: logoMedia.url,
        },
        model: {
          id: carModels.id,
          name: carModels.name,
        },
        type: {
          id: carModelTypes.id,
          name: carModelTypes.name,
        },
      })
      .from(builds)
      .innerJoin(carBrands, eq(builds.brandId, carBrands.id))
      .innerJoin(carModels, eq(builds.modelId, carModels.id))
      .innerJoin(carModelTypes, eq(builds.typeId, carModelTypes.id))
      .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
      .where(eq(builds.userId, user.id));

    // 3. Get address (optional - if exists)
    const addressResult = await db
      .select({
        addressLine1: addresses.addressLine1,
        addressLine2: addresses.addressLine2,
        state: addresses.state,
        postalCode: addresses.postalCode,
        type: addresses.type,
      })
      .from(addresses)
      .where(and(eq(addresses.userId, user.id), eq(addresses.isDefault, true)))
      .limit(1);
    const address = addressResult[0] || null;

    // 4. Count followers
    const followers = await db
      .select()
      .from(follows)
      .where(eq(follows.followingId, user.id));

    // 5. Count following
    const following = await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, user.id));
    const socialMedia = await db
      .select()
      .from(userSocialMedia)
      .where(eq(userSocialMedia.userId, user.id))
      .limit(1);
    user.password = "";
    return NextResponse.json(
      {
        success: true,
        message: "User data fetched successfully.",
        user: { ...user, lastUsernameChanged: lastDetails },
        address,
        builds: buildsWithInfo,
        buildsCount: buildsWithInfo.length,
        followers: followers.length,
        following: following.length,
        socialMedia: socialMedia[0],

        partsListed: 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("<---------- Get User Route Error ---------->");

    console.error(error);
    console.error("<---------- End Error ---------->");

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};

export const PATCH = withFullCsrfProtection(
  async (request: NextRequest): Promise<NextResponse> => {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const resultIp = await checkRateLimit(ip, RATE_LIMITS.USER_UPDATE);

    if (!resultIp.success) {
      return NextResponse.json({ error: resultIp.message }, { status: 429 });
    }
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User id is required." },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object is required." },
        { status: 400 }
      );
    }
    const [exist] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!exist) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const restrictedFields = ["id", "createdAt", "password", "email"];
    for (const key of Object.keys(updates)) {
      if (restrictedFields.includes(key)) {
        delete updates[key];
      }
    }

    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (updates.address) {
      await db
        .update(addresses)
        .set({
          addressLine1: updates.address?.addressLine1,
          addressLine2: updates.address?.addressLine2,
          state: updates.address?.state,
          postalCode: updates.address?.postalCode,
        })
        .where(and(eq(addresses.userId, id), eq(addresses.isDefault, true)))
        .returning();
    }
    if (updates.username) {
      await db.insert(usernameHistory).values({
        userId: exist.id,
        oldUsername: exist.username,
        newUsername: updates.username,
      });
    }
    if (!result.length) {
      return NextResponse.json(
        { error: "User not found or no changes made." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully.",
        user: result[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("<---------- Update User Route Error ---------->");
    console.error(error);
    console.error("<---------- End Error ---------->");

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
})