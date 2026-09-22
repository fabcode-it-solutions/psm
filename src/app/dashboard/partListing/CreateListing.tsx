"use client";
import PageHeader from "@/component/dashboard/PageHeader";
import Media from "@/component/dashboard/parts/Media";
import { FormField } from "@/component/ui/dashboard/FormField";
import RichTextEditor from "@/component/ui/RichTextEditor/RichTextEditor";
import { updatePartField } from "@/libs/redux/slices/partsSlice";
import { RootState } from "@/libs/redux/store";
import { PartResponse } from "@/types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
interface ActiveSection {
  key:
    | "basic"
    | "details"
    | "specifications"
    | "pricing"
    | "shipping"
    | "media"
    | "labels"
    | "seo"
    | "metafields";
  label: string;
  description?: string;
  section?: React.ReactNode;
  isAccordion?: boolean;
}
const CreateListing = ({ partData }: { partData: PartResponse }) => {
  const dispatch = useDispatch();
  const part = partData.part;

  useEffect(() => {
    dispatch(updatePartField({ key: "title", value: part.title }));
    dispatch(updatePartField({ key: "description", value: part.description }));
    dispatch(updatePartField({ key: "media", value: partData.media }));
  }, [partData]);
  const sections: ActiveSection[] = [
    {
      key: "basic",
      label: "Information",
      section: <PartBasic />,
    },
    { key: "media", label: "Media", description: "Images", section: <Media /> },
    {
      key: "specifications",
      label: "Available Specifications",
      description: "Select Product Specifications",
      section: <Media />,
    },
  ];
  return (
    <div>
      {part.title && (
        <PageHeader
          heading={`Master part: ${part.title}`}
          describe={`Create listing of: ${part.title}`}
        />
      )}
      <div className="mt-6">
        {sections.map((item) => (
          <div
            className="space-y-6 p-4 mb-6 bg-gray-5/5 rounded-lg border border-gray-5/20 relative"
            key={item.key}
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
            <div className={`mt-4`}>{item.section}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateListing;

const PartBasic = () => {
  const part = useSelector((state: RootState) => state.part.part);
  return (
    <div className="space-y-4">
      <FormField
        label="Part Title"
        required
        helpText="Enter a descriptive title for this part"
        name="title"
        type="text"
        value={part?.title || ""}
        //   error={{ message: errors?.title }}
        //   onChange={handleInputChange("title")}
        placeholder="Enter part title..."
      />
      <RichTextEditor
        label="Description"
        value={part?.description || ""}
        placeholder="Enter part description, specifications, and features..."
        helpText="Provide detailed information about the listing"
        // onChange={(value) => {
        //   dispatch(updatePartField({ key: "description", value: value }));
        //   const text = document.querySelector(
        //     ".part-description .jodit-wysiwyg"
        //   );
        //   if (text) {
        //     dispatch(
        //       updateSeoFields({
        //         key: "metaDescription",
        //         value: text.textContent.slice(0, 160),
        //       })
        //     );
        //     dispatch(
        //       updateSeoFields({
        //         key: "ogDescription",
        //         value: text.textContent.slice(0, 160),
        //       })
        //     );
        //   }
        // }}
      />
    </div>
  );
};
