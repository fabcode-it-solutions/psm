import { db } from "@/db/db";
import { users } from "@/db/schema/auth";
import { userSocialMedia } from "@/db/schema/socialMedia";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { createAddress } from "@/models/addresses.model";
import { createBuild } from "@/models/build.model";
import { updateUser } from "@/models/user.model";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

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

  const {
    brandId,
    modelId,
    typeId,
    userId,
    licensePlate,
    vinNumber,
    addressLine1,
    firstName,
    lastName,
    username,
    bio,
    anonymous,
    anonymousName,
    profileImage,
    socialMedia,
  } = body;

  const missingFields = [];
  if (!brandId) missingFields.push("brandId");
  if (!modelId) missingFields.push("modelId");
  if (!typeId) missingFields.push("typeId");
 

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required field: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const buildResult = await createBuild({
      brandId,
      modelId,
      typeId,
      userId,
      licensePlate,
      vinNumber,
    });

    if (
      !buildResult ||
      typeof buildResult !== "object" ||
      !("id" in buildResult)
    ) {
      return NextResponse.json(
        { error: "Failed to create build." },
        { status: 422 }
      );
    }

    const buildId = buildResult.id;

    const userUpdateResult = await updateUser(
      { id: userId },
      {
        firstName,
        lastName,
        username,
        bio,
        anonymous,
        anonymousName,
        profileImage,
      }
    );

    if (
      userUpdateResult &&
      typeof userUpdateResult === "object" &&
      "error" in userUpdateResult
    ) {
      return NextResponse.json(
        { error: userUpdateResult.error },
        { status: 422 }
      );
    }

    if (addressLine1) {
    const address =  await createAddress({
        userId,
        buildId,
        addressLine1,
      });
    }
    if (socialMedia) {
      const facebook = socialMedia.find(
        (item: { name: string }) => item.name == "Facebook"
      )?.link;
      const instagram = socialMedia.find(
        (item: { name: string }) => item.name == "Instagram"
      )?.link;
      const youtube = socialMedia.find(
        (item: { name: string }) => item.name == "Youtube"
      )?.link;
      const twitter = socialMedia.find(
        (item: { name: string }) => item.name == "Twitter"
      )?.link;
      const linkedIn = socialMedia.find(
        (item: { name: string }) => item.name == "LinkedIn"
      )?.link;

      await db
        .insert(userSocialMedia)
        .values({
          userId,
          facebook,
          instagram,
          youtube,
          twitter,
          linkedIn,
        })
        .returning();
    }
    return NextResponse.json(
      {
        success: true,
        message: "Build has been added successfully.",
        buildId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /build error:", error);
    return NextResponse.json(
      { error: "Unexpected error: Please try again later" },
      { status: 500 }
    );
  }
}
)