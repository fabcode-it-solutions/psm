"use client";
import React, { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import UploadInputMain from "@/component/ui/Upload/UploadInput";
import { UploadFileType } from "@/types";
import Button from "@/component/ui/Button/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWishlistActions } from "@/hooks/useWishlistActions";
import { useTheme } from "@/providers/ThemeProvider";

const wishlistCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500).optional(),
});

type WishlistCategoryForm = z.infer<typeof wishlistCategorySchema>;

interface CustomFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const CustomFolderModal: React.FC<CustomFolderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [image, setImage] = useState<UploadFileType>({});
  const { fetchData } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const { createWishlistCategory } = useWishlistActions();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistCategoryForm>({
    resolver: zodResolver(wishlistCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: WishlistCategoryForm) => {
    if (loading) {
      return null;
    }
    setLoading(true);
    await createWishlistCategory({
      name: data.name,
      description: data.description,
      imageMediaId: image.id || 0,
    });
    await fetchData({ page: 0, limit: 11 });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-[506px] h-auto max-h-[90vh] p-4 sm:p-6 overflow-y-auto mx-4 relative border-[#FFFFFF] border-[1.5px]"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                  fill="#CDD2C8"
                />
              </svg>
            </button>

            <h2 className="text-xl mb-4 font-supreme text-dark-blue-cm font-bold">
              Add Folder Info:
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Upload Image */}
              <div className="flex justify-between items-start gap-1">
                <label className="block font-medium font-supreme text-dark-blue-cm text-base">
                  Upload Image
                </label>
                <div className="max-w-[342px] w-full">
                  <UploadInput
                    required={true}
                    setImageFile={setImage}
                    trigger={<UploadInputMain />}
                    label="Add Attachment"
                    mode="accounts"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="flex justify-between items-start gap-1">
                <label className="block font-medium font-supreme text-dark-blue-cm text-base">
                  Name
                </label>
                <div className="max-w-[342px] w-full">
                  <input
                    type="text"
                    {...register("name")}
                    className="rounded-[12px] p-2 w-full h-[48px] bg-[#F9F9F9]"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex justify-between items-start gap-1">
                <label className="block font-medium font-supreme text-dark-blue-cm text-base">
                  Description:
                </label>
                <div className="max-w-[342px] w-full">
                  <textarea
                    {...register("description")}
                    className="rounded-[12px] p-2 w-full h-[144px] bg-[#F9F9F9]"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button type={loading ? "button" : "submit"}>
                  {loading ? "Creating..." : "Create Wishlist Category"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomFolderModal;
