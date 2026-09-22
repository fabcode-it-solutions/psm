"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Category, CreateCategoryData, UpdateCategoryData } from "@/services/categoryService";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { SEOMetaType, UploadFileType } from "@/types";
import { getSlug } from "@/utils/getSlug";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import SEOMeta from "@/component/dashboard/global/SEOMeta";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional(),
  parentId: z.number().optional(),
  featuredImage: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category;
  categories?: Category[];
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
  categories = [],
}: CategoryFormModalProps) {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);
  const { request, loading, error } = useApiRequest();
  const [featuredimage, setFeaturedImage] = useState<UploadFileType | null>(null);

  // Wrapper to handle type mismatch with UploadInput
  const handleSetFeaturedImage = useCallback((value: React.SetStateAction<UploadFileType>) => {
    if (typeof value === 'function') {
      setFeaturedImage((prev) => {
        // If prev is null, provide an empty object as fallback
        return value(prev || {});
      });
    } else {
      setFeaturedImage(value);
    }
  }, []);

  const defaultValues: Partial<CategoryFormData> = {
    name: "",
    slug: "",
    description: "",
    parentId: undefined,
    featuredImage: undefined,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const watchedValues = watch();

  // Load category data on edit
  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      reset({
        ...defaultValues,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || undefined,
        featuredImage: Number(category.featuredImage) || undefined,
        metaTitle: category?.seoMeta?.metaTitle || category.name,
        ogTitle: category?.seoMeta?.ogTitle || category.name,
        metaDescription: category?.seoMeta?.metaDescription || "",
        ogDescription: category?.seoMeta?.ogDescription || "",
      });

      // prefill featured image preview
      if (category.featuredImage) {
        setFeaturedImage({ id: Number(category.featuredImage) });
      }

      setIsGeneratingSlug(false);
    } else {
      reset(defaultValues);
      setFeaturedImage(null);
      setIsGeneratingSlug(true);
    }
  }, [isOpen, category]);

  // Auto-generate slug + SEO
  useEffect(() => {
    if (isGeneratingSlug && watchedValues.name && !category) {
      const generatedSlug = getSlug(watchedValues.name);
      setValue("slug", generatedSlug);
      setValue("metaTitle", watchedValues.name);
      setValue("ogTitle", watchedValues.name);
      setValue("metaDescription", watchedValues.description || "");
      setValue("ogDescription", watchedValues.description || "");
    }
  }, [
    watchedValues.name,
    watchedValues.description,
    isGeneratingSlug,
    setValue,
    category,
  ]);

  // Update featuredImage id into form
  useEffect(() => {
    if (featuredimage && !(featuredimage instanceof File) && 'id' in featuredimage && featuredimage.id) {
      setValue("featuredImage", featuredimage.id);
    }
  }, [featuredimage, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await request({
          url: "/api/admin/categories",
          options: {
            method: "PUT",
            body: { ...data, categoryId: category.id } as UpdateCategoryData,
          },
        });
      } else {
        await request({
          url: "/api/admin/categories",
          options: { method: "POST", body: data as CreateCategoryData },
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const parentCategories = categories
    .filter((cat) => cat.id !== category?.id)
    .map((item) => ({ value: String(item.id), label: item.name }));

  const modelName = (watchedValues.name || "unknown").replace(/ /g, "-");

  const handleSeoChange = useCallback(
    (field: keyof SEOMetaType) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(field, e.target.value),
    [setValue]
  );

  const handleSeoChangeValue = useCallback(
    (field: keyof SEOMetaType, value: string) => setValue(field, value),
    [setValue]
  );

  const handleSlugChange = useCallback(
    () =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsGeneratingSlug(false);
        setValue("slug", e.target.value);
      },
    [setValue]
  );

  return (
    <DialogPopup className="text-white"
      setShowCreateModal={onClose}
      open={isOpen}
      mode = "dark"
      heading={category ? "Edit Category" : "Create Category"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm mb-2">Name *</label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2 bg-dark-blue-cm text-light-100 border rounded-lg"
            placeholder="Enter category name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm mb-2">Slug *</label>
          <div className="relative">
            <input
              {...register("slug")}
              type="text"
              className="w-full px-3 py-2 bg-dark-blue-cm border rounded-lg"
              placeholder="category-slug"
              onChange={handleSlugChange()}
            />
            <button
              type="button"
              onClick={() => {
                setIsGeneratingSlug(true);
                if (watchedValues.name) {
                  setValue("slug", getSlug(watchedValues.name));
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent-100"
            >
              Auto
            </button>
          </div>

          {errors.slug && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.slug.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-2">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-3 py-2 bg-dark-blue-cm border rounded-lg resize-none"
            placeholder="Enter category description"
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm mb-2">Parent Category</label>
          <Dropdown
            options={parentCategories}
            onValueChange={(value) =>
              setValue("parentId", value ? parseInt(value) : undefined)
            }
            selectedText={watchedValues.parentId?.toString() || ""}
          />
        </div>

        {/* Featured Image */}
        <div>
          <UploadInput
            label="Featured Image"
            required={false}
            folder={`/models/${modelName}/image`}
            multipleSelect={false}
            setImageFile={handleSetFeaturedImage}
            preSelectedImageIds={
              featuredimage && !(featuredimage instanceof File) && 'id' in featuredimage && featuredimage.id
                ? [featuredimage.id]
                : []
            }
          />
        </div>

        <SEOMeta
          handleSeoChange={handleSeoChange}
          handleSeoChangeValue={handleSeoChangeValue}
          handleSlugChange={handleSlugChange}
          seoMeta={watchedValues as SEOMetaType}
          slug={watchedValues.slug || "slug"}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent-100 rounded-lg"
          >
            {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </DialogPopup>
  );
}