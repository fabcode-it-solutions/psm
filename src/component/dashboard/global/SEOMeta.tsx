/* eslint-disable react-hooks/exhaustive-deps */
import IconEdit from "@/assets/icons/IconEdit";
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { FormField } from "@/component/ui/dashboard/FormField";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import { SEOMetaType, UploadFileType } from "@/types";
import React, { useCallback, useEffect, useState } from "react";

const SEOMeta = ({
  handleSeoChange,
  handleSlugChange,
  handleSeoChangeValue,
  seoMeta,
  slug,
}: {
  handleSeoChange: (
    field: keyof SEOMetaType,
    url?: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSlugChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSeoChangeValue?: (field: keyof SEOMetaType, value: string) => void;
  slug: string;
  seoMeta: SEOMetaType | undefined;
}) => {
  const [image, setImage] = useState<UploadFileType>({});
  const [editSeo, setEditSeo] = useState(false);
  useEffect(() => {
    if (image.url && handleSeoChangeValue && image.id) {
      handleSeoChangeValue("ogImage", image.url);
    }
  }, [image, handleSeoChangeValue]);

  const handleDescription = useCallback(
    (field: keyof SEOMetaType) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > 160) {
          return;
        }
        if (handleSeoChangeValue) {
          handleSeoChangeValue(field, value);
        }
      },
    [handleSeoChange]
  );
  return (
    <div className="space-y-2">
      <div className="">
        <div
          className={` rounded-lg border ${
            editSeo
              ? "border-accent-100 bg-accent-100/20"
              : "border-gray-5/20 bg-gray-5/5"
          }  p-4`}
        >
          <h5 className="text-sm font-medium text-light-100 font-sofia-sans mb-2 flex items-center justify-between">
            Seo Preview
            <button
              className="bg-accent-100 w-7 h-7 rounded-full flex items-center justify-center"
              type="button"
              onClick={() => setEditSeo((prev) => !prev)}
            >
              <IconEdit fill="#fff" />
            </button>
          </h5>
          <div className="space-y-2">
            <p className="text-sm text-accent-100 font-sofia-sans">
              {seoMeta?.metaTitle || "Part Title"}
            </p>
            <p className="text-xs text-gray-4 font-sofia-sans">
              {seoMeta?.metaDescription ||
                "Part description will appear here..."}
            </p>
          </div>
        </div>
      </div>
      {editSeo && (
        <DialogPopup
          heading="Search Engine Optimization"
          setShowCreateModal={setEditSeo}
          open={editSeo}
        >
          <div>
            <div className="space-y-4">
              <FormField
                label="Meta Title"
                name="metaTitle"
                type="text"
                value={seoMeta?.metaTitle || ""}
                onChange={handleSeoChange("metaTitle")}
                placeholder="Enter SEO title (recommended: 50-60 characters)"
                helpText={`${seoMeta?.metaTitle?.length}/60 characters`}
              />

              <TextArea
                label="Meta Description"
                name="metaDescription"
                value={seoMeta?.metaDescription || ""}
                onChange={handleDescription("metaDescription")}
                placeholder="Enter SEO description (recommended: 150-160 characters)"
                rows={3}
                helpText={`${
                  seoMeta?.metaDescription?.length || 0
                }/160 characters`}
              />

              <FormField
                label="Meta Keywords"
                name="metaKeywords"
                type="text"
                value={seoMeta?.metaKeywords || ""}
                onChange={handleSeoChange("metaKeywords")}
                placeholder="keyword1, keyword2, keyword3"
                helpText="Separate keywords with commas"
              />
            </div>
          </div>

          <div className="border-t border-gray-5/20 pt-6">
            <h4 className="text-md font-semibold text-light-100 font-sofia-sans mb-4">
              Social Media (Open Graph)
            </h4>

            <div className="space-y-4">
              <FormField
                label="OG Title"
                name="ogTitle"
                type="text"
                value={seoMeta?.ogTitle || ""}
                onChange={handleSeoChange("ogTitle")}
                placeholder="Title for social media sharing"
              />

              <TextArea
                label="OG Description"
                name="ogDescription"
                value={seoMeta?.ogDescription || ""}
                onChange={handleDescription("ogDescription")}
                placeholder="Description for social media sharing"
                helpText={`${
                  seoMeta?.ogDescription?.length || 0
                }/160 characters`}
                rows={3}
              />
              <UploadInput
                label="OG Image"
                required={false}
                folder={`/seo-metadata/image`}
                multipleSelect={false}
                previewImage={seoMeta?.ogImage}
                setImageFile={setImage}
                preSelectedImageIds={image?.id ? [image.id] : []}
                onImagesSelected={(imageIds) => {
                
                }}
              />

              <FormField
                label="URL Slug"
                required
                helpText="URL-friendly version of the title (auto-generated)"
                name="slug"
                type="text"
                value={slug || ""}
                onChange={handleSlugChange("slug")}
                placeholder="part-url-slug"
              />
            </div>
            <div className="flex justify-end mt-6">
              <DashboardButton
                buttonText="Done"
                onClick={() => setEditSeo(false)}
              />
            </div>
          </div>
        </DialogPopup>
      )}
    </div>
  );
};

export default SEOMeta;
