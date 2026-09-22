import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "@/component/ui/dashboard/FormField";
import RichTextEditor from "@/component/ui/RichTextEditor/RichTextEditor";
import {
  addAdditionalDetail,
  removeAdditionalDetail,
  updateAdditionalDetailField,
  updateErrors,
  setAdditionalDetails,
} from "@/libs/redux/slices/partsSlice";
import { RootState } from "@/libs/redux/store";
import { AdditionalDetail } from "@/types/parts.types";
import { GripVertical, Plus, Trash } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSwapy, Swapy } from "swapy";

const AdditionalDetails = () => {
  const dispatch = useDispatch();
  const errors = useSelector((state: RootState) => state.part.errors);
  const additionalDetails = useSelector(
    (state: RootState) => state.part.part?.additionalDetails || []
  );

  const [accordion, setAccordion] = useState<number | null>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const addDetail = useCallback(() => {
    if (additionalDetails.length >= 10) {
      toast.error("You have added maximum number of Sections");
      return;
    }
    const newDetail: AdditionalDetail = {
      heading: "",
      content: "",
      displayOrder: additionalDetails.length + 1,
    };
    dispatch(addAdditionalDetail(newDetail));
    setAccordion(additionalDetails.length);

    setTimeout(() => {
      const el = sectionRefs.current[additionalDetails.length];
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top - 150,
          behavior: "smooth",
        });
      }
    }, 300);
  }, [additionalDetails, dispatch]);

  const removeDetail = useCallback(
    (index: number) => {
      dispatch(removeAdditionalDetail(index));
      setAccordion(null);
    },
    [dispatch]
  );

  const updateDetail = useCallback(
    (index: number, field: keyof AdditionalDetail, value: string) => {
      // Update errors
      if (field === "content") {
        const contentErrors =
          errors?.additionalfieldsContent?.filter((i) => i !== index) || [];
        if (!value) contentErrors.push(index);
        dispatch(
          updateErrors({ key: "additionalfieldsContent", value: contentErrors })
        );
      }

      if (field === "heading") {
        const headingErrors =
          errors?.additionalfieldsHeadings?.filter((i) => i !== index) || [];
        if (!value) headingErrors.push(index);
        dispatch(
          updateErrors({
            key: "additionalfieldsHeadings",
            value: headingErrors,
          })
        );
      }

      dispatch(updateAdditionalDetailField({ index, key: field, value }));
    },
    [dispatch, errors]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    swapyRef.current?.destroy();
    swapyRef.current = createSwapy(containerRef.current, { dragAxis: "y" });
    swapyRef.current.onSwapStart(() => {
      setAccordion(null);
    });
    swapyRef.current.onSwapEnd((event) => {
      if (!event.hasChanged) return;

      const orderMap = event.slotItemMap.asObject; // old index => new index
      const reordered = Object.keys(orderMap)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => additionalDetails[Number(orderMap[key])]!)
        .map((item, idx) => ({ ...item, displayOrder: idx + 1 }));

      dispatch(setAdditionalDetails(reordered));
    });

    return () => swapyRef.current?.destroy();
  }, [additionalDetails, dispatch]);

  return (
    <div className="space-y-6">
      {additionalDetails.length === 0 ? (
        <div className="text-center py-12 bg-gray-5/5 rounded-lg border-2 border-dashed border-gray-5/20">
          <GripVertical className="w-8 h-8 text-gray-4 mx-auto mb-4" />
          <p className="text-gray-4 text-sm font-sofia-sans">
            No additional sections added yet.
          </p>
          <div className="flex items-center justify-center mt-4 relative">
            <button
              type="button"
              onClick={addDetail}
              className="flex items-center gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 overflow-hidden" ref={containerRef}>
          {additionalDetails.map((detail, index) => (
            <div
              key={index}
              data-swapy-slot={index}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
            >
              <div
                className={`bg-gray-5/5 rounded-lg border ${
                  errors?.additionalfieldsContent?.includes(index) ||
                  errors?.additionalfieldsHeadings?.includes(index)
                    ? "border-red-400"
                    : "border-gray-5/20"
                }`}
                data-swapy-item={index}
              >
                <div className="flex p-4 items-start justify-between cursor-pointer relative">
                  <div className="flex items-center gap-2 ">
                    <GripVertical
                      data-swapy-handle
                      className="w-4 h-4 text-gray-4 cursor-move relative z-[1]"
                    />
                    <span className="text-base font-medium text-light-100 font-sofia-sans">
                      {detail.heading || `Section ${index + 1}`}
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeDetail(index)}
                      className="text-gray-4 hover:text-red-400 relative z-[1] transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    onClick={() =>
                      setAccordion((prev) => (prev !== index ? index : null))
                    }
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>

                <AnimatePresence>
                  {accordion === index && (
                    <motion.div
                      key={index}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 p-4 pt-0">
                        <FormField
                          label="Heading"
                          required
                          name={`heading_${index}`}
                          type="text"
                          value={detail.heading}
                          error={{
                            message: errors?.additionalfieldsHeadings?.includes(
                              index
                            )
                              ? "Heading is required"
                              : "",
                          }}
                          onChange={(e) =>
                            updateDetail(index, "heading", e.target.value)
                          }
                          placeholder="e.g., Technical Specifications, Features"
                        />
                        <RichTextEditor
                          label="Content"
                          required
                          value={detail.content}
                          placeholder="Enter the detailed content for this section..."
                          onChange={(value) =>
                            updateDetail(index, "content", value)
                          }
                          error={{
                            message: errors?.additionalfieldsContent?.includes(
                              index
                            )
                              ? "Description is required"
                              : "",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
      {additionalDetails.length > 0 && (
        <div className="flex items-center justify-end relative">
          <button
            type="button"
            onClick={addDetail}
            className="flex items-center gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
};

export default AdditionalDetails;
