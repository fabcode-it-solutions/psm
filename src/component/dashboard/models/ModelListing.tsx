"use client";
import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  ArrowUpDown,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import toast from "react-hot-toast";
import { FormField } from "@/component/ui/dashboard/FormField";
import PageHeader from "@/component/dashboard/PageHeader";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { useApiRequest } from "@/hooks/useApiRequest";
import Image from "next/image";
import {  formatDate, getStatusBadge } from "@/utils/defaults";
import Pagination from "@/component/ui/dashboard/Pagination";
import EmptyTableUi from "@/component/ui/dashboard/EmptyTableUi";
import TableSkeleton from "@/component/ui/dashboard/TableSkeleton";
import { Model, ModelApiResponse, SortConfig } from "@/types/models.types";

import CreateModel from "./CreateModel";
import EditModel from "./EditModel";
import ViewModel from "./ViewModel";
import DeleteModel from "./DeleteModel";
const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModelId, setDeleteModelId] = useState<number | null>(null);
  const [viewModel, setViewModel] = useState<Model | null>(null);
  const [editModel, setEditModel] = useState<Model | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
  });

  const { request: fetchModels, loading: fetchLoading } =
    useApiRequest<ModelApiResponse>();

  const { request: fetchSingleModel } = useApiRequest<ModelApiResponse>();

  useEffect(() => {
    loadModels();
  }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

  const loadModels = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      params.append("includeBuilds", "true");

      if (searchTerm) params.append("search", searchTerm);
      if (sortConfig.field !== "buildsCount") {
        params.append("sortBy", sortConfig.field);
        params.append("sortOrder", sortConfig.direction);
      }

      const result = await fetchModels({
        url: `/api/admin/cars/models?${params.toString()}`,
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setModels(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
          setHasNext(result.pagination.hasNext);
          setHasPrev(result.pagination.hasPrev);
        }
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Model | "buildsCount") => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newLimit: string) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handleViewModel = async (model: Model) => {
    try {
      const result = await fetchSingleModel({
        url: `/api/admin/cars/models?id=${model.id}&includeBuilds=true`,
        options: { method: "GET" },
      });

      if (result && !Array.isArray(result.data)) {
        setViewModel(result.data as Model);
      } else {
        toast.error("Failed to fetch model details");
      }
    } catch (error) {
      console.error("Error fetching model details:", error);
      toast.error("Failed to fetch model details");
    }
  };

  const handleEditModel = (model: Model) => {
    setEditModel(model);
  };

  const handleDeleteModel = (modelId: number) => {
    setDeleteModelId(modelId);
  };

  const getSortIcon = (field: keyof Model | "buildsCount") => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-4" />;
    }
    return (
      <ArrowUpDown
        className={`w-3 h-3 ${
          sortConfig.direction === "asc"
            ? "text-accent-100 rotate-180"
            : "text-accent-100"
        }`}
      />
    );
  };

  const modelColumns = [
    { key: "image", label: "Image", sortable: false, align: "text-left" },
    { key: "name", label: "Model Name", sortable: true, align: "text-left" },
    { key: "brand", label: "Brand", sortable: false, align: "text-left" },
    { key: "status", label: "Status", sortable: true, align: "text-left" },
    {
      key: "buildsCount",
      label: "Builds",
      sortable: false,
      align: "text-left",
    },
    { key: "createdAt", label: "Created", sortable: true, align: "text-left" },
    { key: "actions", label: "Actions", sortable: false, align: "text-right" },
  ];

  return (
    <div className="bg-dark-100">
      <div className="mx-auto">
        <PageHeader
          heading="Car Models"
          describe="Manage car models and view their associated builds"
          button={<CreateModel loadModels={() => loadModels()} />}
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <FormField
              name="search"
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex gap-2 max-mb-xl:hidden">
            <Dropdown
              options={[
                { value: "10", label: "10 per page" },
                { value: "25", label: "25 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
              onValueChange={handleItemsPerPageChange}
              placeholder="Items per page"
            />
          </div>
        </div>

        {/* Loading State */}
        {fetchLoading && <TableSkeleton />}

        {/* Table */}
        {!fetchLoading && (
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-tab-lg:hidden">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-gray-5/20">
                  <tr>
                    {modelColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-6 py-3 ${col.align} text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans`}
                      >
                        {col.sortable ? (
                          <button
                            onClick={() => handleSort(col.key as keyof Model)}
                            className="flex items-center gap-2 hover:text-light-100"
                          >
                            {col.label}
                            {getSortIcon(col.key as keyof Model)}
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {models.length === 0 && !fetchLoading ? (
                    <EmptyTableUi
                      heading="No models found"
                      description="Try adjusting your search criteria or add a new model."
                    />
                  ) : (
                    models.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-5/10">
                        <td className="px-6 py-4">
                          {model.image?.url ? (
                            <Image
                              src={
                                typeof model.image == "object" && model.image
                                  ? model.image?.url
                                  : model.imageUrl || ""
                              }
                              alt={model.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-5/20 rounded-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-4" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-light-100 font-sofia-sans">
                            {model.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-light-100 font-sofia-sans">
                            {model.brand?.name || "Unknown Brand"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                              model.status
                            )}`}
                          >
                            {model.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-light-100 font-sofia-sans">
                          {model._count?.builds || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-light-100 font-sofia-sans">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-4" />
                            {formatDate(model.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-2 hover:bg-gray-5/10 rounded-full">
                                <MoreHorizontal className="w-4 h-4 text-gray-4" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-dark-100 border border-gray-5/20 rounded-md shadow-lg p-1 z-50"
                                align="end"
                              >
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                                  onClick={() => handleViewModel(model)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                                  onClick={() => handleEditModel(model)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                                  onClick={() => handleDeleteModel(model.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="max-tab-lg:block hidden space-y-4">
              {models.length === 0 && !fetchLoading ? (
                <table>
                  <tbody>
                    <EmptyTableUi
                      heading="No models found"
                      description="Try adjusting your search criteria or add a new model."
                    />
                  </tbody>
                </table>
              ) : (
                models.map((model) => (
                  <div
                    key={model.id}
                    className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {model.image && model.image.url  ? (
                        <Image
                          src={
                            typeof model.image == "object" && model.image
                              ? model.image?.url
                              : model.imageUrl || ""
                          }
                          alt={model.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-5/20 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-base font-medium text-light-100 font-sofia-sans">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-4">
                          {model.brand?.name || "Unknown Brand"} •{" "}
                          {model.status === "active" ? "Active" : "Inactive"}
                        </div>
                      </div>
                      {/* Actions */}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 hover:bg-gray-5/10 rounded-full">
                            <MoreHorizontal className="w-4 h-4 text-gray-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="bg-dark-100 border border-gray-5/20 rounded-md shadow-lg p-1 z-50"
                            align="end"
                          >
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                              onClick={() => handleViewModel(model)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                              onClick={() => handleEditModel(model)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>

                    {/* Builds count & date */}
                    <div className="mt-3 flex justify-between text-sm text-gray-4">
                      <span>{model._count?.builds || 0} builds</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(model.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </div>
        )}

        {editModel && (
          <EditModel
            model={editModel}
            loadModels={loadModels}
            setPopup={() => setEditModel(null)}
          />
        )}
        {viewModel && (
          <ViewModel
            setShowCreateModal={() => setViewModel(null)}
            showCreateModal={Boolean(viewModel)}
            viewModel={viewModel}
          />
        )}
        {deleteModelId && (
          <DeleteModel
            loadModels={loadModels}
            deleteModelId={deleteModelId}
            setDeleteModelId={setDeleteModelId}
          />
        )}
      </div>
    </div>
  );
};

export default ModelsPage;
