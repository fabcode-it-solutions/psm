import React, { useState } from "react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { FormField } from "@/component/ui/dashboard/FormField";
import { userService } from "@/services/user.service";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordPopupProps {
  userId: number;
  adminId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onPasswordReset: () => void;
}

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPopup: React.FC<ResetPasswordPopupProps> = ({
  userId,
  adminId,
  open,
  setOpen,
  onPasswordReset,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      const result = await userService.changePasswordAsAdmin({
        userId,
        adminId,
        newPassword: data.newPassword,
      });

      if (result.success) {
        toast.success(result.message || "Password changed successfully");
        reset();
        setOpen(false);
        onPasswordReset();
      } else {
        toast.error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogPopup className="!w-100" heading="Reset User Password" open={open} setShowCreateModal={setOpen}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <div className="flex flex-col gap-2">
          <label className="block text-sm mb-2 font-sofia-sans text-light-100">
            New Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              {...register("newPassword")}
              className={`w-full px-3 py-2 pr-10 border border-gray-5/20 rounded-lg focus:ring-1 focus:border-transparent font-sofia-sans bg-gray-5/10 text-light-100 ${
                errors.newPassword?.message
                  ? "!border-red-500 focus:ring-red-500"
                  : "focus:ring-accent-100/70"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-4" />
              ) : (
                <Eye className="w-4 h-4 text-gray-4" />
              )}
            </button>
          </div>
          {errors.newPassword?.message && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 min-w-2 rounded-full bg-red-500" />
              <p className="text-red-500 text-left text-xs">{errors.newPassword.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm mb-2 font-sofia-sans text-light-100">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              className={`w-full px-3 py-2 pr-10 border border-gray-5/20 rounded-lg focus:ring-1 focus:border-transparent font-sofia-sans bg-gray-5/10 text-light-100 ${
                errors.confirmPassword?.message
                  ? "!border-red-500 focus:ring-red-500"
                  : "focus:ring-accent-100/70"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 text-gray-4" />
              ) : (
                <Eye className="w-4 h-4 text-gray-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 min-w-2 rounded-full bg-red-500" />
              <p className="text-red-500 text-left text-xs">{errors.confirmPassword.message}</p>
            </div>
          )}
        </div>

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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 font-sofia-sans font-medium"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </DialogPopup>
  );
};

export default ResetPasswordPopup;