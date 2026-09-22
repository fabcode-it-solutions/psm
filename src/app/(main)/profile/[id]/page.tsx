import PopularUsers from "@/component/sections/popularusers/PopularUsers";
import ProfileCheck from "@/component/sections/profile/ProfileCheck";
import ProfileMainContent from "@/component/sections/profile/ProfileMainContent";
import React from "react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import { db } from "@/db/db";
import { users } from "@/db/schema/auth";


export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const userIds = await db.select({id:users.id}).from(users);
    const ids = userIds.map((item)=> ({id:item.id.toString()}));
    return ids;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const userData = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`,
      {
        next: {
          revalidate: 3600,
          tags: [`user-${id}`],
        },
      }
    );

    const user = await userData.json();

    if (!user?.user) {
      return {
        title: "User Not Found",
        description: "This user profile could not be found.",
      };
    }
    return {
      title: `${
        user.user.username || user.user.firstName || "Guest"
      } - Profile`,
      description: `View ${
        user.user.username || user.user.firstName || "Guest"
      }'s profile and posts.`,
      openGraph: {
        title: `${user.user.username} - Profile`,
        description: `View ${user.user.username}'s profile and posts.`,
        images: user.user.image ? [user.user.image] : undefined,
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
  params: Promise<{ id: string }>;
}
const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = parseInt(id);
  if (isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const [popularData] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/user/popular?limit=3&id=${session?.user.id}`,
      {
        next: {
          revalidate: 1800,
          tags: ["popular-users"],
        },
      }
    ).catch((error) => {
      console.error("Failed to fetch popular users:", error);
      return { json: () => ({ data: [] }) };
    }),
  ]);

  const popularUser = await popularData.json();

  return (
    <div className="">
      <ProfileCheck id={userId} />
      {popularUser.data && popularUser.data.length > 0 && (
        <PopularUsers popularUser={popularUser.data} profile={true} />
      )}
      <ProfileMainContent />
    </div>
  );
};

export default ProfilePage;
