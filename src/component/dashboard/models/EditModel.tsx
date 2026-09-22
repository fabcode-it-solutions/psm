import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { useApiRequest } from "@/hooks/useApiRequest";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { RootState } from "@/libs/redux/store";
import { UploadFileType } from "@/types";
import { Brand, BrandApiResponse } from "@/types/brands.types";
import { Model, ModelApiResponse, ModelFormData } from "@/types/models.types";
import { normalize } from "@/utils/defaults";
import { modelSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const EditModel = ({
  loadModels,
  model,
  setPopup,
}: {
  loadModels: () => void;
  setPopup: () => void;
  model: Model | null;
}) => {
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };
  
  const [editModel, setEditModel] = useState<Model | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [image, setImage] = useState<UploadFileType>({});

  const { request: updateModel } = useApiRequest<ModelApiResponse>();
  const { request: fetchBrands } = useApiRequest<BrandApiResponse>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      status: "active",
    },
  });

  useEffect(() => {
    if (model) {
      setEditModel(model);
      setShowCreateModal(true);
      setValue("name", model.name);
      setValue("description", model.description ?? "");
      setValue("status", model.status);
      setSelectedBrand(String(model.brandId));
      loadBrands();
    } else {
      closePopup();
    }
  }, [model]);

  const loadBrands = async () => {
    try {
      const result = await fetchBrands({
        url: "/api/admin/cars/brands?status=active&limit=100",
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setBrands(result.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to fetch brands");
    }
  };

  const handleUpdateModel = async (data: ModelFormData) => {
    if (!editModel || !selectedBrand) return;
    
    if (
      data.name == editModel.name &&
      normalize(data.description) == normalize(editModel.description) &&
      data.status == editModel.status &&
      selectedBrand == String(editModel.brandId) &&
      !image.id
    ) {
      toast.error("No changes to save");
      return null;
    }

    try {
      setLoading("Updating Model...");
      const result = await updateModel({
        url: `/api/admin/cars/models/${editModel.id}`,
        options: {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: {
            ...data,
            brandId: parseInt(selectedBrand),
            image: image.id,
          },
        },
      });

      if (result?.success) {
        closePopup();
      }
    } catch (error) {
      console.error("Error updating model:", error);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopup();
    setEditModel(null);
    setShowCreateModal(false);
    reset();
    setImage({});
    setSelectedBrand("");
    loadModels();
  };

  const modelName = (watch("name") || "")
    .toString()
    .replace(/ /g, "-") || "unknown";

  const brandOptions = brands.map(brand => ({
    value: String(brand.id),
    label: brand.name,
    logo: typeof brand.logo == "object" && brand.logo
                      ? brand.logo?.url
                      : ""
  }));

  return (
    <div>
      <DialogPopup
        heading="Edit Model"
        open={showCreateModal}
        setShowCreateModal={closePopup}
      >
        <form onSubmit={handleSubmit(handleUpdateModel)} className="space-y-4">
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
                placeholder={model?.status ?? "Select status"}
                onValueChange={(value) => setValue("status", value as "active" | "inactive")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
              Brand <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={brandOptions}
              placeholder="Select brand"
              selectedText={selectedBrand}
              onValueChange={setSelectedBrand}
            />
            {!selectedBrand && (
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-red-500 text-xs">Brand is required</p>
              </div>
            )}
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
              setImageFile={setImage}
              folder={`/models/${modelName}/image`}
              altText={
                (model &&
                  (typeof model.image == "object" && model.image
                    ? model.image?.altText
                    : "")) ||
                ""
              }
              image={
                (model &&
                  (typeof model.image == "object" && model.image
                    ? model.image?.url
                    : model.imageUrl)) ||
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
              {loading ? "Updating..." : "Update Model"}
            </button>
          </div>
        </form>
      </DialogPopup>
    </div>
  );
};

export default EditModel;