/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import IconPerson from "@/assets/icons/IconPerson";
import IconQuestionCircle from "@/assets/icons/IconQuestionCircle";
import IconLock from "@/assets/icons/IconLock";
import IconAlert from "@/assets/icons/IconAlert";
import IconDocumentText from "@/assets/icons/IconDocumentText";
import IconWallet from "@/assets/icons/IconWallet";
import IconInfo from "@/assets/icons/IconInfo";
import LogoutButton from "@/component/ui/logout/logoutButton";
import IconBlockedUser from "@/assets/icons/IconBlockedUser";
import IconReport from "@/assets/icons/IconReport";
import {
  MessageCircleDashedIcon,
  MessageSquareDiff,
  MessageSquareDot,
  MessageSquareMore,
} from "lucide-react";
import IconWishlist from "@/assets/icons/IconWishlist";
import IconOrders from "@/assets/icons/IconOrders";

export function SidebarMainMenu() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);

  const menuItems = [
    {
      label: "Account Detail",
      href: "/settings/account-detail",
      icon: (isActive: any) => (
        <IconPerson
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Messages",
      href: "/messages",

      icon: (isActive: any) => (
        <MessageSquareMore className={isActive ? "fill-accent-100" : ""} />
      ),
    },
    {
      label: "Update Password",
      href: "/accounts/forgot-password",
      icon: () => <IconLock />,
    },
    {
      label: "Notifications",
      href: "/settings/notification",

      icon: (isActive: any) => (
        <IconAlert
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Wishlist",
      href: "/wishlist",

      icon: (isActive: any) => (
        <IconWishlist
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Orders",
      href: "/orders",

      icon: (isActive: any) => (
        <IconOrders
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Payments",
      href: "/payments",
      icon: (isActive: any) => (
        <IconWallet
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Terms & Conditions",
      href: "/terms-conditions",

      icon: (isActive: any) => (
        <IconDocumentText
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Blocked Users",
      href: "/settings/blocked-users",

      icon: (isActive: any) => (
        <IconBlockedUser
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Help",
      href: "/help",

      icon: (isActive: any) => (
        <IconQuestionCircle
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "About",
      href: "/about",

      icon: (isActive: any) => (
        <IconInfo
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
    {
      label: "Report",
      href: "/settings/reports",
      icon: (isActive: any) => (
        <IconReport
          fill={isActive ? "#00DF00" : "#4F4F4F"}
          className={isActive ? "fill-accent-100" : "fill-[#4F4F4F]"}
        />
      ),
    },
  ];

  return (
    <>
      <div className="md:hidden p-4">
        <button onClick={toggleMobile} aria-label="Open Menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            className="fill-accent-100"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        </button>
      </div>
      <div
        className={`fixed z-40 top-0 left-0 h-full w-[80%] max-w-xs bg-white shadow-md transition-transform overflow-y-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-lg font-medium">Setting</span>
          <button onClick={toggleMobile} aria-label="Close Menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              className="fill-accent-100"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-4">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 py-3 px-2 rounded-md transition-colors ${
                  isActive ? " text-accent-100 font-medium" : "text-[#4F4F4F]"
                }`}
              >
                <span
                  className={`w-6 h-6 flex justify-center items-center ${
                    isActive ? "fill-accent-100" : "fill-[#4F4F4F]"
                  }`}
                >
                  {icon(isActive)}
                </span>
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
          <div className="py-3 border-t mt-3 px-3">
            <LogoutButton />
          </div>
        </nav>
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobile}
        />
      )}
      <aside className="hidden md:flex w-[423px] bg-white flex-col max-des-lg:w-[300px] max-des-xlg:pl-[15px] ">
        <nav className="flex flex-col gap-2 2xl:max-w-[303px] max-w-[303px] ml-auto h-full w-full overflow-y-auto  2xl:left-[120px] left-[110px] max-des-lg:left-[15px] max-des-lg:max-w-[200px]">
          <button onClick={() => router.back()} className="py-[34px]">
            <span className="flex items-center gap-[10px]">
              <Image
                src="/assets/icon/Arrow.png"
                alt=""
                width={24}
                height={24}
                className="p-1 border-[1.5px] border-[#00202914] max-w-[32px] max-h-[32px] w-full rounded-full"
              />
              <p className="text-sm leading-[1.4] tracking-[0.14px]">Back</p>
            </span>
          </button>

          <Tooltip.Provider delayDuration={0}>
            {menuItems.map(({ label, href, icon }) => {
              const isActive = pathname === href;
              return (
                <Tooltip.Root key={href}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={href}
                      className={`flex items-center justify-between rounded-md transition-colors ${
                        isActive
                          ? "bg-white text-accent-100 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-[10px] py-[18px]">
                        <span
                          className={`w-6 h-6 flex justify-center items-center ${
                            isActive ? "fill-accent-100" : "fill-[#4F4F4F]"
                          }`}
                        >
                          {icon(isActive)}
                        </span>
                        <span className="text-sm">{label}</span>
                      </div>

                      {isActive && (
                        <span className="w-[6px] bg-accent-100 min-h-[60px] rounded-l"></span>
                      )}
                    </Link>
                  </Tooltip.Trigger>
                </Tooltip.Root>
              );
            })}{" "}
            <div className=" py-[18px]">
              <LogoutButton />
            </div>
          </Tooltip.Provider>
        </nav>
      </aside>
    </>
  );
}
