/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { followService } from "@/services/follow.service";
import { userService } from "@/services/user.service";
import { GetUserResponse, UploadFileType } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import {
  setBlocked,
  setPrivate,
  updateUser,
} from "@/libs/redux/slices/authSlice";
import toast from "react-hot-toast";
import { useTheme } from "@/providers/ThemeProvider";
import { useChatContext } from "@/providers/ChatContext";

export const useProfileActions = (
  user: GetUserResponse | undefined,
  setUser?: (u: GetUserResponse) => void,
  isFollow?: boolean,
  isBlockedSever?: boolean
) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user?.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  // const [blocking, setBlocking] = useState(false);
  const [unfollowLoading, setUnfollowLoading] = useState(false);
  const { setLoader } = useTheme();
  const { sendNotification } = useChatContext();
  useEffect(() => {
    if (isFollow != undefined) {
      setIsFollowing(isFollow);
    }
  }, [isFollow]);
  useEffect(() => {
    if (isBlockedSever != undefined) {
      if (isBlockedSever) {
        dispatch(setBlocked(true));
        dispatch(setPrivate(true));
      }
    }
  }, [isBlockedSever]);
  useEffect(() => {
    if (currentUser && user) {
      checkReported(user?.user.id);
    }
  }, [currentUser, user]);
  const followUser = async () => {
    try {
      setFollowLoading(true);
      await followService.followUser({
        followerId: Number(currentUser?.user.id),
        followingId: Number(user?.user.id),
      });

      await checkFollowing();
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      alert(user?.user.notificationId);
      if (user?.user.notificationId) {
        sendNotification(
          user?.user.notificationId,
          String(currentUser?.user.username),
          String(
            currentUser?.user.profileImage || "/assets/images/WithoutProfil.png"
          ),
          "is now following you",
          "follow"
        );
      }
      setFollowLoading(false);
    }
  };

  const unfollowUser = async () => {
    try {
      setUnfollowLoading(true);
      await followService.unfollowUser({
        followerId: Number(currentUser?.user.id),
        followingId: Number(user?.user.id),
      });
      if (user?.user.id !== currentUser?.user?.id && user?.user.firstName) {
        dispatch(setPrivate(true));
      }
      await checkFollowing();
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setUnfollowLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    await checkBlocked(user.user.id);
    await checkReported(user.user.id);
    const updated = await followService.getUserProfile({ id: user.user.id });
    if (setUser) {
      setUser(updated);
    }
  };

  const checkFollowing = async () => {
    const res = await followService.checkFollowing({
      followerId: Number(currentUser?.user?.id),
      followingId: Number(user?.user.id),
    });

    if (res.following) {
      dispatch(setPrivate(false));
    }
    setIsFollowing(res.following);
  };

  const updateCoverImage = async (image: UploadFileType) => {
    if (!currentUser?.user.id || !image.url) return;
    await userService.updateUser({
      userId: currentUser.user.id,
      updates: { coverImage: image.url },
    });
    dispatch(updateUser({ coverImage: image.url }));
  };

  const updateProfileImage = async (image: UploadFileType) => {
    if (!currentUser?.user.id || !image.url) return;
    await userService.updateUser({
      userId: currentUser.user.id,
      updates: { profileImage: image.url },
    });
    dispatch(updateUser({ profileImage: image.url }));
  };

  const onPressedChange = async (pressed: boolean) => {
    if (loading || !currentUser?.user.id) return;

    setLoading(true);
    const toastId = toast.loading("Modifying...");

    const result = await userService.updateUser({
      userId: currentUser.user.id,
      updates: { isPrivate: pressed },
    });

    if (result?.success) {
      toast.success(
        pressed ? "Your account is now private." : "Your account is now public."
      );
    } else {
      toast.error("Something went wrong while updating your account.");
    }
    toast.dismiss(toastId);

    await refreshUser();
    setLoading(false);
  };

  const blockUser = async (id: number) => {
    try {
      setLoader("Blocking user"); // 👈 show loader globally
      await userService.blockUser({
        userId: id,
        currentUserId: Number(currentUser?.user.id),
      });
      await followService.unfollowUser({
        followerId: Number(currentUser?.user.id),
        followingId: id,
      });
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(""); // 👈 hide loader
    }
  };

  const checkBlocked = async (id: number) => {
    if (!id || !currentUser) return;
    const res = await userService.checkBlocked({
      currentUserId: Number(currentUser.user.id),
      userId: Number(id),
    });
    dispatch(setPrivate(res.blocked));
    dispatch(setBlocked(res.blocked));
  };

  const unblockUser = async (id: number) => {
    try {
      setLoader("Unblocking user");
      await userService.unBlockUser({
        userId: id,
        currentUserId: Number(currentUser?.user.id),
      });
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setLoader("");
    }
  };
  const reportUser = async (
    id: number,
    updates: {
      reason: string;
      description: string;
      category: string;
      imageMediaId?: number;
    }
  ) => {
    //   try {
    //     setBlocking(true);
    //     await userService.reportUser({
    //       userId: id,
    //       currentUserId: Number(currentUser?.user.id),
    //       reason: updates.reason,
    //       description: updates.description,
    //       category: updates.category,
    //       imageMediaId: updates?.imageMediaId,
    //     });
    //     await refreshUser();
    //   } catch (error) {
    //     console.error(error);
    //   } finally {
    //     setBlocking(false);
    //   }
    // };

    try {
      setLoader("Reporting user...");
      await userService.reportUser({
        userId: id,
        currentUserId: Number(currentUser?.user.id),
        reason: updates.reason,
        description: updates.description,
        category: updates.category,
        imageMediaId: updates?.imageMediaId,
      });
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setLoader("");
    }
  };
  const checkReported = async (id: number) => {
    if (!id || !currentUser) return;
    const res = await userService.checkReport({
      currentUserId: Number(currentUser.user.id),
      userId: Number(id),
    });

    setIsReported(res.reported);
  };
  return {
    isFollowing,
    followLoading,
    unfollowLoading,
    loading,
    // blocking,
    isReported,
    followUser,
    unfollowUser,
    refreshUser,
    checkFollowing,
    updateCoverImage,
    updateProfileImage,
    onPressedChange,
    blockUser,
    checkBlocked,
    unblockUser,
    reportUser,
    checkReported,
  };
};
