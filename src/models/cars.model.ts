import { db } from "@/db/db";
import { carBrands, carModels, carModelTypes } from "@/db/schema/default";
import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
type NewCarBrandInput = {
  name: string;
  id?: number;
  logo?: string;
  image?: string;
};

export async function addCarBrand({ name, logo, image }: NewCarBrandInput) {
  try {
    const existing = await db
      .select()
      .from(carBrands)
      .where(eq(carBrands.name, name));

    if (existing.length > 0) {
      return { error: `Brand with this name already exists.` };
    }

    const insertData: typeof carBrands.$inferInsert = {
      name,
      logoMediaId: Number(logo),
    };

    if (image) {
      insertData.imageMediaId = Number(image);
    }

    const result = await db.insert(carBrands).values(insertData).returning();

    revalidateTag("brands");
    if (result && typeof result === "object" && "error" in result) {
      return (result as { error: string }).error;
    }
    return result[0];
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}

export async function getCarBrandByName({ name, id }: NewCarBrandInput) {
  try {
    if (id) {
      const existing = await db
        .select()
        .from(carBrands)
        .where(eq(carBrands.id, id))
        .limit(1);

      if (!existing) {
        return { error: `Brand with this id already exists.` };
      }

      return existing;
    }
    if (name) {
      const existing = await db
        .select()
        .from(carBrands)
        .where(eq(carBrands.name, name))
        .limit(1);

      if (!existing) {
        return { error: `Brand with this name already exists.` };
      }

      return existing;
    }
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}

export async function getAllCarBrand() {
  try {
    const allBrands = await db.select().from(carBrands).orderBy(carBrands.name);

    if (!allBrands.length) {
      return { error: `The requested brand does not exist.` };
    }

    return allBrands;
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}

type NewCarModelInput = {
  brandId: number;
  name: string;
};

export async function addCarModel({ brandId, name }: NewCarModelInput) {
  try {
    const existing = await db
      .select()
      .from(carModels)
      .where(and(eq(carModels.brandId, brandId), eq(carModels.name, name)));

    if (existing.length > 0) {
      return { error: `Model "${name}" already exists for this brand.` };
    }

    const result = await db
      .insert(carModels)
      .values({
        brandId,
        name,
      })
      .returning();

    revalidateTag("car-models");

    return result[0];
  } catch (error) {
    console.error("Error adding model:", error);
    return error;
  }
}

export async function getCarBrandById(id: number) {
  try {
    const allBrands = await db
      .select()
      .from(carBrands)
      .where(eq(carBrands.id, id))
      .limit(1);

    if (!allBrands.length) {
      return { error: `The requested brand does not exist.` };
    }

    return allBrands;
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}
export async function getCarModelById(id: number) {
  try {
    const allBrands = await db
      .select()
      .from(carModels)
      .where(eq(carModels.id, id))
      .limit(1);

    if (!allBrands.length) {
      return { error: `The requested Model does not exist.` };
    }

    return allBrands;
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}
export async function getCarModelsByBrand(id: number) {
  try {
    const allBrands = await db
      .select()
      .from(carModels)
      .where(eq(carModels.brandId, id));

    if (!allBrands.length) {
      return { error: `The requested model does not exist.` };
    }

    return allBrands;
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}

export async function addCarModelType({
  name,
  modelId,
}: {
  modelId: number;
  name: string;
  description?: string;
  status?: "active" | "inactive";
  image?: string;
}) {
  try {
    const existing = await db
      .select()
      .from(carModelTypes)
      .where(
        and(eq(carModelTypes.modelId, modelId), eq(carModelTypes.name, name))
      );

    if (existing.length > 0) {
      return { error: `Model Type "${name}" already exists for this brand.` };
    }

    const result = await db
      .insert(carModelTypes)
      .values({
        modelId,
        name,
      })
      .returning();

    revalidateTag("car-models-type");

    return result[0];
  } catch (error) {
    console.error("Error adding model:", error);
    return error;
  }
}

export async function getCarTypeByModel(id: number) {
  try {
    const allBrands = await db
      .select()
      .from(carModelTypes)
      .where(eq(carModelTypes.modelId, id));

    if (!allBrands.length) {
      return { error: `The requested type does not exist.` };
    }

    return allBrands;
  } catch (error) {
    console.error("Error getting adding brand:", error);
    return error;
  }
}
