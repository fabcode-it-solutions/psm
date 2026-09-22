/* eslint-disable react-hooks/exhaustive-deps */
import IconBlock from "@/assets/icons/IconBlock";
import IconBookmarkSimple from "@/assets/icons/IconBookMarkSimple";
import IconFriendRequest from "@/assets/icons/IconFriendRequest";
import IconMessage from "@/assets/icons/IconMeassage";
import IconWarning from "@/assets/icons/IconWarning";
import Spinner from "@/component/ui/loader/Spinner";
import TooltipRad from "@/component/ui/Tooltip/TooltipRad";
import { GetUserResponse } from "@/types";
import React, { useEffect, useState } from "react";
import ReportPopup from "../user/ReportPopup";
import toast from "react-hot-toast";
import Bookmark from "@/component/products/Bookmark";
import { useTheme } from "@/providers/ThemeProvider";
import { conversationService } from "@/services/conversation.services";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { useRouter } from "next/navigation";

const ProfileAction = ({
  user,
  isFollowing,
  followLoading,
  unfollowLoading,
  blocking,
  isReported,
  followUser,
  unfollowUser,
  blockUser,
  checkReported,
  reportUser,
}: {
  user: GetUserResponse;
  isFollowing: boolean;
  followLoading: boolean;
  unfollowLoading: boolean;
  blocking: boolean;
  isReported: boolean;
  followUser: () => void;
  unfollowUser: () => void;
  blockUser: (id: number) => void;
  checkReported: (id: number) => void;
  reportUser: (
    id: number,
    updates: {
      reason: string;
      description: string;
      category: string;
      imageMediaId?: number;
    }
  ) => void;
}) => {
  const router = useRouter();
  const sender = useSelector((state: RootState) => state.user.user?.user);
  const { wishlistedItems } = useTheme();
  const [openReport, setOpenReport] = useState(false);
  useEffect(() => {
    if (user && checkReported) {
      checkReported(user.user.id);
    }
  }, [user]);
  const isWishlisted = wishlistedItems.find(
    (item) => item.entityId === user.user.id && item.entityType === "user"
  );
  const checkConversation = async () => {
    try {
      const data = await conversationService.checkConversation({
        userId: user.user.id,
        senderId: sender?.id,
      });
      if (data.data?.conversationId) {
        router.push(`/messages/${data.data?.conversationId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="flex gap-[8px] mt-5 lg:mt-0 ">
      <TooltipRad
        trigger={
          <button
            onClick={() =>
              isFollowing
                ? unfollowLoading
                  ? ""
                  : unfollowUser()
                : followLoading
                ? ""
                : followUser()
            }
            type="button"
            className="p-[10px] bg-[#002029] rounded-full w-[44px] h-[44px] flex items-center justify-center"
          >
            {unfollowLoading || followLoading ? (
              <Spinner className="!w-6 !h-6" />
            ) : (
              <IconFriendRequest
                className="fill-accent-100"
                unFollow={isFollowing}
              />
            )}
          </button>
        }
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </TooltipRad>

      <button
        onClick={checkConversation}
        type="button"
        className="p-[10px] bg-[#002029] rounded-full w-[44px] h-[44px] flex items-center justify-center"
      >
        <IconMessage fill="#54DC00" />
      </button>
      <TooltipRad
        trigger={
          <button
            onClick={() =>
              isReported
                ? toast("User is already reported.", {
                    icon: "ⓘ",
                  })
                : setOpenReport(true)
            }
            type="button"
            className="p-[10px] bg-[#002029] rounded-full w-[44px] h-[44px] flex items-center justify-center"
          >
            {blocking ? (
              <Spinner className="!w-6 !h-6" />
            ) : (
              <IconWarning fill="#54DC00" />
            )}
          </button>
        }
      >
        {isReported ? "User is already reported" : "Report User"}
      </TooltipRad>
      <TooltipRad
        trigger={
          <button
            onClick={() => (blocking ? "" : blockUser(user?.user.id))}
            type="button"
            className="p-[10px] bg-[#002029] rounded-full w-[44px] h-[44px] flex items-center justify-center"
          >
            {blocking ? (
              <Spinner className="!w-6 !h-6" />
            ) : (
              <IconBlock fill="#54DC00" />
            )}
          </button>
        }
      >
        Block User
      </TooltipRad>

      <Bookmark
        isMarked={isWishlisted ? true : false}
        entityType="user"
        addicon={<Icon />}
        id={user?.user.id}
      />

      <ReportPopup
        user={user}
        reportUser={reportUser}
        open={openReport}
        setOpen={() => setOpenReport(false)}
      />
    </div>
  );
};

export default ProfileAction;

const Icon = () => {
  return (
    <span className="p-[10px] bg-[#002029] rounded-full w-[44px] h-[44px] flex items-center justify-center">
      <IconBookmarkSimple className="fill-accent-100" />
    </span>
  );
};
