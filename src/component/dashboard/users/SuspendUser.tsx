/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { FormField } from "@/component/ui/dashboard/FormField";
import { userService } from "@/services/user.service";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface SuspendUserPopupProps {
  userId: number | number[];
  adminId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onUserSuspended: () => void;
}

const suspendUserSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  suspendTime: z.string().optional(),
  confirmPermanent: z.boolean().refine((val) => val === true, {
    message: "You must confirm permanent suspension",
  }),
});

type SuspendUserFormValues = z.infer<typeof suspendUserSchema>;

const SuspendUserPopup: React.FC<SuspendUserPopupProps> = ({
  userId,
  adminId,
  open,
  setOpen,
  onUserSuspended,
}) => {
  const [loading, setLoading] = useState(false);
  const defaultSuspendTime = new Date(
    Date.now() + 150 * 365 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SuspendUserFormValues>({
    resolver: zodResolver(suspendUserSchema),
    defaultValues: { suspendTime: defaultSuspendTime, confirmPermanent: false },
  });

  const onSubmit = async (data: SuspendUserFormValues) => {
    setLoading(true);
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const isBulk = Array.isArray(userId);
      
      if (isBulk) {
        await Promise.all(userIds.map(id => 
          userService.suspendUserAsAdmin({
            userId: id,
            adminId,
            reason: data.reason,
            suspendTime: data.suspendTime,
          })
        ));
        toast.success(`${userIds.length} user(s) suspended successfully`);
      } else {
        const result = await userService.suspendUserAsAdmin({
          userId: userIds[0],
          adminId,
          reason: data.reason,
          suspendTime: data.suspendTime,
        });
        
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message || "Failed to suspend user");
        }
      }
      
      reset();
      setOpen(false);
      onUserSuspended();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setValue("suspendTime", defaultSuspendTime);
    }
  }, [open]);

  return (
    <DialogPopup
      heading={Array.isArray(userId) ? `Suspend ${userId.length} Users` : "Suspend User"}
      open={open}
      setShowCreateModal={setOpen}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <FormField
          type="text"
          label="Reason"
          placeholder="Enter reason"
          {...register("reason")}
          error={errors.reason}
          required
        />

        <FormField
          type="datetime-local"
          label="Suspend Until"
          placeholder="Select suspend time"
          {...register("suspendTime")}
          error={errors.suspendTime}
          disabled
        />

        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            {...register("confirmPermanent")}
            className="w-5 h-5 cursor-pointer"
          />
          <p className="text-red-600 font-bold text-xl">
            Suspend the Account Permanently
          </p>
        </div>

        {errors.confirmPermanent && (
          <span className="text-red-500 text-sm">
            {errors.confirmPermanent.message}
          </span>
        )}

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50 font-sofia-sans font-medium"
            disabled={loading || !watch("confirmPermanent")}
          >
            {loading ? "Suspending..." : Array.isArray(userId) ? `Suspend ${userId.length} Users` : "Suspend User"}
          </button>
        </div>
      </form>
    </DialogPopup>
  );
};

export default SuspendUserPopup;
