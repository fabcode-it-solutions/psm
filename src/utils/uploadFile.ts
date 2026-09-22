import { uploadFileToS3 } from "@/actions/upload";

export const uploadFile = async ({
  file,
  folder,
  customFileName,
  type,
  alt,
}: {
  file: File;
  folder: string;
  customFileName?: string;
  alt?: string;
  type?: string;
}) => {
  const getUserId = localStorage.getItem("userIdOverlap");
  await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("Base64 conversion failed");
  });
  const result = await uploadFileToS3({
    file,
    folder,
    customFileName,
  });
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      result,
      getUserId,
      type,
      alt,
    }),
  });
  const media = await response.json();
  return {
    media,
    result,
  };
};
