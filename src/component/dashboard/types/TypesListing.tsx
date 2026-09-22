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
import { formatDate, getStatusBadge } from "@/utils/defaults";
import Pagination from "@/component/ui/dashboard/Pagination";
import EmptyTableUi from "@/component/ui/dashboard/EmptyTableUi";
import TableSkeleton from "@/component/ui/dashboard/TableSkeleton";
import { SortConfig, Type, TypeApiResponse } from "@/types/types.types";
import CreateType from "./CreateType";
import EditType from "./EditType";
import ViewType from "./ViewType";
import DeleteType from "./DeleteType";

const typesColumns = [
  { key: "image", label: "Image", align: "text-left", sortable: false },
  { key: "name", label: "Type Name", align: "text-left", sortable: true },
  { key: "model", label: "Model", align: "text-left", sortable: false },
  { key: "status", label: "Status", align: "text-left", sortable: true },
  { key: "buildsCount", label: "Builds", align: "text-left", sortable: false },
  { key: "createdAt", label: "Created", align: "text-left", sortable: true },
  { key: "actions", label: "Actions", align: "text-right", sortable: false },
];

const TypesPage: React.FC = () => {
  const [types, setTypes] = useState<Type[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTypeId, setDeleteTypeId] = useState<number | null>(null);
  const [viewType, setViewType] = useState<Type | null>(null);
  const [editType, setEditType] = useState<Type | null>(null);
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

  const { request: fetchTypes, loading: fetchLoading } =
    useApiRequest<TypeApiResponse>();

  const { request: fetchSingleType } = useApiRequest<TypeApiResponse>();

  useEffect(() => {
    loadTypes();
  }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

  const loadTypes = async () => {
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

      const result = await fetchTypes({
        url: `/api/admin/cars/types?${params.toString()}`,
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setTypes(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
          setHasNext(result.pagination.hasNext);
          setHasPrev(result.pagination.hasPrev);
        }
      } else {
        toast.error(result?.error || "Failed to fetch types");
      }
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error("Failed to fetch types");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Type | "buildsCount") => {
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

  const handleViewType = async (type: Type) => {
    try {
      const result = await fetchSingleType({
        url: `/api/admin/cars/types?id=${type.id}&includeBuilds=true`,
        options: { method: "GET" },
      });

      if (result && !Array.isArray(result.data)) {
        setViewType(result.data as Type);
      } else {
        toast.error("Failed to fetch type details");
      }
    } catch (error) {
      console.error("Error fetching type details:", error);
      toast.error("Failed to fetch type details");
    }
  };

  const handleEditType = (type: Type) => {
    setEditType(type);
  };

  const handleDeleteType = (typeId: number) => {
    setDeleteTypeId(typeId);
  };

  const getSortIcon = (field: keyof Type | "buildsCount") => {
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

  return (
    <div className="bg-dark-100">
      <div className="mx-auto">
        <PageHeader
          heading="Car Model Types"
          describe="Manage car model types and view their associated builds"
          button={
            <div className="flex gap-3">
              {/* <BulkUploadTypes loadTypes={() => loadTypes()} /> */}
              <CreateType loadTypes={() => loadTypes()} />
            </div>
          }
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <FormField
              name="search"
              type="text"
              placeholder="Search types..."
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
                    {typesColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-6 py-3 ${col.align} text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans`}
                      >
                        {col.sortable ? (
                          <button
                            onClick={() => handleSort(col.key as keyof Type)}
                            className="flex items-center gap-2 hover:text-light-100"
                          >
                            {col.label}
                            {getSortIcon(col.key as keyof Type)}
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {types.length === 0 && !fetchLoading ? (
                    <EmptyTableUi
                      heading="No types found"
                      description="Try adjusting your search criteria or add a new type."
                    />
                  ) : (
                    types.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-5/10">
                        <td className="px-6 py-4">
                          {type.image ? (
                            <Image
                              src={
                                typeof type.image == "object" && type.image
                                  ? type.image?.url
                                  : ""
                              }
                              alt={type.name}
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
                            {type.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-light-100 font-sofia-sans">
                            {type.model?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                              type.status
                            )}`}
                          >
                            {type.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-light-100 font-sofia-sans">
                          {type._count?.builds || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-light-100 font-sofia-sans">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-4" />
                            {formatDate(type.createdAt)}
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
                                  onClick={() => handleViewType(type)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                                  onClick={() => handleEditType(type)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                                  onClick={() => handleDeleteType(type.id)}
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
              {types.length === 0 && !fetchLoading ? (
                <table>
                  <tbody>
                    <EmptyTableUi
                      heading="No types found"
                      description="Try adjusting your search criteria or add a new type."
                    />
                  </tbody>
                </table>
              ) : (
                types.map((type) => (
                  <div
                    key={type.id}
                    className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {type.image ? (
                        <Image
                          src={
                            typeof type.image == "object" && type.image
                              ? type.image?.url
                              : ""
                          }
                          alt={type.name}
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
                          {type.name}
                        </div>
                        <div className="text-xs text-gray-4">
                          {type.model?.name || "N/A"} • {type.status === "active" ? "Active" : "Inactive"}
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
                              onClick={() => handleViewType(type)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                              onClick={() => handleEditType(type)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                              onClick={() => handleDeleteType(type.id)}
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
                      <span>{type._count?.builds || 0} builds</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(type.createdAt)}
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

        {editType && (
          <EditType
            type={editType}
            loadTypes={loadTypes}
            setPopup={() => setEditType(null)}
          />
        )}
        {viewType && (
          <ViewType
            setShowCreateModal={() => setViewType(null)}
            showCreateModal={Boolean(viewType)}
            viewType={viewType}
          />
        )}
        {deleteTypeId && (
          <DeleteType
            loadTypes={loadTypes}
            deleteTypeId={deleteTypeId}
            setDeleteTypeId={setDeleteTypeId}
          />
        )}
      </div>
    </div>
  );
};

export default TypesPage;