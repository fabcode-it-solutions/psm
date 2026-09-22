import { db } from "@/db/db";
import { metafieldDefinitions, metafields } from "@/db/schema/metafields";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { InsertMetafield } from "../../parts/route";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

const metafieldValueSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: z.number().int().positive(),
  metafieldDefinitionId: z.number().int().positive(),
  value: z.any(),
});


export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: "entityType and entityId are required" },
        { status: 400 }
      );
    }

    const metafieldsData = await db
      .select({
        metafield: metafields,
        definition: metafieldDefinitions,
      })
      .from(metafields)
      .innerJoin(
        metafieldDefinitions,
        eq(metafields.metafieldDefinitionId, metafieldDefinitions.id)
      )
      .where(
        and(
          eq(metafields.entityType, entityType),
          eq(metafields.entityId, parseInt(entityId))
        )
      );

    // Format values based on type
    const formattedMetafields = metafieldsData.map(
      ({ metafield, definition }) => {
        let value;
        switch (definition.type) {
          case "text":
          case "rich_text":
          case "url":
          case "email":
          case "phone":
          case "color":
            value = metafield.valueText;
            break;
          case "number":
          case "decimal":
            value = metafield.valueNumber;
            break;
          case "integer":
            value = metafield.valueInteger;
            break;
          case "boolean":
            value = metafield.valueBoolean;
            break;
          case "date":
          case "datetime":
            value = metafield.valueDate;
            break;      
          case "select":
          case "multiselect":
            value = metafield.selectedOptions;
            break;
        }

        return {
          id: metafield.id,
          definition,
          value,
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: formattedMetafields,
    });
  } catch (error) {
    console.error("Error fetching metafield values:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metafield values" },
      { status: 500 }
    );
  }
}

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const body = await req.json();
    const validated = metafieldValueSchema.parse(body);

    // Get field definition
    const [definition] = await db
      .select()
      .from(metafieldDefinitions)
      .where(eq(metafieldDefinitions.id, validated.metafieldDefinitionId))
      .limit(1);

    if (!definition) {
      return NextResponse.json(
        { success: false, error: "Metafield definition not found" },
        { status: 404 }
      );
    }

    // Check if value already exists
    const [existing] = await db
      .select({ id: metafields.id })
      .from(metafields)
      .where(
        and(
          eq(metafields.entityType, validated.entityType),
          eq(metafields.entityId, validated.entityId),
          eq(metafields.metafieldDefinitionId, validated.metafieldDefinitionId)
        )
      )
      .limit(1);

    const metafieldData: InsertMetafield = {
      entityType: validated.entityType,
      entityId: validated.entityId,
      metafieldDefinitionId: validated.metafieldDefinitionId,
    };

    // Set value based on type - only set the appropriate field
    switch (definition.type) {
      case "text":
      case "rich_text":
      case "url":
      case "email":
      case "phone":
      case "color":
      case "file":
      case "image":
        metafieldData.valueText = String(validated.value);
        break;
      case "number":
      case "decimal":
        metafieldData.valueNumber = validated.value;
        break;
      case "integer":
        metafieldData.valueInteger = parseInt(validated.value);
        break;
      case "boolean":
        metafieldData.valueBoolean = Boolean(validated.value);
        break;
      case "date":
      case "datetime":
        metafieldData.valueDate = new Date(validated.value);
        break;
      case "select":
      case "multiselect":
        metafieldData.selectedOptions = Array.isArray(validated.value)
          ? validated.value
          : [validated.value];
        break;
      default:
        metafieldData.valueText = String(validated.value);
    }

    let result;
    if (existing) {
      // Update existing
      metafieldData.updatedAt = new Date();
      await db
        .update(metafields)
        .set(metafieldData)
        .where(eq(metafields.id, existing.id));
      result = { ...existing, ...metafieldData };
    } else {
      // Create new
      [result] = await db.insert(metafields).values(metafieldData).returning();
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: existing
          ? "Metafield value updated"
          : "Metafield value created",
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    console.error("Error saving metafield value:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save metafield value" },
      { status: 500 }
    );
  }
})
