/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import CustomFolderModal from "../window Popup/CustomFolderModal";
import Button from "@/component/ui/Button/Button";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import IconRightArrow from "@/assets/icons/IconRightArrow";
import { useTheme } from "@/providers/ThemeProvider";
import {
  PAGINATION_LIMIT,
} from "@/types/wishlist.types";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUserId } from "@/libs/redux/selectors/selectors";
import { WishlistItem } from "./WishlistItem";
import { useInfiniteWishlist, useWishlistOperations } from "@/hooks/useWishlistActions";

// Main Component
const CreateWishlist = React.memo(() => {
  const userId = useAppSelector(selectUserId);
  const pathname = usePathname();
  const {
    wishlistFolders,
    openWishlist,
    setOpenWishlist,
    includedCategories,
    fetchData,
  } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Custom hooks
  const { wishlistItems } = useInfiniteWishlist(wishlistFolders);
  const {
    addToFolder,
    removeFromFolder,
    addLoading,
    removeLoading,
    activeIndex,
  } = useWishlistOperations();
  // Intersection observer for infinite scroll
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "50px",
  });

  // Refs
  const ref = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (inViewRef) {
        (inViewRef as (instance: HTMLDivElement | null) => void)(node);
      }
    },
    [inViewRef]
  );

  // Initialize data on mount
  useEffect(() => {
    if (userId) {
      fetchData({});
    }
  }, [userId]);

  // Handle infinite scroll
  useEffect(() => {
    if (
      inView &&
      !isLoadingMore &&
      wishlistFolders.pagination?.page !==
        wishlistFolders.pagination?.totalPages &&
      wishlistFolders.pagination?.page
    ) {
      setIsLoadingMore(true);
      fetchData({
        page: wishlistFolders.pagination.page + 1,
        limit: PAGINATION_LIMIT,
      }).finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [inView, isLoadingMore, wishlistFolders.pagination]);

  useEffect(() => {
    setIsModalOpen(false);
    setOpenWishlist(false);
  }, [pathname, setOpenWishlist]);

  // Memoized handlers
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Memoized included categories map for better performance
  const includedCategoriesMap = useMemo(() => {
    const map = new Map();
    includedCategories.forEach((category) => {
      map.set(category.categoryId, category);
    });
    return map;
  }, [includedCategories]);

  // Check if should show loading indicator
  const shouldShowLoadMore = useMemo(
    () =>
      wishlistFolders.pagination?.page !==
        wishlistFolders.pagination?.totalPages &&
      wishlistFolders.pagination?.page,
    [wishlistFolders.pagination]
  );

  // Show empty state
  const showEmptyState = wishlistItems.length === 0 && !isLoadingMore;

  if (isModalOpen) {
    return (
      <CustomFolderModal isOpen={isModalOpen} onClose={handleCloseModal} />
    );
  }

  return (
    <DialogPopup
      heading="Add to Wishlist"
      open={openWishlist}
      setShowCreateModal={setOpenWishlist}
      mode="light"
    >
      <div>
        {wishlistItems.map((item, index) => {
          const includeItem = includedCategoriesMap.get(item.id);

          return (
            <WishlistItem
              key={item.id}
              item={item}
              index={index}
              includeItem={includeItem}
              onAdd={addToFolder}
              onRemove={removeFromFolder}
              isAddLoading={addLoading}
              isRemoveLoading={removeLoading}
              activeIndex={activeIndex}
            />
          );
        })}

        {shouldShowLoadMore && (
          <div className="py-4" ref={setRefs}>
            <LoaderDots className="!bg-accent-100 !w-3 !h-3" />
          </div>
        )}
      </div>

      {showEmptyState && (
        <div className="text-center py-12 rounded-md bg-light-300 border border-light-100">
          No record found.
        </div>
      )}

      <div className="flex items-center flex-col gap-3 mt-4">
        <Button
          className="!flex items-center gap-2"
          type="button"
          onClick={handleOpenModal}
          aria-label="Create a custom folder"
        >
          CREATE A CUSTOM FOLDER
        </Button>

        <div className="text-sm text-dark-blue-cm">Or</div>

        <Link
          href="/wishlist"
          className="flex items-center gap-2 uppercase text-sm text-dark-blue-cm hover:underline focus:underline"
        >
          View All Items <IconRightArrow />
        </Link>
      </div>
    </DialogPopup>
  );
});

CreateWishlist.displayName = "CreateWishlist";

export default CreateWishlist;
