"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Breadcrumb } from "@/types";

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-40"
  >
    <path
      d="M4.46967 2.21967C4.17678 2.51256 4.17678 2.98744 4.46967 3.28033L7.18934 6L4.46967 8.71967C4.17678 9.01256 4.17678 9.48744 4.46967 9.78033C4.76256 10.0732 5.23744 10.0732 5.53033 9.78033L8.78033 6.53033C9.07322 6.23744 9.07322 5.76256 8.78033 5.46967L5.53033 2.21967C5.23744 1.92678 4.76256 1.92678 4.46967 2.21967Z"
      fill="#002029"
    />
  </svg>
);

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const Breadcrumb = ({ breadcrumb }: { breadcrumb?: Breadcrumb[] }) => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (breadcrumb) {
      const result = breadcrumb.map((item) => ({
        label: item.label,
        href: item.link,
      }));
      return result;
    }
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "marketplaces" && segments.length === 2) {
      const slug = segments[1];
      const fullLabel = slug
        .split("-")
        .map((w) => capitalize(decodeURIComponent(w)))
        .join(" ");

      return [
        { label: "Marketplaces", href: "/marketplaces" },
        { label: fullLabel, href: `/marketplaces/${slug}` },
      ];
    }
    if (segments[0] === "marketplaces" && segments.length > 2) {
      const base = [{ label: "Home", href: "/" }];
      const category = capitalize(decodeURIComponent(segments[1]));

      const productIndex = segments.indexOf("product");
      const listIndex = segments.indexOf("list");

      const productSlug =
        productIndex !== -1 && productIndex + 1 < segments.length
          ? segments[productIndex + 1]
          : "";

      const words = productSlug.split("-").filter(Boolean);
      const firstWord = capitalize(words[0] || "");

      const shortLabel =
        words.length >= 2
          ? `${firstWord} ${words.slice(1, 3).map(capitalize).join(" ")}`
          : firstWord;

      const crumbs = [
        ...base,
        { label: category, href: `/marketplaces/${segments[1]}` },
        { label: firstWord, href: "#" },
        { label: shortLabel.trim(), href: "#" },
      ];

      if (listIndex !== -1) {
        crumbs.push({
          label: "Listing",
          href: `/marketplaces/${segments.slice(1, listIndex + 2).join("/")}`,
        });
      }

      return crumbs;
    }

    const base = [{ label: "Home", href: "/" }];
    const pathArray = segments.map((segment, i) => ({
      label: decodeURIComponent(segment.replace(/-/g, " ")).replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      ),
      href: "/" + segments.slice(0, i + 1).join("/"),
    }));

    return [...base, ...pathArray];
  }, [pathname]);

  return (
    <div className="items-center gap-[10px] flex w-full max-tab-sm:hidden flex-wrap">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronIcon />}
          <Link
            href={crumb.href || ""}
            className={`cursor-pointer text-[#002029] ${
              index !== breadcrumbs.length - 1 ? "opacity-40" : ""
            } max-tab-md:text-sm whitespace-nowrap font-sofia-sans font-normal text-base leading-[1.187] tracking-[0.64px] capitalize`}
          >
            {crumb.label}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
