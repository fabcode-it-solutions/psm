"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import Image from "next/image";

const MainHeader = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const menu = [
    { name: "Home", link: "/" },
    { name: "Buy Parts", link: "/marketplaces/wheels-accessories" },
    { name: "Sell Parts", link: "/sellparts" },
    { name: "Community", link: "/community" },
    { name: "Events", link: "/events" },
    { name: "About", link: "/about" },
    { name: "Help", link: "/help" },
  ];
  const checkIsActive = (name: string, link: string) => {
    if (name === "Buy Parts") {
      return (
        pathname === "/marketplaces" || pathname.startsWith("/marketplaces/")
      );
    }
    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <header className="bg-[#01212A] w-full relative z-9">
      <div className="hidden lg:flex flex-wrap gap-2 max-w-[1002px] w-full mx-auto justify-center">
        {menu.map((item, index) => {
          const isActive = checkIsActive(item.name, item.link);
          return (
            <Link
              key={index}
              href={item.link}
              className={`min-w-[114px] py-[17px] flex justify-center items-center text-lg font-normal font-sofia-sans leading-[1.223] tracking-[0.72px] cursor-pointer
                ${
                  isActive
                    ? "border-b-4 border-accent-100 text-accent-100"
                    : "border-b-4 border-transparent text-white"
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="flex lg:hidden justify-between items-center px-4 py-4">
        <button
          onClick={toggleMobile}
          aria-label="Open Menu"
          className="text-white text-2xl"
        >
          <IoMenu />
        </button>
      </div>

      <div
        className={`fixed z-[99999999] top-0 left-0 h-full w-[80%] max-w-xs bg-[#FFFFFF] shadow-md transition-transform duration-300 transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <span>
            <Image
              src="/assets/logo/OverlapLogo 2.png"
              alt="Logo"
              width={169}
              height={22}
              unoptimized
            />
          </span>
          <button
            onClick={toggleMobile}
            aria-label="Close Menu"
            className="text-[#01212A] text-2xl"
          >
            <IoClose />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          {menu.map(({ name, link }) => {
            const isActive = checkIsActive(name, link);

            return (
              <Link
                key={link}
                href={link}
                onClick={() => setIsMobileOpen(false)}
                className={`text-base py-2 px-2 rounded-md ${
                  isActive ? "text-accent-100 font-semibold" : "text-[#01212A]"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleMobile}
        />
      )}
    </header>
  );
};

export default MainHeader;
