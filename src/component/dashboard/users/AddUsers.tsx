"use client";

import React, { useState } from "react";
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { userService } from "@/services/user.service";
import { FormField } from "@/component/ui/dashboard/FormField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface AddUsersProps {
  onUserAdded: () => void;
}

const addUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number is too long"),
});


type AddUserFormValues = z.infer<typeof addUserSchema>;

const AddUsers: React.FC<AddUsersProps> = ({ onUserAdded }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
  });

  const onSubmit = async (data: AddUserFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        phoneNumber: Number(data.phoneNumber),
        role: "superAdmin",
      };

      const result = await userService.createUser(payload);

      if (result.success) {
        toast.success(
          "SuperAdmin user created successfully! Password sent to their email."
        );
        reset();
        setShowAddUser(false);
        onUserAdded();
      } else {
       
        if (result.fieldErrors) {
          Object.keys(result.fieldErrors).forEach((key) => {
            setError(key as keyof AddUserFormValues, {
              type: "manual",
              message: result.fieldErrors[key],
            });
          });
        } else {
          toast.error(result.message || "Failed to create user");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardButton
        buttonText="Add SuperAdmin"
        onClick={() => setShowAddUser(true)}
      />
      <DialogPopup
        heading="Add New SuperAdmin"
        open={showAddUser}
        setShowCreateModal={setShowAddUser}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-4 "
        >
          <FormField
            type="text"
            label="Username"
            placeholder="Username"
            {...register("username")}
            error={errors.username}
            required
          />

          <FormField
            type="email"
            label="Email"
            placeholder="Email"
            {...register("email")}
            error={errors.email}
             required
          />

          <FormField
            type="text"
            label="Phone Number"
            placeholder="Phone Number"
            {...register("phoneNumber")}
          />
          <div className="flex gap-4 mt-4">

           <button
              type="button"
              onClick={() => {
                setShowAddUser(false);
                reset();
                
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
              {loading ? "Adding..." : "Add SuperAdmin"}
            </button>
            </div>
        </form>
      </DialogPopup>
    </div>
  );
};
export default AddUsers;
