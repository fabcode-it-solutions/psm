// types/demand.types.ts

export type InteractionType = "view" | "wishlist" | "inquiry" | "restock_request";

export type DemandLevel = "low" | "medium" | "high" | "very-high";

export interface DemandMetrics {
  score: number;
  level: DemandLevel;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface DemandData {
  demandScore: number;
  wishlistCount: number;
  inquiryCount: number;
  viewCount: number;
  restockRequestCount: number;
  subscriberCount: number;
  inventory: number;
}

export interface PartWithDemand {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: "draft" | "active" | "archived";
  price: number;
  compareAtPrice?: number;
  inventory: number;
  sku?: string;
  category?: string;
  featuredImage: string;
  featuredImageAlt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  // Demand fields
  demandScore?: number;
  wishlistCount?: number;
  inquiryCount?: number;
  viewCount?: number;
  restockRequestCount?: number;
  lastRestockRequest?: Date | string;
}

export interface DemandNotification {
  id: number;
  partId: number;
  userId: number;
  email: string;
  notified: boolean;
  createdAt: Date;
  notifiedAt?: Date;
}

export interface PartInteraction {
  id: number;
  partId: number;
  userId?: number;
  sessionId?: string;
  interactionType: InteractionType;
  createdAt: Date;
}

export interface TrackInteractionParams {
  partSlug: string;
  interactionType: InteractionType;
  userId?: number;
  sessionId?: string;
  email?: string;
}

export interface DemandStatsResponse {
  success: boolean;
  data?: DemandData;
  error?: string;
}

export interface TrackInteractionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface HighDemandPart {
  id: number;
  title: string;
  slug: string;
  demandScore: number;
  restockRequestCount: number;
  subscriberCount: number;
  lastRestockRequest?: Date;
}