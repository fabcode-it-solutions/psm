import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import { useApiRequest } from "@/hooks/useApiRequest";
import { setloading } from "@/libs/redux/slices/dashboardSlice";
import { RootState } from "@/libs/redux/store";
import { UploadFileType } from "@/types";
import { Manufacturer, ManufacturerApiResponse, ManufacturerFormData } from "@/types/manufacturers.types";
import { normalize } from "@/utils/defaults";
import { manufacturerSchema } from "@/utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const EditManufacturer = ({
  loadManufacturers,
  manufacturer,
  setPopup,
}: {
  loadManufacturers: () => void;
  setPopup: () => void;
  manufacturer: Manufacturer | null;
}) => {
  const loading = useSelector((state: RootState) => state.dashboard.loading);
  const dispatch = useDispatch();
  const setLoading = (s: string | boolean) => {
    dispatch(setloading(s));
  };
  const [editManufacturer, setEditManufacturer] = useState<Manufacturer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { request: updateManufacturer } = useApiRequest<ManufacturerApiResponse>();
  const [logo, setLogo] = useState<UploadFileType>({});
  const [image, setImage] = useState<UploadFileType>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      status: "active",
    },
  });

  const handleUpdateManufacturer = async (data: ManufacturerFormData) => {
    if (!editManufacturer) return;
    
    if (
      data.name == editManufacturer.name &&
      normalize(data.description) == normalize(editManufacturer.description) &&
      normalize(data.subTitle) == normalize(editManufacturer.subTitle) &&
      data.status == editManufacturer.status &&
      !logo.id &&
      !image.id
    ) {
      toast.error("No changes to save");
      return null;
    }

    try {
      setLoading("Updating Manufacturer...");
      const result = await updateManufacturer({
        url: `/api/admin/cars/manufacturers/${editManufacturer.id}`,
        options: {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: {
            ...data,
            logo: logo.id,
            image: image.id,
          },
        },
      });

      if (result?.success) {
        closePopup();
      }
    } catch (error) {
      console.error("Error updating manufacturer:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manufacturer) {
      setEditManufacturer(manufacturer);
      setShowCreateModal(true);
      setValue("name", manufacturer.name);
      setValue("description", manufacturer.description ?? "");
      setValue("subTitle", manufacturer.subTitle ?? "");
      setValue("status", manufacturer.status);
    } else {
      closePopup();
    }
  }, [manufacturer, setValue]);

  const closePopup = () => {
    setPopup();
    setEditManufacturer(null);
    setShowCreateModal(false);
    reset();
    loadManufacturers();
  };

  const manufacturerName = (watch("name") || "")
    .toString()
    .replace(/ /g, "-") || "unknown";

  return (
    <div>
      <DialogPopup
        heading="Edit Manufacturer"
        open={showCreateModal}
        setShowCreateModal={closePopup}
      >
        <form onSubmit={handleSubmit(handleUpdateManufacturer)} className="space-y-4">
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
                placeholder={manufacturer?.status ?? "Select status"}
                onValueChange={(value) => setValue("status", value == 'active' ? 'active' : 'inactive')}
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
              requiredHeight={250}
              requiredWidth={250}
              setImageFile={setLogo}
              folder={`/manufacturers/${manufacturerName}/logo`}
              altText={
                (manufacturer &&
                  (typeof manufacturer.logo == "object" && manufacturer.logo
                    ? manufacturer.logo?.alt
                    : "")) ||
                ""
              }
              image={
                (manufacturer &&
                  (typeof manufacturer.logo == "object" && manufacturer.logo
                    ? manufacturer.logo?.url
                    : manufacturer.logoUrl)) ||
                ""
              }
            />
            <UploadInput
              label="Manufacturer Image"
              required={false}
              setImageFile={setImage}
              folder={`/manufacturers/${manufacturerName}/cover`}
              image={
                (manufacturer &&
                  (typeof manufacturer.image == "object" && manufacturer.image
                    ? manufacturer.image?.url
                    : manufacturer.imageUrl)) ||
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
              {loading ? "Updating..." : "Update Manufacturer"}
            </button>
          </div>
        </form>
      </DialogPopup>
    </div>
  );
};

export default EditManufacturer;