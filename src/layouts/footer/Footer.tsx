"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import IconInstagram from "@/assets/icons/IconInstagram";
import IconFacebookTag from "@/assets/icons/IconFacebookTag";
import IconYoutube from "@/assets/icons/IconYoutube";
import IconLinkedin from "@/assets/icons/IconLinkedin";
import CurrencyDropdown from "@/component/ui/CurrencyDropdown/CurrencyDropdown";

const footerSections = [
  {
    title: "ABOUT US",
    links: [
      { label: "About", href: "#about" },
      { label: "Support", href: "#support" },
      { label: "Verification", href: "#verification" },
      { label: "Contact", href: "#contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "BUY & SELL",
    links: [
      { label: "Sell", href: "#sell" },
      { label: "Browse", href: "#browse" },
      { label: "Part Request", href: "#part-request" },
      { label: "Returns", href: "/returns" },
      { label: "Refunds", href: "/refunds" },
    ],
  },
  {
    title: "ACCOUNT",
    links: [
      { label: "Sign Up", href: "/accounts/sign-up" },
      { label: "Create An Account", href: "/accounts/sign-up" },
    ],
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: <IconInstagram stroke="#FFFFFF" className="w-[16px] h-[16px]" />,
    href: "#",
  },
  {
    name: "Facebook",
    icon: <IconFacebookTag stroke="#FFFFFF" className="w-[16px] h-[16px]" />,
    href: "#",
  },
  {
    name: "Youtube",
    icon: <IconYoutube stroke="#FFFFFF" className="w-[16px] h-[16px]" />,
    href: "#",
  },
  {
    name: "Linkedin",
    icon: <IconLinkedin stroke="#FFFFFF" className="w-[16px] h-[16px]" />,
    href: "#",
  },
];

const Footer = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <footer className="relative w-full h-full bg-[#002029] text-white py-12  font-supreme">
      <div className="bg-[#002029] max-w-[1320px] w-full mx-auto px-6">
        <div className="flex justify-between flex-col md:flex-row gap-8">
          <div className="max-tab-sm:flex max-tab-sm:justify-center">
            <Image
              src="/assets/images/footerlogo.png"
              alt="Footer Logo"
              width={313}
              height={144}
              className="max-tab-sm:w-[250px] max-tab-sm:h-[100px] object-contain max-tab-lg:w-[160px] max-tab-lg:h-[90px]"
            />
          </div>

          <div className="hidden md:flex gap-[30px] flex-wrap max-tab-lg:gap-[13px]">
            {footerSections.map((section, index) => (
              <div key={index} className="min-w-[165px]">
                <h3 className="mb-[12px] font-bold text-lg leading-[32px] tracking-[1px]">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-[12px] font-normal">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="font-normal text-lg leading-[32px] tracking-[1px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="md:hidden w-full">
            {footerSections.map((section, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-b border-white/20 py-2 w-full"
                >
                  <button
                    className="flex justify-between w-full text-left font-bold text-lg leading-[32px] tracking-[1px]"
                    onClick={() => toggleSection(index)}
                  >
                    {section.title}
                    <span className="text-xl">{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen && (
                    <ul className="mt-2 flex flex-col gap-[10px] pl-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className="text-base font-normal tracking-[1px] leading-[28px]"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex pt-[15px] flex-col gap-[16px] max-w-[446px] w-full">
          <span className="text-base tracking-[0.6px] leading-[1.4] font-normal">
            Find us on,
          </span>
          <ul className="flex max-mb-md:flex-col flex-row text-base gap-[20px] px-4 md:px-0">
            {socialLinks.map((link, index) => (
              <li key={index} className="flex items-center gap-3">
                {link.icon}
                <a
                  href={link.href}
                  className="text-base tracking-[0.6%] leading-[1.4]"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col md:flex-row justify-between pt-[37px] gap-6">
          <span className="cursor-pointer text-base leading-[1.32] opacity-[0.72] font-normal tracking-[0.62px] flex flex-wrap items-center">
            <Link href="/terms-conditions" className="">
              Terms & Conditions
            </Link>
            <span className="px-[12px]">|</span>
            <Link href="/privacy" className="">
              Privacy
            </Link>
          </span>

          <CurrencyDropdown />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
