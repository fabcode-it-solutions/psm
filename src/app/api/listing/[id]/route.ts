/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/listing/[id]/route.ts - FIXED VERSION
import { db } from "@/db/db";
import { listings } from "@/db/schema/listings";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Helper function to convert empty strings to null for numeric fields
const parseNumericField = (value: any): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed.toString();
};

// GET single listing
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];
    const listingId = parseInt(id);

    if (isNaN(listingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// UPDATE listing
export const PUT = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const id = pathSegments[pathSegments.length - 1];
      const listingId = parseInt(id);

      if (isNaN(listingId)) {
        return NextResponse.json(
          { success: false, error: "Invalid listing ID" },
          { status: 400 }
        );
      }

      const body = await req.json();

      // Check if listing exists
      const [existing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Listing not found" },
          { status: 404 }
        );
      }

      // Build update object with proper null handling
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Only update fields that are provided
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined)
        updateData.description = body.description || null;

      // Handle numeric fields properly - convert empty strings to null
      if (body.price !== undefined) {
        updateData.price = parseNumericField(body.price);
      }
      if (body.minimumBid !== undefined) {
        updateData.minimumBid = parseNumericField(body.minimumBid);
      }
      if (body.offerNotificationThreshold !== undefined) {
        updateData.offerNotificationThreshold = parseNumericField(
          body.offerNotificationThreshold
        );
      }
      if (body.shippingCost !== undefined) {
        updateData.shippingCost = parseNumericField(body.shippingCost);
      }
      if (body.buyNowPrice !== undefined) {
        updateData.buyNowPrice = parseNumericField(body.buyNowPrice);
      }

      // Integer fields
      if (body.quantity !== undefined) updateData.quantity = body.quantity;
      if (body.quantityAvailable !== undefined)
        updateData.quantityAvailable = body.quantityAvailable;

      // String fields
      if (body.status !== undefined) updateData.status = body.status;
      if (body.addressLine1 !== undefined)
        updateData.addressLine1 = body.addressLine1 || null;
      if (body.addressLine2 !== undefined)
        updateData.addressLine2 = body.addressLine2 || null;
      if (body.city !== undefined) updateData.city = body.city || null;
      if (body.state !== undefined) updateData.state = body.state || null;
      if (body.postalCode !== undefined)
        updateData.postalCode = body.postalCode || null;
      if (body.country !== undefined) updateData.country = body.country || null;
      if (body.shippingNotes !== undefined)
        updateData.shippingNotes = body.shippingNotes || null;

      // Boolean fields
      if (body.shippingAvailable !== undefined)
        updateData.shippingAvailable = body.shippingAvailable;
      if (body.localPickupAvailable !== undefined)
        updateData.localPickupAvailable = body.localPickupAvailable;
      if (body.freeShipping !== undefined)
        updateData.freeShipping = body.freeShipping;

      // Metadata - merge with existing
      if (body.metadata !== undefined) {
        const existingMetadata =
          existing.metadata && typeof existing.metadata === "object"
            ? (existing.metadata as Record<string, any>)
            : {};

        const incomingMetadata =
          body.metadata && typeof body.metadata === "object"
            ? (body.metadata as Record<string, any>)
            : {};

        updateData.metadata = {
          ...existingMetadata,
          ...incomingMetadata,
        };
      }

      // Handle status change timestamps
      if (body.status === "pending" && existing.status !== "pending") {
        updateData.submittedForReviewAt = new Date();
        updateData.reviewStatus = "pending";
      }

      if (body.status === "active" && existing.status !== "active") {
        updateData.publishedAt = new Date();
      }

      // Update listing
      const [updatedListing] = await db
        .update(listings)
        .set(updateData)
        .where(eq(listings.id, listingId))
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: updatedListing,
          message: "Listing updated successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating listing:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update listing" },
        { status: 500 }
      );
    }
  }
);

// DELETE listing
export const DELETE = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const id = pathSegments[pathSegments.length - 1];
      const listingId = parseInt(id);

      if (isNaN(listingId)) {
        return NextResponse.json(
          { success: false, error: "Invalid listing ID" },
          { status: 400 }
        );
      }

      // Check if listing exists
      const [existing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Listing not found" },
          { status: 404 }
        );
      }

      // Delete listing
      await db.delete(listings).where(eq(listings.id, listingId));

      return NextResponse.json(
        {
          success: true,
          message: "Listing deleted successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting listing:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete listing" },
        { status: 500 }
      );
    }
  }
);
