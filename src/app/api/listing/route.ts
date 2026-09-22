/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/listing/route.ts - FIXED VERSION
import { db } from "@/db/db";
import { listings } from "@/db/schema/listings";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

// Helper function to convert empty strings to null for numeric fields
const parseNumericField = (value: any): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed.toString();
};

// Enhanced validation schema with better handling of optional numeric fields
const createListingSchema = z.object({
  partId: z.number().int().positive().optional().nullable(),
  variantId: z.number().int().positive().optional().nullable(),
  buildId: z.number().int().positive().optional().nullable(),
  userId: z.number().int().positive(),
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  description: z.string().optional().nullable(),
  price: z.string().or(z.number()),
  currency: z.string().default("USD"),
  minimumBid: z.string().or(z.number()).optional().nullable(),
  buyNowPrice: z.string().or(z.number()).optional().nullable(),
  offerNotificationThreshold: z.string().or(z.number()).optional().nullable(),
  quantity: z.number().int().default(1),
  quantityAvailable: z.number().int().default(1),
  sku: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.string().or(z.number()).optional().nullable(),
  longitude: z.string().or(z.number()).optional().nullable(),
  hideExactLocation: z.boolean().default(false),
  shippingAvailable: z.boolean().default(true),
  localPickupAvailable: z.boolean().default(false),
  shippingCost: z.string().or(z.number()).optional().nullable(),
  freeShipping: z.boolean().default(false),
  shippingNotes: z.string().optional().nullable(),
  status: z.enum(["draft", "pending", "active", "sold", "expired", "cancelled"]).default("draft"),
  isAvailableForSale: z.boolean().default(true),
  listingType: z.enum(["fixed_price", "auction", "negotiable"]).default("fixed_price"),
  auctionStartsAt: z.string().datetime().optional().nullable(),
  auctionEndsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  autoRenew: z.boolean().default(false),
  featured: z.boolean().default(false),
  metadata: z.any().optional(),
  photos: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),
  anonymous: z.boolean().default(false),
  selectedSpecs: z.object({
    condition: z.string().optional(),
    pcd: z.string().optional(),
    set: z.string().optional(),
    size: z.string().optional(),
    offset: z.string().optional(),
  }).optional(),
  partTitle: z.string().optional(),
  partSlug: z.string().optional(),
  listingId: z.number().optional(),
});

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      
      // Validate the input
      const validated = createListingSchema.parse(body);

      // Generate unique slug if exists
      const [existingSlug] = await db
        .select({ id: listings.id })
        .from(listings)
        .where(eq(listings.slug, validated.slug))
        .limit(1);

      let finalSlug = validated.slug;
      if (existingSlug) {
        finalSlug = `${validated.slug}-${uuidv4().slice(0, 6)}`;
      }

      // Prepare metadata - merge all custom data
      const metadata = {
        ...(validated.metadata || {}),
        photos: validated.photos || [],
        documents: validated.documents || [],
        anonymous: validated.anonymous || false,
        selectedSpecs: validated.selectedSpecs || {},
        partTitle: validated.partTitle,
        partSlug: validated.partSlug,
      };

      // Prepare dates
      const now = new Date();
      const submittedForReviewAt = validated.status === "pending" ? now : null;

      // Create listing with proper null handling for numeric fields
      const [newListing] = await db
        .insert(listings)
        .values({
          partId: validated.partId || null,
          variantId: validated.variantId || null,
          buildId: validated.buildId || null,
          userId: validated.userId,
          title: validated.title,
          slug: finalSlug,
          description: validated.description || null,
          price: parseNumericField(validated.price) || "0",
          currency: validated.currency,
          minimumBid: parseNumericField(validated.minimumBid),
          buyNowPrice: parseNumericField(validated.buyNowPrice),
          offerNotificationThreshold: parseNumericField(validated.offerNotificationThreshold),
          quantity: validated.quantity,
          quantityAvailable: validated.quantityAvailable,
          sku: validated.sku || null,
          addressLine1: validated.addressLine1 || null,
          addressLine2: validated.addressLine2 || null,
          city: validated.city || null,
          state: validated.state || null,
          postalCode: validated.postalCode || null,
          country: validated.country || null,
          latitude: parseNumericField(validated.latitude),
          longitude: parseNumericField(validated.longitude),
          hideExactLocation: validated.hideExactLocation,
          shippingAvailable: validated.shippingAvailable,
          localPickupAvailable: validated.localPickupAvailable,
          shippingCost: parseNumericField(validated.shippingCost),
          freeShipping: validated.freeShipping,
          shippingNotes: validated.shippingNotes || null,
          status: validated.status,
          isAvailableForSale: validated.isAvailableForSale,
          listingType: validated.listingType,
          auctionStartsAt: validated.auctionStartsAt ? new Date(validated.auctionStartsAt) : null,
          auctionEndsAt: validated.auctionEndsAt ? new Date(validated.auctionEndsAt) : null,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          autoRenew: validated.autoRenew,
          featured: validated.featured,
          metadata,
          createdAt: now,
          updatedAt: now,
          submittedForReviewAt,
          reviewStatus: validated.status === "pending" ? "pending" : null,
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: newListing,
          message: "Listing created successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Validation failed", 
            details: error.issues 
          },
          { status: 400 }
        );
      }

      console.error("Error creating listing:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create listing" },
        { status: 500 }
      );
    }
  }
);

// GET endpoint
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;
    const whereConditions = [];

    if (userId) whereConditions.push(eq(listings.userId, parseInt(userId)));
    if (status) whereConditions.push(eq(listings.status, status));
    if (search) {
      whereConditions.push(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.description, `%${search}%`)
        )
      );
    }

    const results = await db
      .select()
      .from(listings)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(listings)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: parseInt(count as string),
        totalPages: Math.ceil(parseInt(count as string) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}