import React from "react";
import ListingCard from "@/component/products/ListingCard";
import ListedItems from "@/component/ViewProduct/ListedItems";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { safeHtml } from "@/utils/sanitize";
import { db } from "@/db/db";
import { parts } from "@/db/schema/parts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";


interface ParamSlug {
  slug: string;
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

interface Media {
  url: string;
}

interface Breadcrumb {
  label?: string;
  name?: string;
}

interface Metafield {
  key: string;
  value: string[];
}

interface Variant {
  id: string;
  option2?: string;
  price?: string;
  quantity?: number; // Add quantity for variant inventory
} 

interface Brand {
  logo?: string;
}

interface Manufacturer {
  logo?: string;
  alt?: string;
}

interface User {
  name?: string;
}

interface Part {
  partId: number | undefined;
  title: string;
  description?: string;
  slug: string;
  brand?: Brand;
  manufacturer?: Manufacturer;
  user?: User;
  createdAt: string;
  inventory?: number; // Add inventory field
  demandScore?: number; // Add demand metrics
  wishlistCount?: number;
  inquiryCount?: number;
}

interface AdditionalDetail {
  heading: string;
  content: string;
  displayOrder: number;
}

interface PartApiData {
  part: Part;
  media: Media[];
  breadcrumb: Breadcrumb[];
  metafields: Metafield[];
  variants: Variant[];
  additionalDetails: AdditionalDetail[];
  totalInventory?: number; // Add total inventory from API
  restockRequestCount?: number; // Add restock count
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

export const revalidate = 240;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const slugs = await db.select({slug:parts.slug}).from(parts);
    return slugs;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

const formatPrice = (price?: string | null): string => {
  if (!price) return "N/A";
  const num = Number(price);
  if (Number.isNaN(num)) return price;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ParamSlug>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/parts/${slug}`,
      {
        next: { revalidate: 3000, tags: [`part-${slug}`] },
      }
    );

    if (!res.ok) {
      return {
        title: "Part Not Found",
        description: "This part could not be found.",
      };
    }

    const apiResp = (await res.json()) as ApiResponse<PartApiData>;
    const seo = apiResp?.data?.seo;

    if (!seo) {
      return {
        title: "Part Not Found",
        description: "This part could not be found.",
      };
    }

    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      openGraph: {
        title: seo.ogTitle || seo.metaTitle,
        description: seo.ogDescription || seo.metaDescription,
        images: seo.ogImage ? [seo.ogImage] : undefined,
      },
    };
  } catch (err) {
    console.error("generateMetadata error:", err);
    return { title: "Profile", description: "User profile page" };
  }
}

const PartPage = async ({ params }: { params: Promise<ParamSlug> }) => {
  const { slug } = await params;
  if (!slug) return notFound();

  // Get user session
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  const userEmail = session?.user.email
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/parts/${slug}`,
      {
        next: { revalidate: 3000, tags: [`part-${slug}`] },
      }
    );

    if (!res.ok) {
      console.error("fetch failed with status:", res.status);
      return notFound();
    }

    const apiResp = (await res.json()) as ApiResponse<PartApiData>;
    if (!apiResp?.success || !apiResp.data?.part) {
      return notFound();
    }

    const { 
      part, 
      media, 
      breadcrumb, 
      metafields, 
      variants, 
      additionalDetails,
      totalInventory,
      restockRequestCount 
    } = apiResp.data;

    const images: string[] = media?.map((m) => m.url) ?? [];
    const breadcrumbLabels: string[] =
      breadcrumb?.map((b) => b.label ?? b.name ?? "") ?? [];

    const conditionMf = metafields?.find((m) => m.key === "condition");
    const pcdMf = metafields?.find((m) => m.key === "pcd");
    const setMf = metafields?.find((m) => m.key === "set");

    const condition = conditionMf ? conditionMf.value.join(", ") : "N/A";
    const pcd = pcdMf ? pcdMf.value.join(", ") : "N/A";
    const setVal = setMf ? setMf.value.join(", ") : "N/A";

    const firstVariant =
      variants && variants.length > 0 ? variants[0] : undefined;
    const sizeInfo = firstVariant?.option2 ?? "N/A";
    const lastSalePrice = formatPrice(firstVariant?.price ?? null);
    const listingsCount = variants?.length ?? 0;

    // Calculate total inventory from variants or use part inventory
    const inventory = totalInventory ?? 
      part.inventory ?? 
      (variants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0);

    const accordionItems: { value: string; title: string; content: string }[] =
      [];

    if (part?.description) {
      accordionItems.push({
        value: "details",
        title: "Details",
        content: safeHtml(part.description),
      });
    }

    if (additionalDetails?.length) {
      additionalDetails
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach((detail, idx) => {
          accordionItems.push({
            value: `item-${idx + 1}`,
            title: detail.heading,
            content: safeHtml(detail.content),
          });
        });
    }

    return (
      <>
        <ListingCard
          images={images}
          breadcrumb={breadcrumbLabels}
          productName={part.title}
          brandImage={part.brand?.logo ?? part.manufacturer?.logo ?? ""}
          manufacturerLogo={part.manufacturer?.logo}
          manufacturerAlt={part.manufacturer?.alt}
          listingsCount={listingsCount}
          condition={condition}
          pcd={pcd}
          pairInfo={setVal}
          sizeInfo={sizeInfo}
          lastSalePrice={lastSalePrice}
          buyLink={`/buy-now/${part.slug}`}
          suggestPriceLink={`/suggest-price/${part.slug}`}
          user={{
            name: part.user?.name ?? "Unknown",
            profileImage: "/assets/images/withoutprofil.png",
            registeredSince: new Date(part.createdAt).getFullYear().toString(),
            listingsCount,
            onlineStatus: "Online Today",
          }}
          accordionItems={accordionItems}
          slug={part.slug}
          inventory={inventory}
          demandScore={part.demandScore}
          wishlistCount={part.wishlistCount}
          inquiryCount={part.inquiryCount}
          restockRequestCount={restockRequestCount}
          userId={userId}
          userEmail={userEmail || undefined}
          partId={part.partId}
        />

        <ListedItems />
      </>
    );
  } catch (err) {
    console.error("PartPage fetch error:", err);
    return notFound();
  }
};

export default PartPage;