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
import { ModelFormData } from "@/types/models.types";
import { TypeFormData } from "@/types/types.types";
import { modelSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import CreateType from "../types/CreateType";
import { IoRemoveCircle } from "react-icons/io5";
import { Trash } from "lucide-react";

const CreateModel = ({
  setModels,
  models = [],
  buttonClassName,
  loadModels, 
}: {
  setModels?: React.Dispatch<React.SetStateAction<ModelFormData[]>>;
  models?: ModelFormData[];
  buttonClassName?: string;
  loadModels?: () => void | Promise<void>; 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [image, setImage] = useState<UploadFileType>({});
  const [variants, setVariants] = useState<TypeFormData[]>([]);
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      status: "active",
    },
  });

  const handleCreateModel = async (data: ModelFormData) => {
    if (loading) {
      return null;
    }

    try {
      setLoading("Creating Model...");
      if (setModels) {
        setModels((prev) => [...prev, { ...data, image: image.id, variants }]);
      }
      setVariants([]);
      setShowCreateModal(false);
      reset();
      setImage({});
      if (loadModels) {
        await loadModels();
      }
    } catch (error) {
      console.error("Error creating model:", error);
      toast.error("Failed to create model");
    } finally {
      setLoading(false);
    }
  };

  const modelName =
    (watch("name") || "").toString().replace(/ /g, "-") || "unknown";
  const removeModel = useCallback(
    (index: number) => {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  return (
    <div>
      <DashboardButton
        className={buttonClassName || ""}
        buttonText="Add Model"
        onClick={() => setShowCreateModal(true)}
      />

      <DialogPopup
        heading="Add Model"
        open={showCreateModal}
        className="!max-w-[700px]"
        overlayStyle="!bg-black/5 !backdrop-blur-sm"
        setShowCreateModal={setShowCreateModal}
      >
        <div className="relative pb-16">
          <form
            onSubmit={handleSubmit(handleCreateModel)}
            className="space-y-4"
          >
            <div className="flex gap-3">
              <FormField
                label="Model Name"
                type="text"
                placeholder="Enter model name"
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
                placeholder="Enter model description"
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

            <div>
              <UploadInput
                label="Model Image"
                required={false}
                folder={`/models/${modelName}/image`}
                multipleSelect={false}
                setImageFile={setImage}
                preSelectedImageIds={image?.id ? [image.id] : []}
                onImagesSelected={(imageIds) => {
                 
                }}
              />
            </div>

            <div className="flex gap-3 absolute bottom-0 right-0  justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                  setImage({});
                }}
                className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent-100 text-dark-100 rounded hover:bg-accent-100/90 disabled:opacity-50 font-sofia-sans font-medium"
                disabled={typeof loading == "string" ? loading != "" : loading}
              >
                {loading ? "Creating..." : "Add Model"}
              </button>
            </div>
          </form>
          <div className="grid gap-3  pt-4 bg-gray-5/10 border border-gray-5/20 rounded-lg p-4">
            <div className="flex justify-between gap-4 items-center">
              <div className="block text-base text-light-100 font-sofia-sans">
                Model Variant
              </div>
              <CreateType
                buttonClassName={buttonClassName || ""}
                setVariants={setVariants}
              />
            </div>
            {variants && variants.length > 0 && (
              <div className="">
                {variants.map((item, index) => (
                  <div
                    className="flex items-center justify-between hover:bg-gray-5/20 duration-200 transition-all text-base text-light-100 mb-2 px-6 py-3 rounded-md bg-gray-5/10 font-sofia-sans"
                    key={`variant-edit-${index + 1}`}
                  >
                    <span>
                      {index + 1}. {item.name}
                    </span>
                    <div>
                      <button
                        onClick={() => removeModel(index)}
                        type="button"
                        className="block"
                      >
                        <Trash className="block w-4" />
                      </button>
                    </div>
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

export default CreateModel;