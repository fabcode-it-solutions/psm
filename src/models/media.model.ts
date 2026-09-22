import { db } from "@/db/db";
import { media } from "@/db/schema/media";

type MediaType = {
  type: string;
  url: string;
  altText?: string;
  isPublic?: boolean;
  displayOrder?: number;
  userId?: number;
  size?: string;
  width?: number;
  height?: number;
  format?: string;
  name?:string
};
export const createMedia = async ({
  type,
  url,
  altText,
  isPublic,
  displayOrder,
  userId,
  size,
  width,
  height,
  format,
  name
}: MediaType) => {
  try {
    const mediaFile = await db
      .insert(media)
      .values({
        type,
        url,
        altText,
        isPublic,
        displayOrder,
        userId,
        size,
        width,
        height,
        format,
        name
      })
      .returning({
        id:media.id,
        url:media.url,
        altText:media.altText,
        displayOrder:media.displayOrder,
        name:media.name
      });
    return mediaFile;
  } catch (error) {
    console.log(error);
    return error;
  }
};
