import { Suspense } from "react";
import Banner from "@/component/banner/Banner";
import MainProducts from "@/component/sections/homepage/MainProducts";
import RecommendProducts from "@/component/sections/homepage/RecommendProducts";
import ImageWithText from "@/component/sections/homepage/ImageWithText";
import RecommendedMultipleProduct from "@/component/sections/homepage/RecommendedMultipleProduct";
import TrendingProducts from "@/component/sections/homepage/TrendingProducts";
import PopularUsers from "@/component/sections/popularusers/PopularUsers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import OverlapWorks from "@/component/sections/homepage/OverlapWorks";


export const revalidate = 300;

async function getPopularUsers(id?: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/user/popular?limit=3&id${id}`,
    {
      next: {
        revalidate: 300,
        tags: ["popular-users"],
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular users");
  }

  return response.json();
}

// Loading component
function PopularUsersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded"></div>
    </div>
  );
}

// Async component with caching
async function PopularUsersSection() {
  const session = await getServerSession(authOptions);
  try {
    const popularUser = await getPopularUsers(session?.user?.id);
    return <PopularUsers popularUser={popularUser.data} />;
  } catch (error) {
    console.error("Failed to load popular users:", error);
    return <div>Unable to load popular users</div>;
  }
}

export default async function Page() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_PATH}/parts/marketplace`,
    {
      method: "POST",
      body: JSON.stringify({
        slug: "wheels-accessories",
      }),
    }
  );
  const data = await response.json();
  return (
    <main className="">
      <Banner />
      <MainProducts data={data.parts} />
      <RecommendProducts data={data.parts} />
      <TrendingProducts />
      <Suspense fallback={<PopularUsersLoading />}>
    
        <PopularUsersSection />
      </Suspense>

      <ImageWithText />
      <RecommendedMultipleProduct data={data.parts} />
      <OverlapWorks/>
    </main>
  );
}
