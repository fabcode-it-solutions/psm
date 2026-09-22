/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  Manufacturer,
  ManufacturerApiResponse,
  SortConfig,
} from "@/types/manufacturers.types";
import CreateManufacturer from "./CreateManufacturer";
import DeleteManufacturer from "./DeleteManufacturer";
import ViewManufacturer from "./ViewManufacturer";
import EditManufacturer from "./EditManufacturer";

const ManufacturersPage: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteManufacturerId, setDeleteManufacturerId] = useState<
    number | null
  >(null);
  const [viewManufacturer, setViewManufacturer] = useState<Manufacturer | null>(
    null
  );
  const [editManufacturer, setEditManufacturer] = useState<Manufacturer | null>(
    null
  );
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

  const { request: fetchManufacturers, loading: fetchLoading } =
    useApiRequest<ManufacturerApiResponse>();

  const { request: fetchSingleManufacturer } =
    useApiRequest<ManufacturerApiResponse>();

  useEffect(() => {
    loadManufacturers();
  }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

  const loadManufacturers = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      if (searchTerm) params.append("search", searchTerm);
      params.append("sortBy", sortConfig.field);
      params.append("sortOrder", sortConfig.direction);

      const result = await fetchManufacturers({
        url: `/api/admin/cars/manufacturers?${params.toString()}`,
        options: { method: "GET" },
      });

      if (result?.success && Array.isArray(result.data)) {
        setManufacturers(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
          setHasNext(result.pagination.hasNext);
          setHasPrev(result.pagination.hasPrev);
        }
      } else {
        toast.error(result?.error || "Failed to fetch manufacturers");
      }
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      toast.error("Failed to fetch manufacturers");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Manufacturer) => {
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

  const handleViewManufacturer = async (manufacturer: Manufacturer) => {
    try {
      const result = await fetchSingleManufacturer({
        url: `/api/admin/cars/manufacturers?id=${manufacturer.id}`,
        options: { method: "GET" },
      });

      if (result && !Array.isArray(result.data)) {
        setViewManufacturer(result.data as Manufacturer);
      } else {
        toast.error("Failed to fetch manufacturer details");
      }
    } catch (error) {
      console.error("Error fetching manufacturer details:", error);
      toast.error("Failed to fetch manufacturer details");
    }
  };

  const handleEditManufacturer = (manufacturer: Manufacturer) => {
    setEditManufacturer(manufacturer);
  };

  const handleDeleteManufacturer = (manufacturerId: number) => {
    setDeleteManufacturerId(manufacturerId);
  };

  const getSortIcon = (field: keyof Manufacturer) => {
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

  const manufacturerColumns = [
    { key: "logo", label: "Logo", align: "text-left", sortable: false },
    { key: "name", label: "Name", align: "text-left", sortable: true },
    { key: "subTitle", label: "Subtitle", align: "text-left", sortable: true },
    { key: "status", label: "Status", align: "text-left", sortable: true },
    { key: "createdAt", label: "Created", align: "text-left", sortable: true },
    { key: "actions", label: "Actions", align: "text-right", sortable: false },
  ]; 
  return (
    <div className="bg-dark-100">
      <div className="mx-auto">
        <PageHeader
          heading="Manufacturers"
          describe="Manage manufacturers and view their associated products"
          button={
            <div className="flex gap-3">
              <CreateManufacturer
                loadManufacturers={() => loadManufacturers()}
              />
            </div>
          }
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
          <div className="flex-1">
            <FormField
              name="search"
              type="text"
              placeholder="Search manufacturers..."
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
                    {manufacturerColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-6 py-3 ${col.align} text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans`}
                      >
                        {col.sortable ? (
                          <button
                            onClick={() =>
                              handleSort(col.key as keyof Manufacturer)
                            }
                            className="flex items-center gap-2 hover:text-light-100"
                          >
                            {col.label}
                            {getSortIcon(col.key as keyof Manufacturer)}
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {manufacturers.length === 0 && !fetchLoading ? (
                    <EmptyTableUi
                      heading="No manufacturers found"
                      description="Try adjusting your search criteria or add a new manufacturer."
                    />
                  ) : (
                    manufacturers.map((manufacturer) => (
                      <tr key={manufacturer.id} className="hover:bg-gray-5/10">
                        <td className="px-6 py-4">
                          {manufacturer.logo ? (
                            <Image
                              src={
                                typeof manufacturer.logo === "object" &&
                                manufacturer.logo
                                  ? manufacturer.logo.url
                                  : manufacturer.logoUrl || ""
                              }
                              alt={manufacturer.name}
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
                            {manufacturer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-light-100 font-sofia-sans">
                            {manufacturer.subTitle || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                              manufacturer.status
                            )}`}
                          >
                            {manufacturer.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-light-100 font-sofia-sans">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-4" />
                            {formatDate(String(manufacturer.createdAt))}
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
                                  onClick={() =>
                                    handleViewManufacturer(manufacturer)
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                                  onClick={() =>
                                    handleEditManufacturer(manufacturer)
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                                  onClick={() =>
                                    handleDeleteManufacturer(manufacturer.id)
                                  }
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

            {/* Mobile View */}
            <div className="max-tab-lg:block hidden space-y-4">
              {manufacturers.length === 0 && !fetchLoading ? (
                <table>
                  <tbody>
                    <EmptyTableUi
                      heading="No manufacturers found"
                      description="Try adjusting your search criteria or add a new manufacturer."
                    />
                  </tbody>
                </table>
              ) : (
                manufacturers.map((manufacturer) => (
                  <div
                    key={manufacturer.id}
                    className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {manufacturer.logo ? (
                        <Image
                          src={
                            typeof manufacturer.logo === "object" &&
                            manufacturer.logo
                              ? manufacturer.logo.url
                              : manufacturer.logoUrl || ""
                          }
                          alt={manufacturer.name}
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
                          {manufacturer.name}
                        </div>
                        <div className="text-sm text-gray-4 font-sofia-sans">
                          {manufacturer.subTitle || "No subtitle"}
                        </div>
                        <div className="text-xs text-gray-4">
                          {manufacturer.status === "active"
                            ? "Active"
                            : "Inactive"}
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
                              onClick={() =>
                                handleViewManufacturer(manufacturer)
                              }
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-5/10 rounded cursor-pointer text-light-100 font-sofia-sans"
                              onClick={() =>
                                handleEditManufacturer(manufacturer)
                              }
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded cursor-pointer font-sofia-sans"
                              onClick={() =>
                                handleDeleteManufacturer(manufacturer.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>

                    {/* Created date */}
                    <div className="mt-3 flex justify-end text-sm text-gray-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(String(manufacturer.createdAt))}
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

        {editManufacturer && (
          <EditManufacturer
            manufacturer={editManufacturer}
            loadManufacturers={loadManufacturers}
            setPopup={() => setEditManufacturer(null)}
          />
        )}
        {viewManufacturer && (
          <ViewManufacturer
            setShowCreateModal={() => setViewManufacturer(null)}
            showCreateModal={Boolean(viewManufacturer)}
            viewManufacturer={viewManufacturer}
          />
        )}
        {deleteManufacturerId && (
          <DeleteManufacturer
            loadManufacturers={loadManufacturers}
            deleteManufacturerId={deleteManufacturerId}
            setDeleteManufacturerId={setDeleteManufacturerId}
          />
        )}
      </div>
    </div>
  );
};

export default ManufacturersPage;
