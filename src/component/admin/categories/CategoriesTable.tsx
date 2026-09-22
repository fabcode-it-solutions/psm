"use client";

import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  FolderTree,
  Calendar,
  Folders,
  EyeOff,
  Download,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Category } from "@/services/categoryService";
import { useApiRequest } from "@/hooks/useApiRequest";
import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/defaults";
import { useTheme } from "@/providers/ThemeProvider";
import toast from "react-hot-toast";

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onRefresh: () => void;
  loading?: boolean;
  onLocalToggleActive?: (id: number, isActive: boolean) => void;
  onLocalDelete?: (id: number) => void;
}

interface DeleteDialogState {
  isOpen: boolean;
  category: Category | null;
}

export function CategoriesTable({
  categories,
  onEdit,
  onRefresh,
  loading,
  onLocalToggleActive,
  onLocalDelete,
}: CategoriesTableProps) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    category: null,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const { request, loading: deleteLoading } = useApiRequest();

  const { setLoader } = useTheme(); // access loader setter

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === categories.length ? [] : categories.map((c) => c.id)
    );
  };

  const handleBulkExport = () => {
    try {
      const selectedCategories = categories.filter((cat) =>
        selectedIds.includes(cat.id)
      );

      if (selectedCategories.length === 0) {
        toast.error("Please select at least one category");
        return;
      }

      const headers = [
        "ID",
        "Name",
        "Slug",
        "Parent Category",
        "Active",
        "Created At",
        "Updated At",
      ];

      const csvContent = [
        headers.join(","),

        ...selectedCategories.map((cat) =>
          [
            cat.id,
            `"${cat.name}"`,
            `"${cat.slug}"`,
            cat.parentCategory ? `"${cat.parentCategory?.name}"` : "--",
            cat.isActive ? "Active" : "Inactive",
            formatDate(cat.createdAt),
            formatDate(cat.updatedAt),
          ].join(",")
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `categories-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedCategories.length} category(s)`);

      setSelectedIds([]);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export categories");
    }
  };

  const handleBulkHide = async () => {
    setLoader("Hiding categories");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          request({
            url: `/api/admin/categories/${id}/toggle-active`,
            options: { method: "PATCH", body: { isActive: false } },
            enableToast: false,
          })
        )
      );
      selectedIds.forEach((id) => onLocalToggleActive?.(id, false));
      toast.success(`${selectedIds.length} categories hidden successfully`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to hide categories");
      console.error("Failed to hide categories:", error);
    } finally {
      setLoader("");
    }
  };

  const handleBulkUnhide = async () => {
    setLoader("Unhiding categories");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          request({
            url: `/api/admin/categories/${id}/toggle-active`,
            options: { method: "PATCH", body: { isActive: true } },
            enableToast: false,
          })
        )
      );
      selectedIds.forEach((id) => onLocalToggleActive?.(id, true));
      toast.success(`${selectedIds.length} categories unhidden successfully`);
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to unhide categories");
      console.error("Failed to unhide categories:", error);
    } finally {
      setLoader("");
    }
  };

  const handleBulkDelete = async () => {
    setLoader("Deleting categories");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          request({
            url: `/api/admin/categories/${id}`,
            options: { method: "DELETE", body: { categoryId: id } },
            enableToast: false,
          })
        )
      );
      if (onLocalDelete) {
        selectedIds.forEach((id) => onLocalDelete(id));
      } else {
        onRefresh();
      }
      toast.success(`${selectedIds.length} categories deleted successfully`);
      setSelectedIds([]);
      setBulkDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete categories");
      console.error("Failed to delete categories:", error);
    } finally {
      setLoader("");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      await request({
        url: `/api/admin/categories/${deleteDialog.category.id}`,
        options: {
          method: "DELETE",
          body: { categoryId: deleteDialog.category.id },
        },
      });

      if (onLocalDelete) {
        onLocalDelete(deleteDialog.category.id);
      } else {
        onRefresh();
      }
      setDeleteDialog({ isOpen: false, category: null });
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      setLoader("Updating Status");
      await request({
        url: `/api/admin/categories/${category.id}/toggle-active`,
        options: {
          method: "PATCH",
          body: { isActive: !category.isActive },
        },
      });
      onLocalToggleActive?.(category.id, !category.isActive);
    } catch (error) {
      console.error("Failed to toggle category:", error);
    } finally {
      setLoader("");
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent-100 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-4 font-sofia-sans">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg">
        <div className="p-8 text-center">
          <FolderTree className="w-12 h-12 text-gray-4 mx-auto mb-4" />
          <h3 className="text-light-100 text-lg font-bold mb-2 font-supreme">
            No categories found
          </h3>
          <p className="text-gray-4 font-sofia-sans">
            Get started by creating your first category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="bg-yellow-400/10 border-2 border-yellow-400/40 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-yellow-400 font-sofia-sans">
                Bulk Actions:
              </span>
              <span className="text-sm font-medium text-light-100 font-sofia-sans">
                {selectedIds.length} User(s) selected
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-gray-4 hover:text-light-100 transition-colors font-sofia-sans underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkHide}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
              >
                <EyeOff className="w-4 h-4" />
                Hide
              </button>
              <button
                onClick={handleBulkUnhide}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Unhide
              </button>
              <button
                onClick={handleBulkExport}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
              <button
                onClick={() => setBulkDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-dark-100  rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-5/5 border-b  border-gray-5/20">
              <tr>
                <th className="text-left p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === categories.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-5/20 bg-dark-100 text-accent-100 cursor-pointer"
                  />
                </th>
                <th className="text-left p-4">
                  <button className="flex items-center gap-2 text-light-100 cursor-pointer font-sofia-sans font-medium">
                    Name
                  </button>
                </th>
                <th className="text-left p-4">
                  <span className="text-light-100 font-sofia-sans font-medium cursor-pointer">
                    Slug
                  </span>
                </th>
                <th className="text-left p-4">
                  <span className="text-light-100 font-sofia-sans font-medium cursor-pointer">
                    Parent
                  </span>
                </th>
                <th className="text-left p-4">
                  <span className="text-light-100 font-sofia-sans font-medium cursor-pointer">
                    Parts
                  </span>
                </th>
                <th className="text-left p-4">
                  <button className="flex items-center gap-2 text-light-100 font-sofia-sans font-medium cursor-pointer">
                    Created
                  </button>
                </th>
                <th className="text-right p-4">
                  <span className="text-light-100 font-sofia-sans font-medium cursor-pointer">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-gray-5/20 last:border-0 hover:bg-gray-5/5"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(category.id)}
                      onChange={() => toggleSelect(category.id)}
                      className="w-4 h-4 rounded border-gray-5/20 bg-dark-100 text-accent-100 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 cursor-pointer relative group">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10  rounded-lg flex items-center justify-center ${
                          category.parentId
                            ? "bg-blue-400/10"
                            : "bg-accent-100/10"
                        }`}
                      >
                        {category.parentId ? (
                          <Folders className="w-5 h-5 text-blue-400" />
                        ) : (
                          <FolderTree className="w-5 h-5 text-accent-100" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-light-100 font-medium font-sofia-sans">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-gray-4 text-sm font-sofia-sans truncate max-w-xs">
                            {category.description}
                          </p>
                        )}
                        <div className="flex gap-1">
                          {/* {category.isCustom && (
                            <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-sofia-sans">
                              Custom
                            </span>
                          )} */}
                          {category.isActive === false && (
                            <span className="inline-block px-2 py-0.5 bg-gray-500/20 text-green-500 text-xs rounded-full font-sofia-sans">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Parent → Child Hover Tooltip */}
                      {category.parentCategory && (
                        <div
                          className="
            absolute bottom-0 left-0
            hidden group-hover:flex
            bg-dark-100 border border-green-500
            items-center gap-1
            rounded-md px-2 py-1
            text-xs text-green-500
            shadow-xl
            whitespace-nowrap
            z-50
          "
                        >
                          <span className="text-green-400 underline">
                            {category.parentCategory.name}
                          </span>
                          <span className=" text-green-400">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                          <span className="text-green-400">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-gray-4 bg-gray-5/10 px-2 py-1 rounded text-sm font-mono">
                      {category.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    <span className="text-light-200 font-sofia-sans">
                      {category.parentCategory?.name || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`
      font-sofia-sans flex justify-center rounded-full py-[2px] px-2 w-fit
      ${
        category.PartsCount === 0
          ? "bg-gray-200 text-gray-700" // Empty state
          : "bg-emerald-600 text-white" // Has parts
      }
    `}
                    >
                      {category.PartsCount || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-gray-4">
                      {/* <Calendar className="w-4 h-4" /> */}
                      <span className="font-sofia-sans text-sm">
                        {formatDate(category.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-dark-100 border border-gray-5/20 rounded-lg p-1 min-w-[160px] shadow-xl z-50"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                            onClick={() =>
                              router.push(
                                `${
                                  category.parentCategory?.slug
                                    ? `/marketplaces/${category.slug}/${category.parentCategory?.slug}`
                                    : `/marketplaces/${category.slug}`
                                }`
                              )
                            }
                          >
                            <Eye className="w-4 h-4" />
                            <span className="font-sofia-sans text-sm">
                              View
                            </span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                            onClick={() => onEdit(category)}
                          >
                            <Edit className="w-4 h-4" />
                            <span className="font-sofia-sans text-sm">
                              Edit
                            </span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded cursor-pointer outline-none"
                            onClick={() => handleToggleActive(category)}
                          >
                            {category.isActive === false ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                            <span className="font-sofia-sans text-sm">
                              {category.isActive === false ? "Unhide" : "Hide"}
                            </span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                            onClick={() =>
                              setDeleteDialog({ isOpen: true, category })
                            }
                          >
                            <Trash className="w-4 h-4" />
                            <span className="font-sofia-sans text-sm">
                              Delete
                            </span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {deleteDialog.category?.id && (
        <DeleteConfirmationDialog
          confirmDelete={() => handleDelete()}
          deleteBrandId={deleteDialog.category?.id}
          deleteLoading={deleteLoading}
          setDeleteBrandId={() =>
            setDeleteDialog({ isOpen: false, category: null })
          }
          heading="Delete Category"
          content="Are you sure you want to delete this category? This action cannot
                        be undone."
        />
      )}
      {bulkDeleteDialog && (
        <DeleteConfirmationDialog
          confirmDelete={handleBulkDelete}
          deleteBrandId={1}
          deleteLoading={deleteLoading}
          setDeleteBrandId={() => setBulkDeleteDialog(false)}
          heading="Delete Categories"
          content={`Are you sure you want to delete ${selectedIds.length} categories? This action cannot be undone.`}
        />
      )}
    </>
  );
}
