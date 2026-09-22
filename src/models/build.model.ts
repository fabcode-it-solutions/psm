import { db } from "@/db/db";
import { builds } from "@/db/schema/builds";
import { CreateBuild } from "@/types/build";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
 
export const createBuild = async ({
  userId,
  brandId,
  modelId,
  typeId,
  licensePlate,
  vinNumber,
}: CreateBuild) => {
  try {
    const existing = await db
      .select()
      .from(builds)
      .where(
        and(
          eq(builds.brandId, brandId),
          eq(builds.modelId, modelId),
          eq(builds.typeId, typeId),
          eq(builds.userId, userId)       
        )
      );
    if (existing.length > 0) {
      return { error: `Build already exists.` };
    }
    const result = await db
      .insert(builds)
      .values({
        userId,
        brandId,
        modelId,
        typeId,
        ...(licensePlate !== undefined && { licensePlate }),
        ...(vinNumber !== undefined && { vinNumber }),
      })
      .returning();
 
    revalidateTag("build");
    return result[0];
  } catch (error) {
    console.error("Error creating build:", error);
    throw new Error("Failed to create build.");
  }
};
 
 
 