/* eslint-disable @typescript-eslint/no-unused-vars */
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { RootState } from "@/libs/redux/store";
import { UploadFileType } from "@/types";
import { TypeFormData } from "@/types/types.types";
import { typeSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const CreateType = ({
  setVariants,
  setModels,
  buttonClassName,
  loadTypes,
}: {
  setVariants?: React.Dispatch<React.SetStateAction<TypeFormData[]>>;
  setModels?: (data: TypeFormData) => void;
  buttonClassName?: string;
  loadTypes?: () => void | Promise<void>;
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [image, setImage] = useState<UploadFileType>({});
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };

  const handleCreateType = async (data: TypeFormData) => {
    if (loading) {
      return null;
    }

    try {
      setLoading("Creating Type...");
      if (setVariants) {
        setVariants((prev) => [...prev, { ...data, image: image.id }]);
      }
      if (setModels) {
        setModels({ ...data, image: image.id });
      }
      setShowCreateModal(false);
      reset();
      setImage({});
      if (loadTypes) {
        await loadTypes();
      }
    } catch (error) {
      console.error("Error creating type:", error);
      toast.error("Failed to create type");
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
    setValue,
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      status: "active",
    },
  });
  useEffect(() => {
    setValue("modelId", 1);
  }, [showCreateModal]);
  const typeName =
    (watch("name") || "").toString().replace(/ /g, "-") || "unknown";

  return (
    <div>
      <DashboardButton
        buttonText="Add Variant"
        className={`${buttonClassName || ""}`}
        onClick={() => setShowCreateModal(true)}
      />

      <DialogPopup
        className="!max-w-[650px]"
        overlayStyle="!bg-black/5 !backdrop-blur-sm"
        heading="Add Variant"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        <form onSubmit={handleSubmit(handleCreateType)} className="space-y-4">
          <div className="flex gap-3">
            <FormField
              label="Type Name"
              type="text"
              placeholder="Enter type name"
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
                onValueChange={(value) =>
                  setValue("status", value as "active" | "inactive")
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
              Description
            </label>
            <TextArea
              placeholder="Enter type description"
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
              label="Type Image"
              required={false}
              folder={`/types/${typeName}/image`}
              multipleSelect={false}
              setImageFile={setImage}
              preSelectedImageIds={image?.id ? [image.id] : []}
              onImagesSelected={(imageIds) => {
           
              }}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
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
              {loading ? "Creating..." : "Add Variant"}
            </button>
          </div>
        </form>
      </DialogPopup>
    </div>
  );
};

export default CreateType;
