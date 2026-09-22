import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { useApiRequest } from "@/hooks/useApiRequest";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { RootState } from "@/libs/redux/store";
import { UploadFileType } from "@/types";
import { ModelApiResponse } from "@/types/models.types";
import { Type, TypeApiResponse, TypeFormData } from "@/types/types.types";
import { normalize } from "@/utils/defaults";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const EditType = ({
  loadTypes,
  type,
  setPopup,
}: {
  loadTypes: () => void;
  setPopup: () => void;
  type: Type | null;
}) => {
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };
  const [editType, setEditType] = useState<Type | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [models, setModels] = useState<{ id: number; name: string }[]>([]);

  const { request: updateType } = useApiRequest<TypeApiResponse>();
  const { request: fetchModels } = useApiRequest<ModelApiResponse>();
  const [image, setImage] = useState<UploadFileType>({});
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<TypeFormData>({    
    defaultValues: {
      status: "active",
    },
  });

  // Load models when component mounts or modal opens
  useEffect(() => {
    if (showCreateModal && models.length === 0) {
      loadModels();
    }
  }, [showCreateModal]);

  const loadModels = async () => {
    try {
      const result = await fetchModels({
        url: "/api/admin/cars/models",
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setModels(result.data);
      } else {
        toast.error("Failed to load models");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load models");
    }
  };

  const handleUpdateType = async (data: TypeFormData) => {
    if (!editType) return;
    if (
      data.name == editType.name &&
      normalize(data.description) == normalize(editType.description) &&
      data.status == editType.status &&
      data.modelId == editType.modelId &&
      !image.id
    ) {
      toast.error("No changes to save");
      return null;
    }

    try {
      setLoading("Updating Type...");
      const result = await updateType({
        url: `/api/admin/cars/types/${editType.id}`,
        options: {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: {
            ...data,
            image: image.id,
          },
        },
      });

      if (result?.success) {
        closePopup();
      }
    } catch (error) {
      console.error("Error updating type:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      setEditType(type);
      setShowCreateModal(true);
      setValue("name", type.name);
      setValue("description", type.description ?? "");
      setValue("status", type.status);
      setValue("modelId", type.modelId);
    } else {
      closePopup();
    }
  }, [type]);

  const closePopup = () => {
    setPopup();
    setEditType(null);
    setShowCreateModal(false);
    reset();
    loadTypes();
  };

  const typeName = (watch("name") || "")
    .toString()
    .replace(/ /g, "-") || "unknown";

  const handleModelChange = (value: string) => {
    setValue("modelId", Number(value));
  };

  return (
    <div>
      <DialogPopup
        heading="Edit Type"
        open={showCreateModal}
        setShowCreateModal={closePopup}
      >
        <form onSubmit={handleSubmit(handleUpdateType)} className="space-y-4">
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
                placeholder={type?.status ?? "Select status"}
                onValueChange={(value) => setValue("status", value as "active" | "inactive")}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
                Model <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={models.map((model) => ({
                  value: model.id.toString(),
                  label: model.name,
                }))}
                placeholder={type?.model?.name ?? "Select model"}
                onValueChange={handleModelChange}
              />
              {errors.modelId && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-red-500 text-xs">
                    {errors.modelId.message}
                  </p>
                </div>
              )}
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
              setImageFile={setImage}
              folder={`/types/${typeName}/image`}
              image={
                (type &&
                  (typeof type.image == "object" && type.image
                    ? type.image?.url
                    : "")) ||
                ""
              }
              altText={
                (type &&
                  (typeof type.image == "object" && type.image
                    ? type.image?.alt
                    : "")) ||
                ""
              }
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={closePopup}
              className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-100 text-dark-100 rounded hover:bg-accent-100/90 disabled:opacity-50 font-sofia-sans font-medium"
              disabled={typeof loading == "string" ? loading != "" : loading}
            >
              {loading ? "Updating..." : "Update Type"}
            </button>
          </div>
        </form>
      </DialogPopup>
    </div>
  );
};

export default EditType;