import { NextResponse } from "next/server";
import { addCarBrand, getCarBrandByName } from "@/models/cars.model";
import csv from "csv-parser";
import { Readable } from "stream";
import { uploadFile } from "@/utils/uploadFile";
import { carBrands } from "@/db/schema/default";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";

interface BrandRow {
  name: string;
  description?: string;
  status?: string;
  logoUrl?: string;
  logourl?: string;
  imageUrl?: string;
  imageurl?: string;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
  duplicates: Array<{
    row: number;
    name: string;
  }>;
}

// Validate brand data
const validateBrandData = (row: BrandRow, rowIndex: number) => {
  const errors: string[] = [];

  if (!row.name || row.name.trim().length === 0) {
    errors.push("Brand name is required");
  }

  if (row.name && row.name.length > 255) {
    errors.push("Brand name must be less than 255 characters");
  }

  if (row.description && row.description.length > 255) {
    errors.push("Description must be less than 255 characters");
  }

  if (row.status && !["active", "inactive"].includes(row.status.toLowerCase())) {
    errors.push("Status must be either 'active' or 'inactive'");
  }

  if (row.logoUrl && !isValidUrl(row.logoUrl)) {
    errors.push("Invalid logo URL format");
  }

  if (row.imageUrl && !isValidUrl(row.imageUrl)) {
    errors.push("Invalid image URL format");
  }

  return errors;
};

// Simple URL validation
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Parse CSV data from buffer
const parseCsvFromBuffer = (buffer: Buffer): Promise<BrandRow[]> => {
  return new Promise((resolve, reject) => {
    const results: BrandRow[] = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.toLowerCase().trim(),
        strict: false
      }))
      .on('data', (data: BrandRow) => {        
        const brandRow: BrandRow = {
          name: data.name?.trim() || '',
          description: data.description?.trim() || undefined,
          status: data.status?.toLowerCase().trim() || 'active',
          logoUrl: data.logoUrl?.trim() || data.logourl?.trim()  || undefined,
          imageUrl: data.imageUrl?.trim() || data.imageurl?.trim()  || undefined,
        };
        results.push(brandRow);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
    
//     if (!file) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // Validate file type
//     if (!file.name.toLowerCase().endsWith('.csv')) {
//       return NextResponse.json(
//         { error: "Only CSV files are supported" },
//         { status: 400 }
//       );
//     }

//     // Check file size (max 5MB)
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     if (file.size > maxSize) {
//       return NextResponse.json(
//         { error: "File size must be less than 5MB" },
//         { status: 400 }
//       );
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
    
//     // Parse CSV
//     let brands: BrandRow[];
//     try {
//       brands = await parseCsvFromBuffer(buffer);
//     } catch (error) {
//       return NextResponse.json(
//         { error: "Failed to parse CSV file. Please check the format." },
//         { status: 400 }
//       );
//     }   
//     if (brands.length === 0) {
//       return NextResponse.json(
//         { error: "No valid data found in CSV file" },
//         { status: 400 }
//       );
//     }

//     // Limit number of rows to prevent abuse
//     if (brands.length > 1000) {
//       return NextResponse.json(
//         { error: "Maximum 1000 brands allowed per upload" },
//         { status: 400 }
//       );
//     }

//     const result: BulkUploadResult = {
//       success: 0,
//       failed: 0,
//       errors: [],
//       duplicates: []
//     };

//     // Process each brand
//     for (let i = 0; i < brands.length; i++) {
//       const brand = brands[i];
//       const rowNumber = i + 2; // +2 because CSV starts from row 1 and we skip header

//       try {
//         // Validate data
//         const validationErrors = validateBrandData(brand, rowNumber);
//         if (validationErrors.length > 0) {
//           result.failed++;
//           result.errors.push({
//             row: rowNumber,
//             name: brand.name || 'Unknown',
//             error: validationErrors.join(', ')
//           });
//           continue;
//         }

//         // Check for existing brand
//            const existingBrand = await db
//                 .select()
//                 .from(carBrands)
//                 .where(eq(carBrands.name, brand.name))
//                 .limit(1);

//         if (existingBrand && existingBrand.length > 0) {
            
//           result.duplicates.push({
//             row: rowNumber,
//             name: brand.name
//           });
//           continue;
//         }
//         console.log("existingBrand");
        
//         // Create brand data object
//         const brandData = {
//           name: brand.name,
//           description: brand.description || null,
//           status: brand.status as "active" | "inactive" || "active",
//           logoUrl: brand.logoUrl || brand.logourl || null,
//           imageUrl: brand.imageUrl || brand.imageurl || null,
//         };
//           const brandName =
//     (brandData.name || "").toString().replace(/ /g, "-") || "unknown";
//     if(brandData.logoUrl){
//         const media = await uploadFile({
//                     file: brandData.logoUrl,
//           folder: `/brands/${brandName}/logo`,
//           type: "image",
//           alt: brandName,
//         });
//         brandData.logoUrl = media.media.id
//            console.log("yaha hu", media);
//     }
//         if(brandData.imageUrl){
//         const media = await uploadFile({
//                     file: brandData.imageUrl,
//           folder: `/brands/${brandName}/logo`,
//           type: "image",
//           alt: brandName,
//         });
//         brandData.imageUrl = media.media.id
//     }
//     console.log("yaha hu", brandData);
    
//         // // Add brand to database
//          const addResult = await db.insert(carBrands).values({
//             name:brandData.name,
// description:brandData.description,
// status:brandData.status,
// logoMediaId:Number(brandData.logoUrl),
// imageMediaId:Number(brandData.imageUrl)
//          }).returning();
        
//         if (addResult && typeof addResult === "object" && "error" in addResult) {
//           result.failed++;
//           result.errors.push({
//             row: rowNumber,
//             name: brand.name,
//             error: (addResult as { error: string }).error
//           });
//         } else {
//           result.success++;
//         }

//       } catch (error) {
//         result.failed++;
//         result.errors.push({
//           row: rowNumber,
//           name: brand.name || 'Unknown',
//           error: error instanceof Error ? error.message : 'Unknown error occurred'
//         });
//       }
//     }

//     // Return results
//     const statusCode = result.success > 0 ? 200 : 400;
//     const message = result.success > 0 
//       ? `Successfully uploaded ${result.success} brands${result.failed > 0 ? ` (${result.failed} failed)` : ''}`
//       : 'No brands were uploaded successfully';

//     return NextResponse.json({
//       success: result.success > 0,
//       message,
//       data: {
//         totalProcessed: brands.length,
//         successCount: result.success,
//         failedCount: result.failed,
//         duplicateCount: result.duplicates.length,
//         errors: result.errors,
//         duplicates: result.duplicates
//       }
//     }, { status: statusCode });

//   } catch (error: unknown) {
//     console.error("Bulk upload error:", error);
//     return NextResponse.json(
//       { error: "Failed to process bulk upload" },
//       { status: 500 }
//     );
//   }
// }

// GET endpoint to download sample CSV template
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const template = url.searchParams.get('template');

    if (template === 'true') {
      // Generate sample CSV template
      const csvTemplate = `name,description,status,logoUrl,imageUrl
Toyota,Japanese automotive manufacturer,active,https://example.com/toyota-logo.png,https://example.com/toyota-image.jpg
Honda,Japanese automotive manufacturer,active,https://example.com/honda-logo.png,
BMW,German luxury vehicle manufacturer,active,,,
Ford,American automotive manufacturer,inactive,,,`;

      return new Response(csvTemplate, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="brands_template.csv"'
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Template download error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}