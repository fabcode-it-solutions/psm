import { db } from "@/db/db";
import { carBrands, carModels } from "@/db/schema/default";
import { parts } from "@/db/schema/parts";
import { categories } from "@/db/schema/categories";
import { media } from "@/db/schema/media";
import { alias } from "drizzle-orm/pg-core";
import { ilike, eq, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema/auth";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    if (!search) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const logoMedia = alias(media, "logoMedia");
    const imageMedia = alias(media, "imageMedia");

    // === 1️⃣ Search Brands ===
    const brands = await db
      .select({
        id: carBrands.id,        
        name: carBrands.name,
        description: carBrands.description,
        updatedAt: carBrands.updatedAt,
        logo: {
          id: logoMedia.id,
          url: logoMedia.url,
          type: logoMedia.type,
          alt: logoMedia.altText,
        },
      })
      .from(carBrands)
      .leftJoin(logoMedia, eq(carBrands.logoMediaId, logoMedia.id))
      .where(ilike(carBrands.name, `%${search}%`))
      .orderBy(desc(carBrands.updatedAt))
      .limit(5);

    // === 2️⃣ Search Models ===
    const models = await db
      .select({
        id: carModels.id,        
        name: carModels.name,
        description: carModels.description,
        updatedAt: carModels.updatedAt,
        image: {
          id: imageMedia.id,
          url: imageMedia.url,
          type: imageMedia.type,
          alt: imageMedia.altText,
        },
      })
      .from(carModels)
      .leftJoin(imageMedia, eq(carModels.imageMediaId, imageMedia.id))
      .where(ilike(carModels.name, `%${search}%`))
      .orderBy(desc(carModels.updatedAt))
      .limit(5);

    // === 3️⃣ Search Parts ===
    const partsResult = await db
      .select({
        id: parts.id,        
        name: parts.title,
        description: parts.description,
        updatedAt: parts.updatedAt,
      })
      .from(parts)
      .where(ilike(parts.title, `%${search}%`))
      .orderBy(desc(parts.updatedAt))
      .limit(5);

    // === 4️⃣ Search Categories ===
    const categoriesResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        updatedAt: categories.updatedAt,
      })
      .from(categories)
      .where(ilike(categories.name, `%${search}%`))
      .orderBy(desc(categories.updatedAt))
      .limit(5);

    // === 5️⃣ Search Users ===
    const usersResult = await db
      .select({
        id: users.id,
        name: users.firstName || users.lastName || users.username,
        description: users.email,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(or(ilike(users.firstName, `%${search}%`), ilike(users.username, `%${search}%`), ilike(users.lastName, `%${search}%`), ilike(users.anonymousName, `%${search}%`), ilike(users.id, `%${search}%`)))
      .orderBy(desc(users.updatedAt))
      .limit(5);

    // === Merge Results ===
    const results = [
      ...brands,
      ...models,
      ...partsResult,
      ...categoriesResult,
      ...usersResult,
    ];

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error("<----------Unified Search Error------------>");
    console.error(error);
    console.error("<----------End Unified Search Error------------>");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};
