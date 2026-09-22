import { WishlistCategoryWithImage, WishlistItemWithDetails } from "@/types/wishlist.types";
import Link from "next/link";
import React from "react";
interface CollectionCardProps {
  item: WishlistCategoryWithImage | WishlistItemWithDetails;
  className?: string;
  allItemCount?: number;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  item,
  allItemCount,
  className = "",
}) => {
  const count = item.note == 'all' ? allItemCount || 0 :  Number(item.itemCount);
  return (
    <div>
      <div
        className={`relative  h-[180px] cursor-pointer rounded-[10px] overflow-hidden max-sm:px-[16px]  ${className}`}
        style={{
          backgroundImage: item.image?.url
            ? `url(${item.image?.url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#00000080] bg-opacity-50"></div>

        <div className="absolute top-16 left-6 right-4 text-[#FFFFFF] z-10 space-y-3 ">
          <h3 className="font-supreme font-bold text-xl text-[#FFFFFF] tracking-[0.2px] leading-[1.35] w-fit">
            {item?.name}
          </h3>

          <p className="font-bold font-supreme text-sm underline tracking-[0.14px] leading-[1.358] w-fit">
            {count > 0
              ? `${count} item${Number(item.itemCount) > 1 ? "s" : ""} Added`
              : "No item Added"}
          </p>
        </div>
        <Link
          href={item?.note == 'all' ? `/wishlist/collections/${item.slug}?type=all` : `/wishlist/collections/${item.slug}`}
          className="absolute z-10 top-0 left-0 w-full h-full"
        ></Link>
      </div>
    </div>
  );
};

export default CollectionCard;
