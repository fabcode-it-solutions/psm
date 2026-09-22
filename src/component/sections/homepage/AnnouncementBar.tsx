/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import IconSettings from "@/assets/icons/IconSetting";
import IconPerson from "@/assets/icons/IconPerson";
import IconSearch from "@/assets/icons/IconSearch";
import IconAlert from "@/assets/icons/IconAlert";
import IconHeart from "@/assets/icons/IconHeart";
import IconDashboard from "@/assets/IconDashboard";
import Anchor from "@/component/ui/Anchor/Anchor";
import Link from "next/link";
import { useSession } from "next-auth/react";
import WishListPopup from "../wishlist/WishListPopup";
import NotificationPopup from "@/component/notifications/NotificationPopup";
import { User } from "@/db/schema/auth";
import { selectUser } from "@/libs/redux/selectors/selectors";
import { useAppSelector } from "@/libs/redux/hooks";
import Icon3dots from "@/assets/icons/Icon3dots";
import BottomDrawer from "@/component/global/BottomDrawer";
import PredictiveSearch from "../search/predictive-search/PredictiveSearch";

const AnnouncementBar = ({ initialUser }: { initialUser: User }) => {
  const pathname = usePathname();
  const userData = useAppSelector(selectUser);
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);

  const [user, setUser] = useState<User>(initialUser);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(
    "/assets/images/profilecar.jpg"
  );
  const [username, setUsername] = useState(session?.user?.name || "Oaksoe123");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (user?.anonymous) {
      setUsername(user?.anonymousName || "Anonymous");
    } else {
      setUsername(
        user?.username || user?.firstName || session?.user?.name || "Oaksoe123"
      );
    }
    if (user?.profileImage) setProfileImageUrl(user?.profileImage);

    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (pathname === "/settings/account-detail") {
      setProfileImageUrl("/assets/images/settings-user?.jpg");
      setUsername("SettingsUser");
    }
  }, [pathname]);

  return (
    <div className="bg-white">
      <div className="max-w-[1332px] px-[30px] w-full mx-auto flex justify-between py-[25px] max-tab-sm:px-[15px] items-center main-header">
        <div className="flex items-center h-fit">
          <Link href={"/"}>
            <Image
              src="/assets/logo/OverlapLogo 2.png"
              alt="Logo"
              width={169}
              height={22}
              unoptimized
              className="max-mb-sm:w-[140px] object-cover"
            />
          </Link>
        </div>

        {pathname === "/requestitem" ? (
          <div className="flex gap-6 items-center">
            <Anchor
              href="#"
              className="!text-[#333333] !min-w-[172px] max-sm:!w-full !leading-[1.43] tracking-[0.1px] !py-[11px] font-bold font-supreme !text-xs"
            >
              <span className="flex items-center gap-1.5">
                Create Listing
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 2.75C9 2.33579 8.66421 2 8.25 2C7.83579 2 7.5 2.33579 7.5 2.75V7H3.25C2.83579 7 2.5 7.33579 2.5 7.75C2.5 8.16421 2.83579 8.5 3.25 8.5H7.5V12.75C7.5 13.1642 7.83579 13.5 8.25 13.5C8.66421 13.5 9 13.1642 9 12.75V8.5H13.25C13.6642 8.5 14 8.16421 14 7.75C14 7.33579 13.6642 7 13.25 7H9V2.75Z"
                    fill="#333333"
                  />
                </svg>
              </span>
            </Anchor>
          </div>
        ) : (
          <div className="flex gap-2 items-center relative">
            {user && !loading && pathname !== "/settings/account-detail" && (
              <Link
                href={`/profile/${user?.id}`}
                className="flex items-center gap-2.5 max-tab-sm:hidden"
              >
                <Image
                  src={userData?.user?.profileImage || profileImageUrl}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full w-[40px] h-[40px] object-cover"
                />
                <h4 className="text-xl leading-[1.3] tracking-[0.2px] font-medium">
                  {userData?.user?.username || username}
                </h4>
              </Link>
            )}

            {!initialUser && !loading && !pathname.includes("/settings") && (
              <>
                <Anchor
                  href="/accounts/sign-in"
                  className="!py-[9px] !font-medium !tracking-normal !min-w-[180px] max-tab-sm:hidden"
                >
                  Login
                </Anchor>
                <Anchor
                  href="/accounts/sign-up"
                  className="!bg-transparent border-accent-100 border !text-accent-100 !py-[9px] !font-medium !tracking-normal !min-w-[180px] max-tab-sm:hidden"
                >
                  Create an account
                </Anchor>
              </>
            )}

            {pathname === "/settings/account-detail" && (
              <Anchor
                href="/"
                className="!bg-[#EFEFEF3D] !py-[12px] !min-w-[120px] !text-[#002029] text-xs font-bold max-tab-sm:hidden"
              >
                Looking to sell?
              </Anchor>
            )}

            <div className="sm:hidden flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex justify-center items-center cursor-pointer bg-white border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px]"
              >
                <IconSearch />
              </button>
              <NotificationPopup key="notification" />
              <BottomDrawer
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                heading="Search"
                content="Search for Cars, Manufacturers, Parts & Users"
                type="main"
              >
                <PredictiveSearch fullPage initialQuery="" />
              </BottomDrawer>
            </div>

            <div className="sm:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex justify-center items-center w-8 h-8 border rounded-full border-[#00202914]"
              >
                <Icon3dots className="text-black" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-2xl rounded-md z-50 flex flex-col">
                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="px-[18px] py-2 flex items-center gap-2 hover:bg-gray-100"
                  >
                    <span className="flex justify-center items-center border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px] cursor-pointer">
                      <IconPerson fill="#002029" />{" "}
                    </span>
                    <span>Profile</span>
                  </Link>
                  <div className="px-[18px] py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                    <WishListPopup />
                  </div>
                  <Link
                    href="/settings/account-detail"
                    onClick={() => setDropdownOpen(false)}
                    className="px-[18px] py-2 flex items-center gap-2 hover:bg-gray-100"
                  >
                    <span className="flex justify-center items-center border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px] cursor-pointer">
                      <IconSettings fill="#002029" />
                    </span>
                    <span>Settings</span>
                  </Link>
                </div>
              )}
            </div>

            {user && !loading && pathname !== "/settings/account-detail" && (
              <div className="hidden sm:flex gap-2 items-center">
                <Link
                  href={`/profile/${user?.id}`}
                  className="flex justify-center items-center border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px] cursor-pointer"
                >
                  <IconPerson fill="#002029" />
                </Link>

                <NotificationPopup key="notification" />
                <WishListPopup />

                <Link
                  href="/settings/account-detail"
                  className="flex justify-center items-center border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px] cursor-pointer"
                >
                  <IconSettings fill="#002029" />
                </Link>
              </div>
            )}
            {pathname === "/settings/account-detail" && (
              <div className="hidden sm:flex gap-2 items-center">
                <IconPerson fill="#212121" />
                <IconHeart fill="#212121" />
                <IconAlert fill="#212121" />
                <IconSearch fill="#212121" />
              </div>
            )}

            {user?.role === "superAdmin" && (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-100 text-white rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="flex sm:hidden justify-center items-center cursor-pointer"
                >
                  <span className="flex justify-center items-center border-[#00202914] border-[1.5px] p-[6px] rounded-full w-[32px] h-[32px] cursor-pointer">
                    <IconDashboard className=" rounded-md" />
                  </span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;
