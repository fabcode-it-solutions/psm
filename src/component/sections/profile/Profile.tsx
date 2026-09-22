/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import IconEdit from "@/assets/icons/IconEdit";
import IconMultiplePerson from "@/assets/icons/IconMultiplePerson";
import IconStar from "@/assets/icons/IconStar";
import StatPopup from "./FollowersPopup";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import ToggleButton from "@/component/ui/Toogle/Toogle";
import { Tooltip } from "@/component/ui/Tooltip/Tooltip";
import { setBlocked, setPrivate } from "@/libs/redux/slices/authSlice";
import { useProfileActions } from "@/hooks/useProfileActions";
import ProfileCover from "./ProfileCover";
import PrivateProfile from "./PrivateProfile";
import SocialIcons from "./SocialIcons";
import ProfileAction from "./ProfileAction";

import {
  GetUserResponse,
  StatItem,
  UploadFileType,
  UserInformationProps,
} from "@/types";
import UsernameCountdown from "@/component/ui/UsernameCountdown/UsernameCountdown";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hooks";
import {
  selectIsBlocked,
  selectIsPrivate,
} from "@/libs/redux/selectors/selectors";
import UsernameChangeDialog from "./UsernameChangeDialog";

const Profile: React.FC<UserInformationProps> = ({
  userData,
  isFollow,
  isPrivateServer,
  isBlockedSever,
  otherUser,
}) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<GetUserResponse>();
  const [image, setImage] = useState<UploadFileType>({});
  const [imageNewProfile, setNewProfileImage] = useState<UploadFileType>({});
  const [selectedItem, setSelectedItem] = useState<StatItem | null>(null);
  const [usernameChange, setUsernameChange] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.user?.user?.user);
  const isPrivate = useAppSelector(selectIsPrivate);
  const isBlocked = useAppSelector(selectIsBlocked);
  const {
    isFollowing,
    followLoading,
    unfollowLoading,
    loading,
    // blocking,
    isReported,
    followUser,
    unfollowUser,
    updateCoverImage,
    updateProfileImage,
    unblockUser,
    blockUser,
    checkReported,
    reportUser,
    refreshUser,
  } = useProfileActions(user, setUser, isFollow, isBlockedSever);

  const bgImage = useMemo(
    () => image.url || user?.user.coverImage || "/assets/images/profile-bg.jpg",
    [image.url, user?.user?.coverImage]
  );

  const stats: StatItem[] = useMemo(
    () => [
      {
        icon: (
          <IconMultiplePerson fill="#002029" className="w-[24px] h-[24px]" />
        ),
        value: user?.followers || 0,
        label: "Followers",
      },
      {
        icon: (
          <IconMultiplePerson fill="#002029" className="w-[24px] h-[24px]" />
        ),
        value: user?.following || 0,
        label: "Following",
      },
    ],
    [user?.followers, user?.following, isFollowing]
  );

  const handlePlusClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (isPrivateServer !== undefined) {
      dispatch(setPrivate(isPrivateServer));
    }
  }, [isPrivateServer]);

  useEffect(() => {
    if (isBlockedSever != undefined) {
      dispatch(setBlocked(isBlockedSever));
    }
  }, [isBlockedSever]);

  useEffect(() => {
    if (image.id && image.url && currentUser?.id) {
      updateCoverImage(image);
    }
  }, [image, currentUser?.id]);

  useEffect(() => {
    if (imageNewProfile.id && imageNewProfile.url && currentUser?.id) {
      updateProfileImage(imageNewProfile);
    }
  }, [imageNewProfile, currentUser?.id]);
  const checkIsUsernameChangeAllowed = useCallback(() => {
    const isAllowed = currentUser?.lastUsernameChanged?.allowed;
    if (isAllowed == false) {
      setUsernameChange("not_allowed");
      setTimeout(() => {
        setUsernameChange("");
      }, 5000);
      return null;
    }
    setUsernameChange("allowed");
  }, [currentUser]);
  // === Blocked user case ===
  if (isBlocked) {
    return (
      <PrivateProfile
        followUser={() => (user?.user.id ? unblockUser(user.user.id) : "")}
        heading="You have blocked this user."
        btnText="Unblock User"
        className="!my-0 !py-12"
        content="Unblock this account to see their posts and stories in your feed."
      />
    );
  }

  return (
    <div className="relative">
      {/* {blocking && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <LoaderDots />
        </div>
      )} */}

      <div>
        {!isPrivate && (
          <ProfileCover
            coverImage={bgImage}
            otherUser={otherUser || false}
            setImage={setImage}
          />
        )}
        {usernameChange == "allowed" && (
          <UsernameChangeDialog
            setUsernameChange={setUsernameChange}
            usernameChange={usernameChange}
          />
        )}
        <section
          className={`max-w-[1120px] w-full px-[30px] relative ${
            !isPrivate ? "bottom-[70px]" : "mt-6"
          } mx-auto max-tab-sm:px-4`}
        >
          <div className="flex gap-[89px] flex-wrap max-tab-md:gap-[20px]">
            {/* === Profile Image + Upload === */}
            <div className="relative max-w-[257px] h-[256.34px] max-tab-md:max-w-[170px] max-tab-md:max-h-[170px]">
              <Image
                src={
                  imageNewProfile.url ||
                  user?.user?.profileImage ||
                  "/assets/images/CarProfile.jpg"
                }
                alt="User profile picture"
                width={257}
                height={258}
                className="rounded-full object-cover w-[257.96px] h-[256.34px] max-tab-md:max-w-[170px] max-tab-md:max-h-[170px] max-tab-sm:min-w-[55px] max-tab-sm:min-h-[55px]"
              />
              <UploadInput
                setImageFile={setNewProfileImage}
                required={false}
                label="upload"
                mode="accounts"
                className="!w-auto"
                trigger={
                  !otherUser && (
                    <div
                      onClick={handlePlusClick}
                      className="absolute right-[6.04px] bottom-[3.53px] cursor-pointer p-[7.81px] min-w-[68.75px] max-h-[68.75px] max-tab-sm:min-w-[52px] max-tab-sm:h-[52px] rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition"
                      title="Add profile image"
                    >
                      <span className="p-[11px] bg-accent-100 rounded-full flex items-center justify-center max-tab-sm:p-[7px]">
                        <IconEdit
                          className="w-[30px] h-[31.45px] max-tab-sm:w-[20px] max-tab-sm:h-[20px]"
                          fill="#FFFFFF"
                        />
                      </span>
                    </div>
                  )
                }
              />
            </div>

            {/* === User Content === */}
            <div className="max-w-[696px] w-full flex flex-col gap-5 max-des-xs:max-w-[580px] max-tab-sm:max-w-full max-tab-sm:py-4">
              {/* Stats */}
              <div className="flex gap-[32px] max-tab-sm:gap-[20px] flex-wrap">
                {stats.map((item, index) => {
                  const content = (
                    <div
                      onClick={() => {
                        if (!item.href && !isPrivate) setSelectedItem(item);
                      }}
                      className="cursor-pointer py-2 bg-[#FFFFFFFA] min-w-[150px] max-tab-lg:min-w-[120px] flex flex-col justify-center items-center gap-1 rounded-[10px]"
                    >
                      {item.icon}
                      <h4 className="text-xl font-bold leading-[1.35] tracking-[-0.17px]">
                        {item.value}
                      </h4>
                      <p className="text-base tracking-[0.64px] leading-[1.19]">
                        {item.label}
                      </p>
                    </div>
                  );

                  return item.href ? (
                    <Link href={item.href} key={index}>
                      {content}
                    </Link>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </div>

              <AnimatePresence>
                {user && selectedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-dark-blue-cm/10  overflow-y-auto"
                  >
                    <StatPopup
                      isFollowing={isFollowing}
                      item={selectedItem}
                      id={user?.user.id}
                      refreshUser={refreshUser}
                      loading={followLoading || unfollowLoading}
                      onClose={() => setSelectedItem(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Header + Actions */}
              <div className="flex-col lg:flex lg:flex-row lg:gap-[20px]">
                <div
                  className={`flex items-center justify-between gap-6 ${
                    !otherUser ? "w-full" : ""
                  }`}
                >
                  <h1 className="hidden">
                    {" "}
                    {user?.user?.username ||
                      user?.user?.firstName ||
                      user?.user?.lastName ||
                      "Guest"}
                  </h1>
                  <h2 className="text-[24px] flex items-center gap-3 font-extrabold leading-[1.34] tracking-[0.24px] text-[#002029]">
                    {user?.user?.username ||
                      user?.user?.firstName ||
                      user?.user?.lastName ||
                      "Guest"}
                    {!otherUser && (
                      <button
                        onClick={checkIsUsernameChangeAllowed}
                        type="button"
                      >
                        <IconEdit className="w-5 h-6" />
                      </button>
                    )}
                  </h2>

                  {/* {!otherUser && user && (
                    <div
                      className={`flex items-center gap-2 ${
                        loading ? "pointer-none:" : ""
                      }`}
                    >
                      <span className="flex gap-[9px]">
                        <Tooltip
                          content="When your account is private, only approved followers can see your profile. Others will need to send a follow request."
                          label="Make account private"
                        />
                      </span>

                      <ToggleButton
                        onPressedChange={onPressedChange}
                        pressed={user?.user?.isPrivate || false}
                      />
                    </div>
                  )} */}
                </div>

                {otherUser && user && (
                  <ProfileAction
                    blocking={loading}
                    followLoading={followLoading}
                    isReported={isReported}
                    unfollowLoading={unfollowLoading}
                    isFollowing={isFollowing || isFollow || false}
                    user={user}
                    unfollowUser={unfollowUser}
                    followUser={followUser}
                    checkReported={checkReported}
                    blockUser={blockUser}
                    reportUser={reportUser}
                  />
                )}
              </div>
              {usernameChange == "not_allowed" &&
                currentUser?.lastUsernameChanged?.pending && (
                  <div>
                    <UsernameCountdown
                      nextAllowed={currentUser?.lastUsernameChanged?.pending}
                    />
                  </div>
                )}

              {/* Trusted Seller */}
              {otherUser && user?.user?.isTrustedSeller && (
                <span className="bg-[#002029] rounded-[20px] py-[8px] px-[10px] max-w-[116px] flex gap-[4px]">
                  <IconStar fill="#54DC00" />
                  <h4 className="text-xs font-medium font-sans leading-[1.335] text-[#FFFFFF]">
                    Trusted Seller
                  </h4>
                </span>
              )}

              {/* Bio */}
              {user?.user?.bio && (
                <span className="flex gap-2 flex-col">
                  <h6 className="text-sm leading-[16px] font-medium text-[#606060]">
                    Description
                  </h6>
                  <p className="text-sm font-medium leading-[1.359] text-[#002029]">
                    {user.user.bio}
                  </p>
                </span>
              )}

              {!isPrivate && user && <SocialIcons user={user} />}
            </div>
          </div>

          {/* Private Profile */}
          {isPrivate && <PrivateProfile followUser={() => followUser()} />}
        </section>
      </div>
    </div>
  );
};

export default Profile;
