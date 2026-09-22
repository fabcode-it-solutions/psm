import React from "react";
import Profile from "./Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth/auth";
import { notFound } from "next/navigation";
export const revalidate = 3000;
export const dynamic = "force-dynamic";
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === retries) {
        return response;
      }
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}
async function getUserData(id: number) {
  "use cache";
  try {
    const response = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${id}`,
      {
        next: {
          revalidate: 300,
          tags: [`user-${id}`],
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching user data for ID ${id}:`, error);
    return null;
  }
}

async function checkFollowingStatus(
  currentUserId: number,
  targetUserId: number
) {
  try {
    const response = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_API_PATH}/user/follow/checkFollowing?followingId=${targetUserId}&followerId=${currentUserId}`,
      {
        next: {
          revalidate: 30, // 30 seconds for follow status (more dynamic)
          tags: [`follow-${currentUserId}-${targetUserId}`],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error checking follow status:`, error);
    return { following: false }; // Default fallback
  }
}

async function checkBlockedStatus(currentUserId: number, targetUserId: number) {
  try {
    const response = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_API_PATH}/user/block/checkBlocked?userId=${targetUserId}&currentUserId=${currentUserId}`,
      {
        next: {},
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = response.json();

    return result;
  } catch (error) {
    console.error(`Error checking block status:`, error);
    return { blocked: false };
  }
}

interface ProfileCheckProps {
  id: number;
}

const ProfileCheck = async ({ id }: ProfileCheckProps) => {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  try {
    const userData = await getUserData(id);

    if (!userData) {
      return notFound();
    }

    if (!currentUserId) {
      return (
        <div>
          <Profile
            userData={userData}
            isFollow={false}
            isPrivateServer={userData.user.isPrivate}
            isBlockedSever={false}
            currentUserId={null}
            otherUser={true}
          />
        </div>
      );
    }
    if (currentUserId === id) {
      return (
        <div>
          <Profile
            userData={userData}
            isFollow={false}
            isPrivateServer={false}
            isBlockedSever={false}
            otherUser={false}
            currentUserId={currentUserId}
          />
        </div>
      );
    }
    const [isYouFollowingData, isFollowingData, isBlockedData, selfBlockData] =
      await Promise.all([
        checkFollowingStatus(currentUserId, id),
        checkFollowingStatus(id, currentUserId),
        checkBlockedStatus(currentUserId, id),
        checkBlockedStatus(id, currentUserId),
      ]);

    if (selfBlockData.blocked) {
      return notFound();
    }
    const isPrivate =
      isFollowingData.following &&
      !isYouFollowingData.following &&
      userData.user.isPrivate;

    const isBlocked = isBlockedData.blocked;

    return (
      <div>
        <Profile
          userData={userData}
          isFollow={isYouFollowingData.following}
          isPrivateServer={isPrivate}
          isBlockedSever={isBlocked}
          currentUserId={currentUserId}
          otherUser={currentUserId != id}
        />
      </div>
    );
  } catch (error) {
    console.error("ProfileCheck error:", error);
    return notFound();
  }
};

export default ProfileCheck;
