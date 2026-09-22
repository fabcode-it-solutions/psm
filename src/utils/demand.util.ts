// utils/demand.utils.ts

export interface DemandMetrics {
  score: number;
  level: "low" | "medium" | "high" | "very-high";
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

/**
 * Calculate demand score based on multiple factors
 * Score range: 0-100
 */
export function calculateDemandScore({
  wishlistCount = 0,
  inquiryCount = 0,
  viewCount = 0,
  restockRequestCount = 0,
  daysOutOfStock = 0,
}: {
  wishlistCount?: number;
  inquiryCount?: number;
  viewCount?: number;
  restockRequestCount?: number;
  daysOutOfStock?: number;
}): number {
  // Weight factors (adjust these based on your business needs)
  const WEIGHTS = {
    wishlist: 15, // Each wishlist adds 15 points
    inquiry: 25, // Each inquiry adds 25 points
    view: 1, // Each view adds 1 point
    restockRequest: 30, // Each restock request adds 30 points
    recency: 10, // Bonus for recent activity
  };

  let score = 0;

  // Calculate base score from interactions
  score += wishlistCount * WEIGHTS.wishlist;
  score += inquiryCount * WEIGHTS.inquiry;
  score += viewCount * WEIGHTS.view;
  score += restockRequestCount * WEIGHTS.restockRequest;

  // Recency bonus (higher score if recently went out of stock)
  if (daysOutOfStock < 7) {
    score += WEIGHTS.recency * 5; // Very recent
  } else if (daysOutOfStock < 30) {
    score += WEIGHTS.recency * 3; // Recent
  } else if (daysOutOfStock < 90) {
    score += WEIGHTS.recency * 1; // Somewhat recent
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Get demand metrics and styling based on score
 * Returns null if item is in stock
 */
export function getDemandMetrics(
  demandScore: number,
  inventory: number
): DemandMetrics | null {
  // Only show demand indicator if out of stock
  if (inventory > 0) return null;

  // Very High Demand (75-100)
  if (demandScore >= 75) {
    return {
      score: demandScore,
      level: "very-high",
      label: "🔥 Very High Demand",
      color: "text-red-500",
      bgColor: "bg-red-500/10 border-red-500/30",
      textColor: "#EF4444",
    };
  }

  // High Demand (50-74)
  if (demandScore >= 50) {
    return {
      score: demandScore,
      level: "high",
      label: "⚡ High Demand",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10 border-orange-500/30",
      textColor: "#F97316",
    };
  }

  // Medium Demand (25-49)
  if (demandScore >= 25) {
    return {
      score: demandScore,
      level: "medium",
      label: "📈 In Demand",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      textColor: "#EAB308",
    };
  }

  // Low Demand (1-24)
  if (demandScore > 0) {
    return {
      score: demandScore,
      level: "low",
      label: "👀 Some Interest",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      textColor: "#3B82F6",
    };
  }

  return null;
}

/**
 * Format demand statistics for display
 */
export function formatDemandStats({
  wishlistCount = 0,
  inquiryCount = 0,
  restockRequestCount = 0,
}: {
  wishlistCount?: number;
  inquiryCount?: number;
  restockRequestCount?: number;
}): string[] {
  const stats: string[] = [];

  if (restockRequestCount > 0) {
    stats.push(
      `${restockRequestCount} restock ${
        restockRequestCount === 1 ? "request" : "requests"
      }`
    );
  }

  if (wishlistCount > 0) {
    stats.push(
      `${wishlistCount} ${wishlistCount === 1 ? "person" : "people"} watching`
    );
  }

  if (inquiryCount > 0) {
    stats.push(
      `${inquiryCount} recent ${inquiryCount === 1 ? "inquiry" : "inquiries"}`
    );
  }

  return stats;
}

/**
 * Get inventory status with demand context
 */
export function getInventoryStatusWithDemand(
  inventory: number,
  demandScore: number = 0
): {
  label: string;
  color: string;
  showDemand: boolean;
} {
  if (inventory > 10) {
    return {
      label: "In Stock",
      color: "text-green-400",
      showDemand: false,
    };
  }

  if (inventory > 0) {
    return {
      label: "Low Stock",
      color: "text-yellow-400",
      showDemand: false,
    };
  }

  // Out of stock
  if (demandScore >= 50) {
    return {
      label: "Out of Stock - High Demand",
      color: "text-red-500",
      showDemand: true,
    };
  }

  return {
    label: "Out of Stock",
    color: "text-red-400",
    showDemand: demandScore > 0,
  };
}

/**
 * Calculate days since item went out of stock
 */
export function calculateDaysOutOfStock(lastRestockDate?: Date | string): number {
  if (!lastRestockDate) return 0;

  const lastRestock = new Date(lastRestockDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastRestock.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}