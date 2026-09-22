/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Save } from "lucide-react";
import PageHeader from "@/component/dashboard/PageHeader";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hooks";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import {
  Parts,
  setPart,
  updateErrors,
  updatePartField,
  updateSeoFields,
} from "@/libs/redux/slices/partsSlice";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { SEOMetaType } from "@/types";
import { getSlug } from "@/utils/getSlug";
import { ErrorsList } from "@/utils/defaults";
import PartBasic from "../PartBasic";
import Media from "../Media";
import Pricing from "../Pricing";
import Variants from "../Variants";
import AdditionalDetails from "../AdditionalDetails";
import Metafields from "../Metafields";
import SEOMeta from "../../global/SEOMeta";
import { ActiveSection } from "..";

const EditPart: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { id } = useParams();
  const userId = useAppSelector((state) => state.user.user?.user.id);
  const part = useAppSelector((state) => state.part.part);
  const seoMeta = useAppSelector((state) => state.part.part?.seoMetadata);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch part data on mount
  useEffect(() => {
    const fetchPart = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        dispatch(setloading("Loading Part..."));

        const res = await fetch(`/api/parts/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch part');
        }
        
        const response = await res.json();

        if (response?.data) {
          const { 
            part: partInfo, 
            categories, 
            media, 
            variants, 
            options,
            additionalDetails,
            metafields,
            seo 
          } = response.data;

          // Transform categories for TagSelect
          const transformedCategories = categories?.map((cat: any) => ({
            label: cat.name,
            value: String(cat.id),
          })) || [];

          // Transform metafields
          const transformedMetafields = metafields?.map((mf: any) => ({
            metafieldDefinitionId: mf.definitionId,
            value: mf.value,
          })) || [];

          // Transform options
          const transformedOptions = options?.map((opt: any) => ({
            id: String(opt.id),
            name: opt.name,
            values: opt.values?.map((v: any) => v.value) || [],
          })) || [];

          // Transform media
          const transformedMedia = media?.map((m: any) => ({
            id: m.id,
            order: m.order,
            url: m.url,
            alt: m.alt,
          })) || [];

          // Handle tags - ensure it's an array of strings
          const tags = Array.isArray(partInfo.tags) 
            ? partInfo.tags 
            : [];

          const partState: Parts = {
            title: partInfo.title,
            slug: partInfo.slug,
            description: partInfo.description,
            status: partInfo.status,
            listed: partInfo.listed,
            brandId: partInfo.brandId,
            modelId: partInfo.modelId,
            typeId: partInfo.typeId,
            manufacturerId: partInfo.manufacturerId,
            brand: partInfo.brand,
            model: partInfo.model,
            type: partInfo.type,
            manufacturer: partInfo.manufacturer,
            categories: transformedCategories,
            categoryIds: categories?.map((cat: any) => cat.id) || [],
            tags: tags,
            media: transformedMedia,
            additionalDetails: additionalDetails || [],
            options: transformedOptions,
            variants: variants || [],
            proMetafields: transformedMetafields,
            seoMetadata: seo || {},
          };

          dispatch(setPart(partState));
        }
      } catch (error) {
        console.error("Failed to fetch part data:", error);
        toast.error("Failed to load part data");
      } finally {
        dispatch(setloading(false));
        setIsLoading(false);
      }
    };

    fetchPart();
  }, [id]); // ✅ Only id in dependencies, dispatch is stable

  const handleSeoChange = useCallback(
    (field: keyof SEOMetaType) => 
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        dispatch(updateSeoFields({ key: field, value: e.target.value })),
    [dispatch]
  );

  const handleSeoChangeValue = useCallback(
    (field: keyof SEOMetaType, value: string) => {
      dispatch(updateSeoFields({ key: field, value }));
    },
    [dispatch]
  );

  const handleInputChange = useCallback(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      dispatch(updatePartField({ key: "slug", value: getSlug(e.target.value) })),
    [dispatch]
  );

  const sections: ActiveSection[] = useMemo(
    () => [
      { 
        key: "basic" as const, 
        label: "Information", 
        section: <PartBasic /> 
      },
      { 
        key: "media" as const, 
        label: "Media", 
        description: "Images", 
        section: <Media /> 
      },
      ...(part?.variants && part.variants.length === 0
        ? [{
            key: "pricing" as const,
            label: "Pricing",
            description: "Price, cost, inventory",
            section: <Pricing />
          }]
        : []),
      {
        key: "variants" as const,
        label: "Variants & Options",
        description: "Product options and variants",
        section: <Variants />
      },
      {
        key: "details" as const,
        label: "Additional Details",
        description: "Custom content sections",
        section: <AdditionalDetails />
      },
      {
        key: "metafields" as const,
        label: "Metafields",
        description: "Custom fields and properties",
        section: <Metafields />
      },
      {
        key: "seo" as const,
        label: "SEO Meta",
        description: "SEO and social media meta",
        isAccordion: true,
        section: (
          <SEOMeta
            handleSeoChange={handleSeoChange}
            handleSlugChange={handleInputChange}
            handleSeoChangeValue={handleSeoChangeValue}
            seoMeta={seoMeta}
            slug={part?.slug || ""}
          />
        )
      },
    ],
    [part?.variants?.length, seoMeta, part?.slug, handleSeoChange, handleInputChange, handleSeoChangeValue]
  );

  const handleSubmit = async () => {
    dispatch(setloading("Updating Part..."));
    let isValid = true;

    // Validate required fields
    ErrorsList.forEach((item) => {
      if (!part?.[item.key as keyof Parts]) {
        dispatch(updateErrors({ key: item.key, value: item.label }));
        isValid = false;
      }
    });

    // Validate pricing
    if (!part?.variants?.length) {
      if (!part?.defaultVariant?.price) {
        dispatch(updateErrors({ key: "price", value: "Price is required." }));
        isValid = false;
      }
    }

    // Validate options
    if (part?.options && part?.options?.length) {
      part?.options.forEach((item, index) => {
        if (!item.name) {
          dispatch(
            updateErrors({
              key:
                index === 0
                  ? "option1label"
                  : index === 1
                  ? "option2label"
                  : "option3label",
              value: "Option name is required.",
            })
          );
          isValid = false;
        }

        if (item.values.length === 0) {
          dispatch(
            updateErrors({
              key:
                index === 0
                  ? "option1Values"
                  : index === 1
                  ? "option2Values"
                  : "option3Values",
              value: "Please add at least one value.",
            })
          );
          isValid = false;
        }
      });
    }

    // Validate additional details
    if (part?.additionalDetails && part?.additionalDetails?.length) {
      const headings = part?.additionalDetails.map((item, index) => {
        return !item.heading ? index : -1;
      });
      const contents = part?.additionalDetails.map((item, index) => {
        return !item.content ? index : -1;
      });

      const hasEmptyHeadings = part?.additionalDetails.some(
        (item) => !item.heading
      );
      const hasEmptyContent = part?.additionalDetails.some(
        (item) => !item.content
      );

      if (hasEmptyHeadings) {
        dispatch(
          updateErrors({
            key: "additionalfieldsHeadings",
            value: headings,
          })
        );
        isValid = false;
      }

      if (hasEmptyContent) {
        dispatch(
          updateErrors({
            key: "additionalfieldsContent",
            value: contents,
          })
        );
        isValid = false;
      }
    }

    if (!isValid) {
      dispatch(setloading(false));
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      const res = await fetch(`/api/parts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...part, userId }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message || "Part updated successfully");
        router.push("/dashboard/parts");
      } else {
        toast.error(result.error || "Failed to update part");
      }
    } catch (err) {
      console.error("Error updating part:", err);
      toast.error("Something went wrong");
    } finally {
      dispatch(setloading(false));
    }
  };

  // ✅ REMOVED THE PROBLEMATIC resetPart CLEANUP
  // No longer needed - Redux state will persist until explicitly cleared

  // Show loading state
  if (isLoading || !part?.title) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-100"></div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100">
      <div className="mx-auto">
        <div className="bg-dark-100 py-2 z-10">
          <PageHeader
            heading={`Edit Part: ${part?.title || ""}`}
            describe="Update part details"
            button={
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> Update Part
              </button>
            }
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6 mt-6"
        >
          {sections.map((item) => (
            <div
              key={item.key}
              className="space-y-6 p-4 mb-6 bg-gray-5/5 rounded-lg border border-gray-5/20 relative"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-light-100 font-sofia-sans">
                    {item.label}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-4 mt-1 font-sofia-sans">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">{item.section}</div>
            </div>
          ))}
        </form>

        <div className="flex justify-end mt-6 mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Update Part
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPart;