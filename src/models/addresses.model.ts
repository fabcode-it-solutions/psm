import { db } from "@/db/db";
import { addresses } from "@/db/schema/auth";
import { AddressType } from "@/types/build";

import { revalidateTag } from "next/cache";

export const createAddress = async ({
  userId,
  buildId,
  addressLine1,
  addressLine2,
  state,
  postalCode,
  type,
}: AddressType) => {
  try {
    const result = await db
      .insert(addresses)
      .values({
        userId,
        buildId,
        addressLine1,
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(state !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(type !== undefined && { type }),
      })
      .returning();

    revalidateTag("build");
    return result[0];
  } catch (error) {
    console.error("Error creating build:", error);
    throw new Error("Failed to create build.");
  }
};
