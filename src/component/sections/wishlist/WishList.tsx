"use client";
import React, { useCallback, useEffect, useRef } from "react";
import HeadingSlideButtons from "@/component/global/HeadingSlideButtons";
import CollectionCard from "../AllCards/CollectionCard/CollectionCard";
import { useState } from "react";
import CustomFolderModal from "../window Popup/CustomFolderModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { useInView } from "react-intersection-observer";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import {
  selectIsBlocked,
  selectIsPrivate,
} from "@/libs/redux/selectors/selectors";
import { useAppSelector } from "@/libs/redux/hooks";
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Variants for each card
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const WishList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { ref: inViewRef, inView } = useInView();
  const { wishlistFolders, fetchData, wishlistItem } = useTheme();
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const isPrivate = useAppSelector(selectIsPrivate);
  const isBlocked = useAppSelector(selectIsBlocked);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (inViewRef) {
        (inViewRef as (instance: HTMLDivElement | null) => void)(node);
      }
    },
    [inViewRef]
  );
  useEffect(() => {
    fetchData({});
  }, []);
  useEffect(() => {
    if (
      inView &&
      wishlistFolders.pagination?.page !=
        wishlistFolders.pagination?.totalPages &&
      wishlistFolders.pagination?.page
    ) {
      fetchData({ page: wishlistFolders.pagination?.page + 1, limit: 11 });
    }
  }, [inView]);
  if (isPrivate || isBlocked) {
    return null;
  }

  return (
    <section className="w-full max-w-[1273px] mx-auto py-12 max-tab-sm:px-[16px] max-tab-lg:px-[30px] relative">
      <div className="mb-6">
        <HeadingSlideButtons
          heading="MY COLLECTIONS"
          isButtons={false}
          hideRightSide={true}
        />
      </div>

      <motion.div
        className="grid grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Create custom folder card */}
        <motion.div
          className="relative h-[180px] cursor-pointer rounded-[10px] overflow-hidden border-2 border-[#F4F4F4]"
          onClick={handleOpenModal}
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex justify-center items-center">
            <svg
              width="110"
              height="109"
              viewBox="0 0 110 109"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M54.6334 45.5067L54.75 45.5C55.2628 45.5 55.6855 45.886 55.7433 46.3834L55.75 46.5V53.5H62.75C63.2628 53.5 63.6855 53.886 63.7433 54.3834L63.75 54.5C63.75 55.0128 63.364 55.4355 62.8666 55.4933L62.75 55.5H55.75V62.5C55.75 63.0128 55.364 63.4355 54.8666 63.4933L54.75 63.5C54.2372 63.5 53.8145 63.114 53.7567 62.6166L53.75 62.5V55.5H46.75C46.2372 55.5 45.8145 55.114 45.7567 54.6166L45.75 54.5C45.75 53.9872 46.136 53.5645 46.6334 53.5067L46.75 53.5H53.75V46.5C53.75 45.9872 54.136 45.5645 54.6334 45.5067L54.75 45.5L54.6334 45.5067Z"
                fill="#212121"
                fillOpacity="0.2"
              />
            </svg>
          </div>
          <span className="font-bold font-supreme text-xl text-dark-blue-cm flex justify-center items-center leading-[100%] tracking-[-0.17px]">
            CREATE A CUSTOM FOLDER
          </span>
        </motion.div>

        {/* Wishlist cards */}
        <AnimatePresence>
          {wishlistFolders?.all && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <CollectionCard
                item={wishlistFolders.all}
                allItemCount={wishlistFolders.allItemCount}
              />
            </motion.div>
          )}
          {wishlistItem.length > 0 &&
            wishlistItem?.map(
              (item) =>
                item.note != "all" && (
                  <motion.div
                    key={`wishlist-${item.id}-${item.slug}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CollectionCard
                      item={item}
                      allItemCount={wishlistFolders.allItemCount}
                    />
                  </motion.div>
                )
            )}
        </AnimatePresence>

        {!wishlistFolders?.success &&
          wishlistFolders.items &&
          Array.from({ length: 8 }).map((_, idx) => (
            <motion.div
              key={idx}
              className="bg-light-100 animate-pulse h-[180px] cursor-pointer rounded-[10px]"
              variants={cardVariants}
            ></motion.div>
          ))}
      </motion.div>
      {wishlistFolders.pagination?.page !=
        wishlistFolders.pagination?.totalPages &&
        wishlistFolders.pagination?.page && (
          <div className="py-4" ref={setRefs}>
            <LoaderDots className="!bg-accent-100 !w-3 !h-3" />
          </div>
        )}
      <CustomFolderModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
};

export default WishList;
