/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { cn } from "@sglara/cn";
import { usePathname } from "next/navigation";
import { Popover } from "radix-ui";
import React, { useEffect, useState } from "react";
import BottomDrawer from "./BottomDrawer";
import { set } from "zod";
import { useIsMobile } from "@/utils/useIsMobile";

type TooltipPopupType = {
  children: React.ReactNode;
  icon: React.ReactNode;
  headerWrapperStyle?: string;
  heading: string;
  content?: React.ReactNode;
  opened?: boolean;
};

const TooltipPopup = ({
  children,
  icon,
  headerWrapperStyle,
  heading,
  content,
  opened,
}: TooltipPopupType) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState(false);
  const [animate, setAnimate] = useState(false);

  const isMobile = useIsMobile();
  useEffect(() => {
    if (opened == false) {
      setOpen(true);
    }
  }, [opened]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!change) {
      setAnimate(false);
      setTimeout(() => {
        setOpen(false);
        document.body.style.overflow = "";
        document.body.style.paddingRight = "0px";
      }, 250);
      return;
    }
    setOpen(true);
    setTimeout(() => {
      document.body.style.overflow = "hidden";
      if (!isMobile) {
        document.body.style.paddingRight = "15px";
      }
      setAnimate(true);
    }, 250);
  }, [change]);

  return (
    <>
      {!isMobile && (
        <Popover.Root open={open} onOpenChange={(e) => setChange(e)}>
          <Popover.Trigger
            className={cn(open ? "z-[991] relative" : "", " max-tab-sm:hidden")}
          >
            {icon}
          </Popover.Trigger>
          <Popover.Content
            className="max-w-[500px] min-w-[500px] w-full bg-transparent z-[9999] pt-2 max-tab-sm:!hidden"
            align="end"
            alignOffset={-24}
          >
            <div
              className={`${
                animate
                  ? "opacity-100 translate-none"
                  : " opacity-0 translate-y-4"
              } transition-all duration-300 ease-in-out`}
            >
              <div className="flex justify-end pr-5 -mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="35"
                  viewBox="0 0 40 35"
                  fill="none"
                  className="block"
                >
                  <path d="M20 0L39.9186 34.125H0.0814152L20 0Z" fill="white" />
                </svg>
              </div>
              <div className={`rounded-[10px] overflow-hidden bg-light-300`}>
                <div
                  className={cn(
                    headerWrapperStyle,
                    "py-[27px] px-10 bg-white flex flex-col gap-2.5"
                  )}
                >
                  {heading && (
                    <div className="popover-heading text-black font-supreme text-[26px] leading-[1.346] font-bold capitalize">
                      {heading}
                    </div>
                  )}
                  {content && (
                    <div className="text-black text-sm font-normal font-supreme">
                      {content}
                    </div>
                  )}
                </div>

                <div className="overflow-auto max-h-[calc(100dvh-280px)] px-10 py-5">
                  {children}
                </div>
              </div>
            </div>
          </Popover.Content>
          {open && (
            <div
              className={` ${
                animate
                  ? "opacity-100 backdrop-blur-sm"
                  : " opacity-0 backdrop-blur-[0px]"
              } transition-all duration-300 ease-in-out max-tab-sm:hidden fixed top-0 left-0 w-full h-full bg-dark-blue-cm/10  z-[99]`}
            ></div>
          )}
        </Popover.Root>
      )}

      {isMobile && (
        <span className="hidden max-tab-sm:block" onClick={() => setOpen(true)}>
          {icon}
        </span>
      )}
      {isMobile && (
        <BottomDrawer
          heading={heading}
          onClose={() => setOpen(false)}
          open={open}
          headerWrapperStyle=""
          content={content}
        >
          {children}
        </BottomDrawer>
      )}
    </>
  );
};

export default TooltipPopup;
