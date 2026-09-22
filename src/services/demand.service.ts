// services/demand.service.ts

interface TrackInteractionParams {
  partSlug: string;
  interactionType: "view" | "wishlist" | "inquiry" | "restock_request";
  userId?: number;
  sessionId?: string;
  email?: string;
}

interface DemandStatsResponse {
  demandScore: number;
  wishlistCount: number;
  inquiryCount: number;
  viewCount: number;
  restockRequestCount: number;
  subscriberCount: number;
  inventory: number;
}

class DemandService {
  /**
   * Track a user interaction with a part
   */
  async trackInteraction({
    partSlug,
    interactionType,
    userId,
    sessionId,
    email,
  }: TrackInteractionParams): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/parts/${partSlug}/demand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interactionType,
          userId,
          sessionId,
          email,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error tracking interaction:", error);
      return {
        success: false,
        error: "Failed to track interaction",
      };
    }
  }

  /**
   * Get demand statistics for a part
   */
  async getDemandStats(
    partSlug: string
  ): Promise<{ success: boolean; data?: DemandStatsResponse; error?: string }> {
    try {
      const response = await fetch(`/api/parts/${partSlug}/demand`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching demand stats:", error);
      return {
        success: false,
        error: "Failed to fetch demand statistics",
      };
    }
  }

  /**
   * Track page view (convenience method)
   */
  async trackView(partSlug: string, userId?: number, sessionId?: string) {
    return this.trackInteraction({
      partSlug,
      interactionType: "view",
      userId,
      sessionId,
    });
  }

  /**
   * Track wishlist add (convenience method)
   */
  async trackWishlist(partSlug: string, userId?: number, sessionId?: string) {
    return this.trackInteraction({
      partSlug,
      interactionType: "wishlist",
      userId,
      sessionId,
    });
  }

  /**
   * Track inquiry (convenience method)
   */
  async trackInquiry(partSlug: string, userId?: number, sessionId?: string) {
    return this.trackInteraction({
      partSlug,
      interactionType: "inquiry",
      userId,
      sessionId,
    });
  }

  /**
   * Subscribe to restock notifications (convenience method)
   */
  async subscribeRestock(
    partSlug: string,
    email: string,
    userId?: number,
    sessionId?: string
  ) {
    return this.trackInteraction({
      partSlug,
      interactionType: "restock_request",
      userId,
      sessionId,
      email,
    });
  }

  /**
   * Generate a session ID for anonymous users
   */
  getSessionId(): string {
    // Check if session ID exists in localStorage
    let sessionId = localStorage.getItem("demand_session_id");

    if (!sessionId) {
      // Generate new session ID
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("demand_session_id", sessionId);
    }

    return sessionId;
  }
}

export const demandService = new DemandService();