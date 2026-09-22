/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db/db";
import { media } from "@/db/schema/media";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { withFullCsrfProtection } from "@/libs/security/csrf-full";

const createMediaSchema = z.object({
  type: z.enum([
    "image",
    "video",
    "document",
    "audio",
    "archive",
    "vector",
    "spreadsheet",
    "presentation",
  ]),
  url: z.string().max(500).nullable(),
  altText: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  userId: z.number().int().positive().optional(),
});

export const POST = withFullCsrfProtection(
  async (req: NextRequest): Promise<NextResponse> => {

  try {
    const contentType = req.headers.get("content-type") || "";

    let mediaData: Record<string, unknown>;
    let uploadedFile: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      // Parse other form data
      const formDataObj: Record<string, string | number | boolean> = {};
      formData.forEach((value, key) => {
        if (key !== "file") {
          const stringValue = value as string;
          try {
            // Try to parse as JSON first for objects/arrays/booleans/numbers
            const parsed = JSON.parse(stringValue);
            formDataObj[key] = parsed;
          } catch {
            // If parsing fails, use as string
            formDataObj[key] = stringValue;
          }
        }
      });

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const uniqueFilename = `${uuidv4()}.${fileExt}`;

      // Create upload directory if it doesn't exist
      const uploadDir = join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      const filePath = join(uploadDir, uniqueFilename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Prepare media data
      mediaData = {
        ...formDataObj,
        url: `/uploads/${uniqueFilename}`,
        type: getMediaTypeFromMimeType(file.type),
      };

      uploadedFile = filePath;
    } else {
      // Handle JSON data (URL-based media)
      const body = (await req.json()) as Record<string, unknown>;
      mediaData = body;
    }

    // Validate media data
    const validated = createMediaSchema.parse(mediaData);

    try {
      // Insert media record
      const [newMedia] = await db
        .insert(media)
        .values({
          type: validated.type,
          url: validated.url || (mediaData.url as string),
          altText: validated.altText,
          isPublic: validated.isPublic,
          displayOrder: validated.displayOrder,
          userId: validated.userId,
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: newMedia,
          message: "Media uploaded successfully",
        },
        { status: 201 }
      );
    } catch (dbError) {
      if (uploadedFile) {
        try {
          const { unlink } = await import("fs/promises");
          await unlink(uploadedFile);
        } catch (unlinkError) {
          console.error("Failed to delete uploaded file:", unlinkError);
        }
      }
      throw dbError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error,
        },
        { status: 400 }
      );
    }

    console.error("Error creating media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create media" },
      { status: 500 }
    );
  }
})

// Helper function to determine media type from MIME type
function getMediaTypeFromMimeType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return "document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "presentation";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  )
    return "archive";
  if (mimeType.includes("svg")) return "vector";
  return "document";
}
