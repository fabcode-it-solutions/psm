import IconDismissCircle from "@/assets/icons/IconDismissCircle";
import Button from "@/component/ui/Button/Button";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import InputField from "@/component/ui/Input/Input";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";
import { fetchUser, updateUser } from "@/libs/redux/slices/authSlice";
import { generateUsername } from "@/utils/generateUsername";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod/v3";
export const RegisterSchema = z.object({
  username: z
    .string()
    .nonempty("Username is required")
    .regex(/^\S+$/, "Username cannot contain spaces"),
});
type FormData = z.infer<typeof RegisterSchema>;
const UsernameChangeDialog = ({
  usernameChange,
  setUsernameChange,
}: {
  usernameChange: string;
  setUsernameChange: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [loading, setLoading] = useState(false);
  const currentUser = useAppSelector(selectUser)?.user;
  const [info, setInfo] = useState<string>("");
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
    },
  });
  const usernameValue = watch("username");
  const generateName = useCallback(async () => {
    const value = await generateUsername();
    setValue("username", value, { shouldDirty: true });
  }, []);
  const onSubmit = async (data: FormData) => {
    const checkUserName = await fetch(
      `/api/auth/check-username?q=${data.username}`
    );
    const checkUserNameResult = await checkUserName.json();
    if (checkUserNameResult.isExisting) {
      toast.error("Username is already taken");
      setInfo(
        `Username is already taken, please use another one or <b className='text-accent-100'> ${checkUserNameResult.username}</b>`
      );
      return null;
    }
    if (currentUser && currentUser.id) {
      setLoading(true);
      const response = await fetch(`/api/user/`, {
        method: "PATCH",
        body: JSON.stringify({
          id: currentUser.id,
          updates: {
            username: data.username,
          },
        }),
      });
      setLoading(false);
      if (response.ok && currentUser.id) {
        dispatch(fetchUser(currentUser.id));
        dispatch(updateUser({ username: data.username }));
      }
    }
  };
  return (
    <DialogPopup
      className="!max-w-[448px]"
      heading="Change Username"
      open={usernameChange == "allowed"}
      setShowCreateModal={() => setUsernameChange("")}
      mode="light"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" flex flex-col gap-[20px] max-tab-lg:justify-center max-tab-lg:items-center"
      >
        <div className="flex flex-col gap-[8px]  w-full">
          <label className="text-xs flex justify-between  leading-[16px] font-medium text-[#606060]">
            Username
            <button
              onClick={generateName}
              className="text-xs text-accent-100 underline font-supreme"
              type="button"
            >
              Generate
            </button>
          </label>
          <InputField
            placeholder="Enter username"
            {...register("username")}
            onChange={(e) => {
              const noSpaces = e.target.value.replace(/\s+/g, "");
              setValue("username", noSpaces, { shouldDirty: true });
            }}
            rightIcon={usernameValue ? <IconDismissCircle /> : undefined}
            onRightIconClick={() =>
              setValue("username", "", { shouldDirty: true })
            }
            className="text-[#002029]"
          />
          {info != "" && (
            <p
              className="text-dark-100 text-sm max-w-[400px]"
              dangerouslySetInnerHTML={{ __html: info }}
            ></p>
          )}
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <Button
          type={loading ? "button" : "submit"}
          className={`${
            loading ? "cursor-not-allowed pointer-events-none opacity-55" : ""
          } `}
        >
          {loading ? loading || "Updating..." : "Update Username"}
        </Button>
      </form>
    </DialogPopup>
  );
};

export default UsernameChangeDialog;
