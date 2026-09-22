import PrivateProfile from "@/component/sections/profile/PrivateProfile";
import ProfileCheck from "@/component/sections/profile/ProfileCheck";
import UserWhisList from "@/component/sections/user-wishlist/UserWhisList";
import { authOptions } from "@/libs/next-auth/auth";
import { wishlistService } from "@/services/wishlist.service";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const category = await wishlistService.getWishlistCategory({
      categorySlug: id,
    });

    if (category.status == 404) {
      return {
        title: "Category Not Found",
        description: "This category could not be found.",
      };
    }
    const seo = category.data?.seo;
    return {
      title: `${seo?.metaTitle || category?.data?.name}`,
      description: `${seo?.metaDescription || category?.data?.description}`,
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

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {  
  const { id } = await params;
  const searchParam = await searchParams;
  const type = searchParam?.type;
  const session = await getServerSession(authOptions);
  const res = await wishlistService.getWishlistCategory({
    categorySlug: `${id}${type == "all" ? `?type=all&userId=${session?.user.id}` : ""}`,
  }); 
  if (!res.data?.isPublic) {
    return (
      <PrivateProfile
        heading="This wishlist collections is private."
        className="!my-0 !py-12"
        content="You can't view this wishlist collections because it is private."
      />
    );
  }
  return (
    <div>
      <ProfileCheck id={Number(session?.user.id)} />
      {session && session?.user.id && (
        <UserWhisList category={res} userId={Number(session?.user.id)} />
      )}
    </div>
  );
};

export default page;
