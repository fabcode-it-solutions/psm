/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PlusCircle, Save } from "lucide-react";
import PageHeader from "@/component/dashboard/PageHeader";
import PartBasic from "./PartBasic";
import Metafields from "./Metafields";
import AdditionalDetails from "./AdditionalDetails";
import Pricing from "./Pricing";
import Variants from "./Variants";
import Media from "./Media";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import toast from "react-hot-toast";
import {
  Parts,
  resetPart,
  updateErrors,
  updatePartField,
  updateSeoFields,
} from "@/libs/redux/slices/partsSlice";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { useRouter } from "next/navigation";
import SEOMeta from "../global/SEOMeta";
import { SEOMetaType } from "@/types";
import { getSlug } from "@/utils/getSlug";
import { ErrorsList } from "@/utils/defaults";
import Link from "next/link";

export interface ActiveSection {
  key:
    | "basic"
    | "details"
    | "variants"
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

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  inventory: string;
  weight: string;
  options: { [key: string]: string };
}

const CreatePartPage: React.FC = () => {
  const dispatch = useDispatch();
  const route = useRouter();
  const userId = useSelector((state: RootState) => state.user.user?.user.id);
  const seoMeta = useSelector(
    (state: RootState) => state.part.part?.seoMetadata
  );
  const part = useSelector((state: RootState) => state.part.part);
  const errors = useSelector((state: RootState) => state.part.errors);

  const handleSeoChange = useCallback(
    (field: keyof SEOMetaType) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch(updateSeoFields({ key: field, value: e.target.value }));
      },
    [dispatch]
  );
  const handleSeoChangeValue = (field: keyof SEOMetaType, value: string) => {
    dispatch(updateSeoFields({ key: field, value }));
  };
  const handleInputChange = useCallback(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        updatePartField({ key: "slug", value: getSlug(e.target.value) })
      );
    },
    [dispatch]
  );
  const sections: ActiveSection[] = useMemo(
    () => [
      {
        key: "basic",
        label: "Information",
        section: <PartBasic />,
      },
      {
        key: "media",
        label: "Media",
        description: "Images",
        section: <Media />,
      },
      ...(part?.variants && part.variants.length == 0
        ? ([
            {
              key: "pricing" as const,
              label: "Pricing",
              description: "Price, cost, and inventory",
              section: <Pricing />,
            },
          ] satisfies ActiveSection[])
        : []),
      {
        key: "variants",
        label: "Variants & Options",
        description: "Product options and variants",
        section: <Variants />,
      },
      {
        key: "details",
        label: "Additional Details",
        description: "Custom content sections",
        section: <AdditionalDetails />,
      },
      {
        key: "metafields",
        label: "Metafields",
        description: "Custom fields and properties",
        section: <Metafields />,
      },
      {
        key: "seo",
        label: "SEO Meta",
        description: "SEO and social media meta",
        isAccordion: true,
        section: (
          <SEOMeta
            handleSeoChange={handleSeoChange}
            handleSlugChange={handleInputChange}
            handleSeoChangeValue={handleSeoChangeValue}
            seoMeta={seoMeta}
            slug=""
          />
        ),
      },
    ],
    [part?.variants?.length, seoMeta]
  );

  const handlesubmit = async () => {
    dispatch(setloading("Creating Part..."));
    let isValid = true;
    ErrorsList.forEach((item) => {
      if (!part?.[item.key as keyof Parts]) {
        dispatch(updateErrors({ key: item.key, value: item.label }));
        isValid = false;
      }
    });
    if (!part?.variants?.length) {
      if (!part?.defaultVariant?.price) {
        dispatch(updateErrors({ key: "price", value: "Price is required." }));
        isValid = false;
      }
    }
    if (part?.options && part?.options?.length) {
      part?.options.map((item, index) => {
        if (!item.name) {
          dispatch(
            updateErrors({
              key:
                index == 0
                  ? "option1label"
                  : index == 1
                  ? "option2label"
                  : "option3label",
              value: "Option name is required.",
            })
          );
          isValid = false;
        }

        if (item.values.length == 0) {
          dispatch(
            updateErrors({
              key:
                index == 0
                  ? "option1Values"
                  : index == 1
                  ? "option2Values"
                  : "option3Values",
              value: "Please add atleast one value.",
            })
          );
          isValid = false;
        }
      });
    }
    if (part?.additionalDetails && part?.additionalDetails?.length) {
      const headings = part?.additionalDetails.map((item, index) => {
        return !item.heading ? index : -1;
      });
      const contents = part?.additionalDetails.map((item, index) => {
        return !item.content ? index : -1;
      });
      dispatch(
        updateErrors({
          key: "additionalfieldsHeadings",
          value: headings,
        })
      );
      dispatch(
        updateErrors({
          key: "additionalfieldsContent",
          value: contents,
        })
      );
      isValid = false;
      const checker = part?.additionalDetails.map((item) => {
        return item.heading != "";
      });
      const checker2 = part?.additionalDetails.map((item) => {
        return item.content != "";
      });
      const hasEmptyHeadings = checker.includes(true);
      const hasEmptyContent = checker2.includes(true);

      if (hasEmptyHeadings || hasEmptyContent) {
        isValid = true;
        dispatch(
          updateErrors({
            key: "additionalfieldsHeadings",
            value: [],
          })
        );
        dispatch(
          updateErrors({
            key: "additionalfieldsContent",
            value: [],
          })
        );
      }
    }

    if (!isValid) {
      dispatch(setloading(false));
      return;
    }
    const response = await fetch("/api/parts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...part, userId: userId }),
    });
    const result = await response.json();
    console.log(result, "create");
    if (result.success) {
      toast.success(result.message);
      route.push(`/dashboard/parts`);
    }
    dispatch(setloading(false));
  };
  useEffect(() => {
    dispatch(resetPart({ key: "brandId", value: "" }));
  }, [dispatch]);
  const [isAccordion, setAccordion] = useState("basic");
  return (
    <div className=" bg-dark-100">
      <div className=" mx-auto ">
        <div className="bg-dark-100 py-2 z-10">
          <PageHeader
            heading="Create New Master Part"
            describe="Add a new part with complete product information, variants, pricing, and media"
            button={
              <button
                type="button"
                aria-label="Create new part"
                onClick={() => handlesubmit()}
                className="flex items-center gap-2 px-6 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Create Part
              </button>
            }
          />
        </div>
        <form onSubmit={handlesubmit} className="space-y-6 mt-6">
          <div className="">
            {sections.map((item, index) =>
              item.key === "seo" ? (
                <div className="" key={item.key}>
                  {item.section}
                </div>
              ) : (
                <div
                  className="space-y-0 mb-6 bg-gray-5/5 rounded-lg border border-gray-5/20 relative"
                  key={item.key}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-full relative">
                      <h3
                        onClick={() =>
                          setAccordion((prev) => {
                            if (prev == item.key) {
                              return "";
                            }
                            return item.key;
                          })
                        }
                        className="text-lg w-full cursor-pointer font-semibold  p-4 text-light-100 font-sofia-sans"
                      >
                        {index + 1}. {item.label}
                      </h3>
                      {item.description && isAccordion == item.key && (
                        <p className="text-sm text-gray-4 -mt-2 mb-6 px-4 font-sofia-sans">
                          {item.description}
                        </p>
                      )}
                      {isAccordion == item.key && item.key == "metafields" && (
                        <Link
                          href="/dashboard/metafields"
                          className="flex items-center absolute top-4 right-4 gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Metafields Defination
                        </Link>
                      )}
                    </div>
                  </div>
                  <div
                    className={`${
                      isAccordion == item.key ? "max-h-[1500px]" : "max-h-0"
                    } duration-300 transition-all overflow-hidden`}
                  >
                    <div className={`pt-0 p-4 relative`}>{item.section}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </form>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => handlesubmit()}
            className="flex items-center gap-2 px-6 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Create Part
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePartPage;
