/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useListingFlow.ts - FIXED & OPTIMIZED VERSION
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface ListingFlowData {
  partId?: number;
  variantId?: number;
  partTitle?: string;
  partSlug?: string;

  selectedSpecs?: {
    condition?: string;
    pcd?: string;
    set?: string;
    size?: string;
    offset?: string;
  };

  title?: string;
  description?: string;
  price?: string;
  minimumBid?: string;
  offerNotificationThreshold?: string;
  photos?: Array<{ url: string; alt?: string }>;
  documents?: Array<{ name: string; url: string }>;
  anonymous?: boolean;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  userId: number;
  status: "draft" | "pending" | "active";
  slug?: string;
  listingId?: number;
}

const STORAGE_KEY = "listing_draft_data";

export function useListingFlow(userId: number) {
  const router = useRouter();
  const [listingData, setListingData] = useState<ListingFlowData>({
    userId,
    status: "draft",
    anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentListingId, setCurrentListingId] = useState<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setListingData(parsed);
        if (parsed.listingId) setCurrentListingId(parsed.listingId);
      } catch (err) {
        console.error("Failed to parse draft:", err);
      }
    }
  }, []);

  // ---------------------------------------------------------------
  // ✅ FIXED — Deep Merge saveDraft (prevents clearing selectedSpecs)
  // ---------------------------------------------------------------
  const saveDraft = useCallback((data: Partial<ListingFlowData>) => {
    setListingData((prev) => {
      const updatedData = {
        ...prev,
        ...data,

        // Deep merge selectedSpecs safely
        selectedSpecs: {
          ...(prev.selectedSpecs || {}),
          ...(data.selectedSpecs || {}),
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return updatedData;
    });
  }, []);

  // Update single field
  const updateField = useCallback(
    (field: keyof ListingFlowData, value: any) => {
      saveDraft({ [field]: value });
    },
    [saveDraft]
  );

  // Update many fields
  const updateFields = useCallback(
    (updates: Partial<ListingFlowData>) => {
      saveDraft(updates);
    },
    [saveDraft]
  );

  const generateSlug = (title: string): string =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Save to database
  const saveToDatabase = async (status: "draft" | "pending" = "draft") => {
    try {
      setLoading(true);

      if (status === "pending") {
        if (!listingData.title || !listingData.price) {
          toast.error("Title and price are required");
          return { success: false, error: "Missing required fields" };
        }
      }

      const apiData = {
        userId: listingData.userId,
        partId: listingData.partId,
        variantId: listingData.variantId,
        title: listingData.title || "Untitled Listing",
        slug: listingData.slug || generateSlug(listingData.title || "untitled"),
        description: listingData.description,
        price: listingData.price || "0",
        minimumBid: listingData.minimumBid,
        offerNotificationThreshold: listingData.offerNotificationThreshold,
        addressLine1: listingData.addressLine1,
        addressLine2: listingData.addressLine2,
        city: listingData.city,
        state: listingData.state,
        postalCode: listingData.postalCode,
        country: listingData.country,
        status,
        metadata: {
          photos: listingData.photos || [],
          documents: listingData.documents || [],
          anonymous: listingData.anonymous || false,
          selectedSpecs: listingData.selectedSpecs || {},
          partTitle: listingData.partTitle,
          partSlug: listingData.partSlug,
        },
      };

      const url = currentListingId
        ? `/api/listing/${currentListingId}`
        : "/api/listing";
      const method = currentListingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentListingId(result.data.id);
        saveDraft({ ...listingData, listingId: result.data.id });

        toast.success(
          status === "draft"
            ? "Draft saved successfully"
            : "Listing submitted for review"
        );

        return { success: true, data: result.data };
      } else {
        toast.error(result.error || "Failed to save");
        return { success: false };
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Clear local draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setListingData({
      userId,
      status: "draft",
      anonymous: false,
    });
    setCurrentListingId(null);
  }, [userId]);

  // Load listing (edit mode)
  const loadListing = async (listingId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/listing/${listingId}`);
      const result = await res.json();

      if (result.success) {
        const listing = result.data;
        const loaded: ListingFlowData = {
          userId,
          partId: listing.partId,
          variantId: listing.variantId,
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          price: listing.price,
          minimumBid: listing.minimumBid,
          offerNotificationThreshold: listing.offerNotificationThreshold,
          addressLine1: listing.addressLine1,
          addressLine2: listing.addressLine2,
          city: listing.city,
          state: listing.state,
          postalCode: listing.postalCode,
          country: listing.country,
          status: listing.status,
          photos: listing.metadata?.photos || [],
          documents: listing.metadata?.documents || [],
          anonymous: listing.metadata?.anonymous || false,
          selectedSpecs: listing.metadata?.selectedSpecs || {},
          partTitle: listing.metadata?.partTitle,
          partSlug: listing.metadata?.partSlug,
          listingId: listing.id,
        };

        setListingData(loaded);
        setCurrentListingId(listingId);
        return { success: true };
      }

      toast.error("Failed to load listing");
      return { success: false };
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Error loading listing");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const goToNextStep = (step: string) => {
    switch (step) {
      case "specifications":
        router.push(`/listings/create/${listingData.partSlug}/address`);
        break;
      case "address":
        router.push(`/listings/create/${listingData.partSlug}/product-detail`);
        break;
      case "product-detail":
        router.push(`/listings/create/${listingData.partSlug}/review`);
        break;
      default:
        break;
    }
  };

  return {
    listingData,
    loading,
    currentListingId,
    updateField,
    updateFields,
    saveDraft,
    saveToDatabase,
    clearDraft,
    loadListing,
    goToNextStep,
  };
}
