import { ImageIcon } from "lucide-react";
import React from "react";

const ProductCardLoader = () => {
  return (
    <article
      className=" p-6 bg-light-300 rounded-lg relative max-tab-sm:p-0 max-tab-lg:p-3"
      role="status"
      aria-label={`Loading product`}
    >
      <div className="relative rounded-lg overflow-hidden">
        <div className="pb-[65%] flex relative  bg-neutral-200 animate-pulse w-full rounded-md">
          <ImageIcon className="opacity-50 absolute left-1/2 top-1/2 -translate-1/2" />
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="w-3/4 h-6 rounded bg-neutral-200 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 rounded bg-neutral-200 animate-pulse" />
          <div className="space-y-1">
            <div className="w-28 h-4 rounded bg-neutral-200 animate-pulse" />
            <div className="w-20 h-3 rounded bg-neutral-200 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1 mt-2">
          <div className="w-24 h-8 rounded bg-neutral-200 animate-pulse" />
          <div className="w-20 h-4 rounded bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </article>
  );
};

export default ProductCardLoader;
