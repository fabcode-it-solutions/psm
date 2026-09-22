import MarketPlace from "@/component/sections/marketPlace/MarketPlace";
import { db } from "@/db/db";
import { categories } from "@/db/schema/categories";
import { CategoryService } from "@/services/categoryService";
import { filterService } from "@/services/filter.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
export const revalidate = 240;
export const dynamic = "force-dynamic";


export async function generateStaticParams() {
  try {
  const slugs = await db.select({ slug: categories.slug }).from(categories);

    return slugs.map((item) => ({
      slug: [item.slug], 
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
 const currentSlug = slug[slug.length - 1];
  try {
    const category = await CategoryService.getCategory(currentSlug);

    if (category.status == 404) {
      return {
        title: "User Not Found",
        description: "This user profile could not be found.",
      };
    }
    const seo = category.data?.seoMeta;
    return {
      title: `${seo?.metaTitle || category?.data?.name}`,
      description: `${seo?.metaDescription}`,
      keywords: seo?.metaKeywords,
      openGraph: {
        title: seo?.ogTitle || seo?.metaTitle || category?.data?.name || "",
        description: seo?.ogDescription || seo?.metaDescription || "",
        images: seo?.ogImage ? seo?.ogImage : undefined,
      },
    };
  } catch {
    return {
      title: "Profile",
      description: "User profile page",
    };
  }
}
interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: ProfilePageProps) => {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];
  const category = await CategoryService.getCategory(currentSlug);
  if (category.success == false && category.status == 404) {
    return notFound();
  }
  const filters = await filterService.getCategoryFilter({ slug:currentSlug });

  return (
    <div>
      <MarketPlace filters={filters.data} slug={currentSlug} />
    </div>
  );
};

export default Page;
