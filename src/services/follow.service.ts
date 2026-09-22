import { handleRevalidate } from "@/utils/handleRevalidate";
import toast from "react-hot-toast";

export const followService = {
  checkFollowing: async ({
    followingId,
    followerId,
  }: {
    followingId: number;
    followerId: number;
  }) => {
    try {
      const followingRelations = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user/follow/checkFollowing?followingId=${followingId}&followerId=${followerId}`,
        {
          cache: "no-cache",
          next: {
            tags: ["profile"],
          },
        }
      );
      const result = await followingRelations.json();
      return result;
    } catch (error) {
      console.log("Error fetching store:", error);
      return {
        message: "Error fetching store",
        statusCode: 500,
      };
    }
  },
  getUserProfile: async ({ id }: { id: number }) => {
    const userData = await fetch(`/api/user?id=${id}`, {
      next: {
        tags: ["profile"],
      },
    });
    const user = await userData.json();
    return user;
  },
  followUser: async ({
    followerId,
    followingId,
  }: {
    followerId: number;
    followingId: number;
  }) => {
    const toastId = toast.loading("Following...");
    try {
      const userData = await fetch(`/api/user/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId,
          followingId,
        }),
        next: {
          tags: ["profile"],
        },
      });
      const user = await userData.json();
      if (user?.success) {
        toast.success(user?.message);
      }
      return user;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },
  unfollowUser: async ({
    followerId,
    followingId,
  }: {
    followerId: number;
    followingId: number;
  }) => {
    const toastId = toast.loading("Unfollowing...");
    try {
      const userData = await fetch(`/api/user/follow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId,
          followingId,
        }),
        next: {
          tags: ["profile"],
        },
      });
      const user = await userData.json();
      if (user?.success) {
        toast.success(user?.message);
      }
      return user;
    } catch (error) {
      console.error(error);
    } finally {
      toast.dismiss(toastId);
      handleRevalidate("profile");
    }
  },
  getFollowAndFollowers: async ({
    id,
    search = "",
    page = 1,
    limit = 14,
    type = "followers",
  }: {
    id?: number;
    search?: string;
    page?: number;
    limit?: number;
    type: "followers" | "following";
  }) => {
    try {
      const userData = await fetch(
        `/api/user/follow/followers?id=${id}&search=${search}&page=${page}&limit=${limit}&includeBuilds=${type}`
      );
      const user = await userData.json();
      return user;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
    }
  },
};
