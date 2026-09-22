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
import { ManufacturerApiResponse, ManufacturerFormData } from "@/types/manufacturers.types";
import { manufacturerSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const CreateManufacturer = ({ loadManufacturers }: { loadManufacturers: () => void }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [logo, setLogo] = useState<UploadFileType>({});
  const [image, setImage] = useState<UploadFileType>({});
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };
  const { request: createManufacturer } = useApiRequest<ManufacturerApiResponse>();

  const handleCreateManufacturer = async (data: ManufacturerFormData) => {
    if (loading) {
      return null;
    }
    if (!logo?.id) {
      toast.error("Logo is required.");
      return null;
    }
    try {
      setLoading("Creating Manufacturer...");
      const result = await createManufacturer({
        url: "/api/admin/cars/manufacturers",
        options: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            ...data,
            logo: logo.id,
            image: image.id,
          },
        },
      });

      if (result?.success) {
        setShowCreateModal(false);
        loadManufacturers();
        reset();
        setLogo({});
        setImage({});
      }
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      toast.error("Failed to create manufacturer");
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      status: "active",
    },
  });

  const manufacturerName =
    (watch("name") || "").toString().replace(/ /g, "-") || "unknown";

  return (
    <div>
      <DashboardButton
        buttonText="Add Manufacturer"
        onClick={() => setShowCreateModal(true)}
      />

      <DialogPopup
        heading="Create New Manufacturer"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        <form onSubmit={handleSubmit(handleCreateManufacturer)} className="space-y-4">
          <div className="flex gap-3">
            <FormField
              label="Manufacturer Name"
              type="text"
              placeholder="Enter manufacturer name"
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
                onValueChange={(value) => setValue("status", value === 'inactive' ? 'inactive' : 'active')}
              />
            </div>
          </div>

          <div>
            <FormField
              label="Subtitle"
              type="text"
              placeholder="Enter manufacturer subtitle"
              {...register("subTitle")}
              error={errors.subTitle}
            />
          </div>

          <div>
            <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
              Description
            </label>
            <TextArea
              placeholder="Enter manufacturer description"
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
              label="Manufacturer Logo/Icon"
              required={true}
              folder={`/manufacturers/${manufacturerName}/logo`}
              multipleSelect={false}
              setImageFile={setLogo}
              preSelectedImageIds={logo?.id ? [logo.id] : []}
              onImagesSelected={(imageIds) => {
              }}
            />
            <UploadInput
              label="Manufacturer Image"
              required={false}
              folder={`/manufacturers/${manufacturerName}/cover`}
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
              {loading ? "Creating..." : "Create Manufacturer"}
            </button>
          </div>
        </form>
      </DialogPopup>
    </div>
  );
};

export default CreateManufacturer;