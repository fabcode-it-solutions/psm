/* eslint-disable @typescript-eslint/no-unused-vars */
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { useApiRequest } from "@/hooks/useApiRequest";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { RootState } from "@/libs/redux/store";
import { UploadFileType } from "@/types";
import { BrandApiResponse, BrandFormData } from "@/types/brands.types";
import { brandSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import CreateModel from "../models/CreateModel";
import { ModelFormData } from "@/types/models.types";
import CreateType from "../types/CreateType";
import { TypeFormData } from "@/types/types.types";
import { Trash } from "lucide-react";

const CreateBrand = ({ loadBrands }: { loadBrands: () => void }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [variants, setVariants] = useState<TypeFormData[]>([]);
  const [logo, setLogo] = useState<UploadFileType>({});
  const [image, setImage] = useState<UploadFileType>({});
  const [models, setModels] = useState<ModelFormData[]>([]);
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };
  const { request: createBrand } = useApiRequest<BrandApiResponse>();
  const handleCreateBrand = async (data: BrandFormData) => {
    if (loading) {
      return null;
    }
    if (!logo?.id) {
      toast.error("Logo is required.");
      return null;
    }
    try {
      setLoading("Creating Brand...");
      const result = await createBrand({
        url: "/api/admin/cars/brands",
        options: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            ...data,
            logo: logo.id,
            image: image.id,
            models,
          },
        },
      });

      if (result?.success) {
        setShowCreateModal(false);
        loadBrands();
        reset();
        setLogo({});
        setImage({});
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Failed to create brand");
    } finally {
      setLoading(false);
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      status: "active",
    },
  });
  const brandName =
    (watch("name") || "").toString().replace(/ /g, "-") || "unknown";
  const removeModel = useCallback(
    (index: number) => {
      setModels((prev) => prev.filter((_, i) => i !== index));
    },
    [models]
  );
  const removeModelVariant = useCallback(
    (index: number, childIndex: number) => {
      setModels((prev) => {
        const updated = [...prev];
        if (updated[index].variants) {
          updated[index].variants = updated[index].variants.filter(
            (_, i) => i !== childIndex
          );
        }
        return updated;
      });
    },
    [models]
  );

  return (
    <div>
      <DashboardButton
        buttonText="Add Brand"
        onClick={() => setShowCreateModal(true)}
      />

      <DialogPopup
        heading="Create New Brand"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        <div className="relative pb-16">
          <form
            onSubmit={handleSubmit(handleCreateBrand)}
            className="space-y-4"
          >
            <div className="flex gap-3">
              <FormField
                label="Brand Name"
                type="text"
                placeholder="Enter brand name"
                required={true}
                {...register("name")}
                error={errors.name}
                className="flex-1"
              />
              <div className="flex-1">
                <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
                  Status
                </label>
                <Dropdown
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  placeholder="Select status"
                />
              </div>{" "}
            </div>
            <div>
              <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
                Description
              </label>
              <TextArea
                placeholder="Enter brand description"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-red-500 text-xs">
                    {errors.description.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 max-mb-xl:flex-wrap">
              <UploadInput
                label="Brand Logo/Icon"
                required={true}
                // requiredHeight={250}
                // requiredWidth={250}
                folder={`/brands/${brandName}/logo`}
                multipleSelect={false}
                setImageFile={setLogo}
                preSelectedImageIds={logo?.id ? [logo.id] : []}
                onImagesSelected={(imageIds) => {
                }}
              />
              <UploadInput
                label="Brand Image"
                required={false}
                folder={`/brands/${brandName}/cover`}
                multipleSelect={false}
                setImageFile={setImage}
                preSelectedImageIds={image?.id ? [image.id] : []}
                onImagesSelected={(imageIds) => {
                }}
              />
            </div>

            <div className="flex gap-3 absolute bottom-0 right-0 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-100 text-dark-100 rounded hover:bg-accent-100/90 disabled:opacity-50 font-sofia-sans font-medium"
                disabled={typeof loading == "string" ? loading != "" : loading}
              >
                {loading ? "Creating..." : "Create Brand"}
              </button>
            </div>
          </form>
          <div className="grid gap-3  pt-4 bg-gray-5/10 border border-gray-5/20 rounded-lg p-4">
            <div className="flex justify-between gap-4 items-center">
              <div className="block text-base text-light-100 font-sofia-sans">
                Models
              </div>
              <CreateModel
                buttonClassName="!px-2 !py-1 !gap-0.5 !text-sm"
                models={models}
                setModels={setModels}
              />
            </div>
            {models.length > 0 && (
              <div className="">
                {models.map((item, index) => (
                  <div
                    className=" mb-2 px-6 py-3 rounded-md bg-gray-5/10 hover:bg-gray-5/20 duration-200 transition-all"
                    key={`model-edit-${index + 1}`}
                  >
                    <div className="flex items-center justify-between  text-base text-light-100 font-sofia-sans">
                      <span>
                        {index + 1}. {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <CreateType
                          buttonClassName="!px-2 !py-1 !gap-0.5 !text-sm"
                          setVariants={setVariants}
                          setModels={(data) => {
                            setModels((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      variants: [
                                        ...(item?.variants || []),
                                        data,
                                      ],
                                    }
                                  : item
                              )
                            );
                          }}
                        />

                        <button
                          onClick={() => removeModel(index)}
                          type="button"
                          className="block"
                        >
                          <Trash className="block w-4" />
                        </button>
                      </div>
                    </div>
                    {item.variants && item.variants?.length > 0 && (
                      <div className="rounded-md bg-gray-5/10 p-3 mt-2">
                        {item.variants?.map((item, childIndex) => (
                          <div
                            className="text-sm text-light-100 py-0.5 font-sofia-sans flex items-center justify-between"
                            key={`variant-view-${childIndex + 1}`}
                          >
                            <span>
                              {childIndex + 1}. {item.name}
                            </span>{" "}
                            <button
                              onClick={() =>
                                removeModelVariant(index, childIndex)
                              }
                              type="button"
                              className="block"
                            >
                              <Trash className="block w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogPopup>
    </div>
  );
};

export default CreateBrand;
