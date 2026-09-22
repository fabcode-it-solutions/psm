"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GetUserResponse, UploadFileType } from "@/types";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { CATEGORY_OPTIONS, REASON_OPTIONS } from "@/utils/defaults";
import UploadInput from "@/component/ui/dashboard/media-upload/UploadInput";
import UploadInputMain from "@/component/ui/Upload/UploadInput";
import Button from "@/component/ui/Button/Button";

// 🔹 Zod schema for validation
const ReportSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters"),
});

type ReportFormData = z.infer<typeof ReportSchema>;

const ReportPopup = ({
  open,
  setOpen,
  user,
  reportUser,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  reportUser: (
    id: number,
    updates: {
      reason: string;
      description: string;
      category: string;
      imageMediaId?: number;
    }
  ) => void;
  user: GetUserResponse;
}) => {
  const [image, setImage] = useState<UploadFileType>({});
  const maxCharCount = 500;
  console.log(image);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      reason: "",
      category: "",
      description: "",
    },
  });

  const descriptionValue = watch("description") || "";

  const onSubmit = (data: ReportFormData) => {
    const updates = {
      reason: data.reason,
      description: data.description,
      category: data.category,
      imageMediaId: image.id,
    };
    reportUser(user.user.id, updates);
    setOpen(false);
  };

  return (
    <DialogPopup
      heading="Report User"
      open={open}
      setShowCreateModal={setOpen}
      mode="light"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Reason + Category */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-base font-medium text-dark-blue-cm mb-2 block">
              Reason*
            </label>
            <Dropdown
              mode="light"
              options={REASON_OPTIONS}
              onValueChange={(val) => setValue("reason", val)}
              placeholder="Select Reason"
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className="text-base font-medium text-dark-blue-cm mb-2 block">
              Category*
            </label>
            <Dropdown
              mode="light"
              options={CATEGORY_OPTIONS}
              onValueChange={(val) => setValue("category", val)}
              placeholder="Select Category"
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium text-dark-blue-cm my-2 block">
            Description*
          </label>
          <textarea
            {...register("description")}
            className="bg-gray-1 lg:bg-[#F9F9F9] text-dark-blue-cm py-3 px-3 rounded-xl w-full h-[144px] outline-none"
            maxLength={maxCharCount}
          />
          <div className="flex justify-between text-sm mt-1">
            {errors.description ? (
              <p className="text-red-500">{errors.description.message}</p>
            ) : (
              <span className="text-gray-500">
                {descriptionValue.length}/{maxCharCount}
              </span>
            )}
          </div>
          {descriptionValue.length < 200 && descriptionValue.length > 0 && (
            <span className="text-gray-500">
              Please explain atleast in 200 characters.
            </span>
          )}
        </div>

        <div>
          <label className="text-base font-medium text-dark-blue-cm my-2 block">
            Add Attachment
          </label>
          <UploadInput
            setImageFile={setImage}
            required={false}
            label="Add Attachment"
            mode="accounts"
            trigger={<UploadInputMain />}
          />
        </div>
        <div className="flex justify-center">
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </DialogPopup>
  );
};

export default ReportPopup;
