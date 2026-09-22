export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  featuredImage?: string;
  parentId?: number;
  isCustom: boolean;
  isActive?: boolean;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  PartsCount?: number;
  parentCategory?: {
    id: number;
    name: string;
    slug: string;
  };
  seoMeta?: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    canonicalUrl: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
  };
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  featuredImage?: string;
  parentId?: number;
  userId?: number;
  isCustom?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  categoryId: number;
}

export interface CategoryResponse {
  success: boolean;
  data?: Category;
  message?: string;
  error?: string;
  status?: number;
}

export interface CategoriesListResponse {
  success: boolean;
  data?: Category[];
  message?: string;
  error?: string;
  status?: number;
}

export interface CategoriesResponse {
  success: boolean;
  data?: Category[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class CategoryService {
  private static baseUrl = "/api/admin/categories";

  static async getCategories(): Promise<CategoriesListResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to fetch categories" + error);
    }
  }
  static async getCategory(slug: string): Promise<CategoryResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/admin/categories/${slug}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return await response.json();
      }

      const data: CategoryResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        "Failed to fetch categories: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  static async createCategory(
    categoryData: CreateCategoryData
  ): Promise<CategoryResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to create category" + JSON.stringify(error));
    }
  }

  static async updateCategory(
    categoryData: UpdateCategoryData
  ): Promise<CategoryResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to update category" + JSON.stringify(error));
    }
  }

  static async deleteCategory(categoryId: number): Promise<CategoryResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to delete category" + JSON.stringify(error));
    }
  }
}
