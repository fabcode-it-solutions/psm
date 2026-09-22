import IconBookmarkEmpty from "@/assets/icons/IconBookmarkEmpty";
import IconBookmarkRemove from "@/assets/icons/IconBookmarkRemove";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@sglara/cn";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { toast } from "react-hot-toast";

const Bookmark = ({
  className,
  id,
  isMarked,
  entityType = "part",
  addicon,
}: {
  className?: string;
  id?: number;
  isMarked: boolean;
  entityType?: string;
  addicon?: React.ReactNode;
}) => {
  const userId = useSelector((state: RootState) => state.user.user?.user.id);
  const { setOpenWishlist, setWishlistItems, checkCategories } = useTheme();
  const [marked, setMarked] = useState(false);
  const handleBookmark = async () => {
    if (!userId) {
      toast.error("Please login to add to wishlist");
      return;
    }
    if (id && entityType) {
      await checkCategories({
        entityType: entityType,
        entityId: id,
      });
    }
    setOpenWishlist(true);
    if (entityType && id) {
      setWishlistItems({
        entityId: id,
        userId,
        entityType,
      });
    }
  };
  useEffect(() => {
    setMarked(isMarked);
  }, [isMarked]);
  return (
    <button
      type="button"
      onClick={handleBookmark}
      className={cn(
        "w-11 h-11 cursor-pointer flex justify-center items-center rounded-[20px] bg-dark-blue-cm/80",
        className
      )}
    >
      {marked ? (
        <IconBookmarkRemove className="fill-accent-100" />
      ) : addicon ? (
        addicon
      ) : (
        <IconBookmarkEmpty className="fill-accent-100" />
      )}
    </button>
  );
};

export default Bookmark;
