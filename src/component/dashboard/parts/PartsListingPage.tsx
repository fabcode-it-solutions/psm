// src/component/dashboard/parts/PartsListingPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Eye,
  Plus,
  Package,
  Download,
  Power,
  Archive,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { FormField } from "@/component/ui/dashboard/FormField";
import PageHeader from "@/component/dashboard/PageHeader";
import Image from "next/image";
import { getStatusBadge, formatDate } from "@/utils/defaults";
import ItemsPerPageOptions from "@/component/global/ItemsPerPageOptions";
import FilterBar from "./listing/FilterBar";
import Delete from "./listing/Delete";
import Pagination from "@/component/ui/dashboard/Pagination";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import SortByDropdown from "./listing/SortByDropDown";
import ModerationReviewPopup from "@/component/products/ModerationModal";

interface Part {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: "review" | "active" | "archived";
  price: number;
  compareAtPrice?: number;
  inventory: number;
  sku: string;
  category?: string;
  featuredImage: string;
  featuredImageAlt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  inventoryStatus?: string;
  demandScore?: number;
  restockRequestCount?: number;
  wishlistCount?: number;
  inquiryCount?: number;
  subscriberCount?: number;
  restockCount?: string;
  moderationStatus?: "clean" | "flagged" | "reviewed" | "rejected" | "hidden";
}

interface Stats {
  totalParts: number;
  partsWithRequests: number;
  totalRequests: number;
  activeSubscribers: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
  byStatus: Record<string, number>;
}

interface Filters {
  search: string;
  status: string;
  category: string;
  inventoryStatus: string;
  dateRange: string;
}

interface ModerationFlag {
  id: number;
  partId: number;
  reason: string;
  reasonLabel: string;
  severity: "low" | "medium" | "high";
  notes?: string;
  flaggedBy: string;
  flaggedAt: string;
}

type BulkActionType = "activate" | "deactivate" | "delete" | "export" | null;

const PartsListingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [deletePartId, setDeletePartId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [mockParts, setMockParts] = useState<Part[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalParts: 0,
    partsWithRequests: 0,
    totalRequests: 0,
    activeSubscribers: 0,
    outOfStock: 0,
    lowStock: 0,
    inStock: 0,
    byStatus: {},
  });
  const [pagination, setPagination] = useState<{
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }>({});
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    category: "",
    inventoryStatus: "",
    dateRange: "",
  });
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [confirmationAction, setConfirmationAction] =
    useState<BulkActionType>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Moderation States
  const [showModerationPopup, setShowModerationPopup] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<ModerationFlag | null>(null);
  const [selectedPartTitle, setSelectedPartTitle] = useState("");

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/parts/stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch parts
  const getParts = async ({
    currentPage,
    itemsPerPage,
    searchTerm,
    status,
    inventoryStatus,
    categoryId,
    dateRange,
    sortBy,
    sortOrder,
  }: {
    currentPage?: number;
    itemsPerPage?: number;
    searchTerm?: string;
    status?: string;
    inventoryStatus?: string;
    categoryId?: number;
    dateRange?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (currentPage) params.append("page", currentPage.toString());
      if (itemsPerPage) params.append("limit", itemsPerPage.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (status) params.append("status", status);
      if (inventoryStatus) params.append("inventoryStatus", inventoryStatus);
      if (categoryId) params.append("categoryId", categoryId.toString());
      if (dateRange) params.append("dateRange", dateRange);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/parts/admin?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch parts");
      }

      const result = await response.json();

      if (result.success) {
        setPagination(result.pagination);
        setMockParts(result.data);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
      toast.error("Failed to load parts");
    } finally {
      setLoading(false);
    }
  };

  // Check if a part has pending flags
  const checkPartFlags = async (partId: number) => {
    try {
      const response = await fetch(`/api/parts/${partId}/moderate`);
      const result = await response.json();

      if (result.success && result.flags?.length > 0) {
        return result.flags[0];
      }
      return null;
    } catch (error) {
      console.error("Error checking flags:", error);
      return null;
    }
  };
  const handleModerateClick = async (part: Part) => {
    const flag = await checkPartFlags(part.id);

    if (flag) {
      setSelectedFlag(flag);
      setSelectedPartTitle(part.title);
      setShowModerationPopup(true);
    } else {
      toast.error("No pending flags found for this part");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    getParts({
      currentPage,
      itemsPerPage,
      searchTerm: filters.search,
      categoryId: filters.category ? parseInt(filters.category) : undefined,
      dateRange: filters.dateRange,
      inventoryStatus: filters.inventoryStatus,
      status: filters.status,
      sortBy,
      sortOrder,
    });
  }, [currentPage, itemsPerPage, filters, sortBy, sortOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const handleSelectPart = (partId: number) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSelectAll = () => {
    const visiblePartIds = mockParts.map((part) => part.id);
    setSelectedParts((prev) =>
      prev.length === visiblePartIds.length ? [] : visiblePartIds
    );
  };

  const handleDeletePart = (partId: number) => {
    setDeletePartId(partId);
  };

  const getFilters = (filters: Filters) => {
    setFilters(filters);
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleBulkAction = (action: BulkActionType) => {
    if (selectedParts.length === 0) {
      toast.error("Please select at least one part");
      return;
    }

    if (action === "export") {
      handleBulkExport();
      return;
    }

    setConfirmationAction(action);
  };

  const executeBulkAction = async () => {
    if (!confirmationAction) return;

    try {
      setBulkActionLoading(true);

      switch (confirmationAction) {
        case "activate":
          await handleBulkStatusChange("active");
          break;
        case "deactivate":
          await handleBulkStatusChange("archived");
          break;
        case "delete":
          await handleBulkDelete();
          break;
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Failed to perform bulk action");
    } finally {
      setBulkActionLoading(false);
      setConfirmationAction(null);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch("/api/parts/bulk/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partIds: selectedParts,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully ${
            newStatus === "active" ? "activated" : "deactivated"
          } ${selectedParts.length} part(s)`
        );
        setSelectedParts([]);
        fetchStats();
        getParts({
          currentPage,
          itemsPerPage,
          searchTerm: filters.search,
          categoryId: filters.category ? parseInt(filters.category) : undefined,
          dateRange: filters.dateRange,
          inventoryStatus: filters.inventoryStatus,
          status: filters.status,
          sortBy,
          sortOrder,
        });
      } else {
        toast.error(result.error || "Failed to update parts");
      }
    } catch (error) {
      console.error("Status change error:", error);
      toast.error("Failed to update part status");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch("/api/parts/bulk/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partIds: selectedParts,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully deleted ${selectedParts.length} part(s)`);
        setSelectedParts([]);
        fetchStats();
        getParts({
          currentPage,
          itemsPerPage,
          searchTerm: filters.search,
          categoryId: filters.category ? parseInt(filters.category) : undefined,
          dateRange: filters.dateRange,
          inventoryStatus: filters.inventoryStatus,
          status: filters.status,
          sortBy,
          sortOrder,
        });
      } else {
        toast.error(result.error || "Failed to delete parts");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete parts");
    }
  };

  const handleBulkExport = async () => {
    try {
      const selectedPartsData = mockParts.filter((part) =>
        selectedParts.includes(part.id)
      );

      const headers = [
        "ID",
        "Title",
        "SKU",
        "Status",
        "Category",
        "Price",
        "Inventory",
        "Demand Score",
        "Restock Requests",
        "Subscribers",
        "Created At",
      ];
      const csvContent = [
        headers.join(","),
        ...selectedPartsData.map((part) =>
          [
            part.id,
            `"${part.title}"`,
            part.sku || "",
            part.status,
            `"${part.category || ""}"`,
            part.price,
            part.inventory,
            part.demandScore || 0,
            part.restockRequestCount || 0,
            part.subscriberCount || 0,
            new Date(part.createdAt).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parts-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedParts.length} part(s) to CSV`);
      setSelectedParts([]);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export parts");
    }
  };

  const getConfirmationContent = () => {
    const count = selectedParts.length;

    switch (confirmationAction) {
      case "activate":
        return {
          heading: "Activate Parts",
          content: `Are you sure you want to activate ${count} part(s)? They will be visible in the marketplace.`,
          actionLabel: "Activate",
        };
      case "deactivate":
        return {
          heading: "Deactivate Parts",
          content: `Are you sure you want to deactivate ${count} part(s)? They will be archived and hidden from the marketplace.`,
          actionLabel: "Deactivate",
        };
      case "delete":
        return {
          heading: "Delete Parts",
          content: `Are you sure you want to delete ${count} part(s)? This action cannot be undone and will permanently remove all associated data.`,
          actionLabel: "Delete",
        };
      default:
        return {
          heading: "",
          content: "",
          actionLabel: "Confirm",
        };
    }
  };
const renderModerationBadge = (status?: string) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase(); // ✅ FIX

  if (normalizedStatus === "clean") return null;

  const badgeConfig = {
    flagged: {
      icon: Shield,
      text: "Flagged",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    reviewed: {
      icon: CheckCircle,
      text: "Approved",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    rejected: {
      icon: XCircle,
      text: "Rejected",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    hidden: {
      icon: AlertTriangle,
      text: "Hidden",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  };

  const config = badgeConfig[normalizedStatus as keyof typeof badgeConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};


  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParts = mockParts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-dark-100">
      <div className="">
        <PageHeader
          heading="Parts Management"
          describe="Manage your auto parts inventory, pricing, and product information"
          button={
            <div className="flex gap-2">
              <Link
                href="/dashboard/parts/create"
                className="flex items-center gap-2 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Part
              </Link>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-4 font-sofia-sans">
                  Total Parts
                </p>
                <p className="text-3xl font-bold text-light-100 mt-2">
                  {statsLoading ? "..." : stats.totalParts}
                </p>
                <div className="flex gap-2 mt-2 text-xs font-sofia-sans">
                  <span className="text-green-400">
                    ● {stats.byStatus?.active || 0} Active
                  </span>
                  <span className="text-gray-4">
                    ● {stats.byStatus?.archived || 0} Draft
                  </span>
                </div>
              </div>
              <div className="p-3 bg-accent-100/20 rounded-lg">
                <Package className="w-6 h-6 text-accent-100" />
              </div>
            </div>
          </div>

          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-4 font-sofia-sans">
                  Restock Requests
                </p>
                <p className="text-3xl font-bold text-light-100 mt-2">
                  {statsLoading ? "..." : stats.totalRequests}
                </p>
                <p className="text-xs text-gray-4 mt-2 font-sofia-sans">
                  {stats.partsWithRequests} parts affected
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-4 w-4 h-4" />
                  <FormField
                    type="text"
                    placeholder="Search parts by name or SKU..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    name="search"
                    inputStyle="pl-10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <SortByDropdown
                  onSortChange={handleSortChange}
                  currentSort={{ field: sortBy, order: sortOrder }}
                />
                <ItemsPerPageOptions
                  onValueChange={(e) => {
                    setCurrentPage(1);
                    setItemsPerPage(e);
                  }}
                />
                <FilterBar onChangeFilter={(filter) => getFilters(filter)} />
              </div>
            </div>
          </div>

          {selectedParts.length > 0 && (
            <div className="bg-yellow-400/10 border-2 border-yellow-400/40 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-light-100 font-sofia-sans">
                    {selectedParts.length} part(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedParts([])}
                    className="text-xs text-gray-4 hover:text-light-100 transition-colors font-sofia-sans underline"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                  >
                    <Power className="w-4 h-4" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("export")}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-sofia-sans text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-5/5 border-b border-gray-5/20">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedParts.length === paginatedParts.length &&
                          paginatedParts.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-5/40 bg-dark-100 cursor-pointer text-accent-100"
                      />
                    </th>
                    {[
                      { key: "title", label: "Product" },
                      { key: "status", label: "Status" },
                      { key: "category", label: "Category" },
                      { key: "price", label: "Price" },
                      { key: "inventory", label: "Inventory" },
                      { key: "demand", label: "Demand" },
                      { key: "updatedAt", label: "Last Updated" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans"
                      >
                        {label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-gray-4 font-sofia-sans"
                      >
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-100"></div>
                          <span className="ml-2 font-sofia-sans">
                            Loading parts...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedParts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-4 mx-auto mb-4" />
                        <p className="text-gray-4 font-sofia-sans">
                          {filters.search ||
                          Object.values(filters).some((v) => v !== "")
                            ? "No parts found matching your criteria"
                            : "No parts created yet"}
                        </p>
                        <p className="text-gray-5 text-sm font-sofia-sans mt-1">
                          {filters.search ||
                          Object.values(filters).some((v) => v !== "")
                            ? "Try adjusting your search or filters"
                            : "Create your first part to get started"}
                        </p>
                        {!filters.search &&
                          !Object.values(filters).some((v) => v !== "") && (
                            <Link
                              href="/dashboard/parts/create"
                              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 font-sofia-sans font-medium transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Create Your First Part
                            </Link>
                          )}
                      </td>
                    </tr>
                  ) : (
                    paginatedParts.map((part) => {
                      const isSelected = selectedParts.includes(part.id);

                      return (
                        <tr
                          key={part.id}
                          className="hover:bg-gray-5/5 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectPart(part.id)}
                              className="w-4 h-4 rounded border-gray-5/40 bg-dark-100 cursor-pointer text-accent-100"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-5/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                {part.featuredImage ? (
                                  <Image
                                    src={part.featuredImage || ""}
                                    alt={part.featuredImageAlt || part.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-center object-cover rounded-lg border border-gray-5/20"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-4" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-light-100 font-sofia-sans truncate">
                                  {part.title}
                                </p>
                                {part.sku && (
                                  <p className="text-xs text-gray-4 font-sofia-sans truncate">
                                    SKU: {part.sku}
                                  </p>
                                )}

                                {/* ✅ FIXED: Display all moderation states */}
                                <div className="flex gap-2 mt-1">
                                  {part.status === "active" && (
                                    <span className="text-xs text-green-400 font-sofia-sans">
                                      on sale
                                    </span>
                                  )}
                                  {renderModerationBadge(part.moderationStatus)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-sofia-sans ${getStatusBadge(
                                part.status
                              )}`}
                            >
                              {part.status.charAt(0).toUpperCase() +
                                part.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-light-100 font-sofia-sans">
                              {part.category || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-light-100 font-sofia-sans">
                              $
                              {part.price
                                ? Number(part.price).toLocaleString()
                                : "0.00"}
                            </div>
                            {part.compareAtPrice && (
                              <div className="text-xs text-gray-4 line-through font-sofia-sans">
                                ${Number(part.compareAtPrice).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-light-100 font-sofia-sans">
                              {part.inventory || 0} units
                            </div>
                            <div
                              className={`text-xs font-sofia-sans ${
                                part.inventory > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {part.inventory > 0 ? "In Stock" : "Out of Stock"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              {(part.restockRequestCount || 0) > 0 && (
                                <div className="flex items-center gap-1 text-orange-400">
                                  <Bell className="w-3 h-3" />
                                  <span className="text-xs font-sofia-sans">
                                    {part.restockRequestCount} request
                                    {part.restockRequestCount !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-light-100 font-sofia-sans">
                              {formatDate(part.updatedAt)}
                            </div>
                            <div className="text-xs text-gray-4 font-sofia-sans">
                              Created {formatDate(part.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
     

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button className="p-2 text-gray-4 hover:text-light-100 transition-colors">
      <MoreHorizontal className="w-4 h-4" />
    </button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      className="min-w-[160px] bg-dark-100 border border-gray-5/20 rounded-lg shadow-lg p-1 z-50"
      sideOffset={5}
    >
      <DropdownMenu.Item className="flex relative items-center gap-2 px-3 py-2 text-sm text-light-100 hover:bg-gray-5/10 rounded cursor-pointer font-sofia-sans">
        <Eye className="w-4 h-4" />
        View Details
        <Link
          className="absolute top-0 left-0 w-full h-full"
          href={`/dashboard/parts/view/${part.id}`}
        />
      </DropdownMenu.Item>
      <DropdownMenu.Item className="flex relative items-center gap-2 px-3 py-2 text-sm text-light-100 hover:bg-gray-5/10 rounded cursor-pointer font-sofia-sans">
        <Edit className="w-4 h-4" />
        Edit Part
        <Link
          className="absolute top-0 left-0 w-full h-full"
          href={`/dashboard/parts/edit/${part.slug}`}
        />
      </DropdownMenu.Item>
      <DropdownMenu.Item className="flex relative items-center gap-2 px-3 py-2 text-sm text-light-100 hover:bg-gray-5/10 rounded cursor-pointer font-sofia-sans">
        <Package className="w-4 h-4" />
        Create a Listing
        <Link
          className="absolute top-0 left-0 w-full h-full"
          href={`/dashboard/parts/listings/create?template=${part.slug}`}
        />
      </DropdownMenu.Item>

      {/* ✅ FIXED: Show for ALL moderation states except 'clean' */}
      {part.moderationStatus && part.moderationStatus !== "clean" && (
        <>
          <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
          <DropdownMenu.Item
            onClick={() => handleModerateClick(part)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10 rounded cursor-pointer font-sofia-sans"
          >
            <Shield className="w-4 h-4" />
            {/* ✅ Dynamic text based on status */}
            {part.moderationStatus === "flagged" 
              ? "Review Flag" 
              : "View Moderation History"}
          </DropdownMenu.Item>
        </>
      )}

      <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
      <DropdownMenu.Item
        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded cursor-pointer font-sofia-sans"
        onClick={() => handleDeletePart(part.id)}
      >
        <Trash2 className="w-4 h-4" />
        Delete Part
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            hasNext={pagination.hasNext!}
            hasPrev={pagination.hasPrev!}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            totalItems={pagination.totalItems!}
            totalPages={pagination.totalPages!}
          />
        </div>

        {deletePartId && (
          <Delete
            loads={() => {
              getParts({});
              fetchStats();
            }}
            deleteId={deletePartId}
            setdeleteId={(v) => setDeletePartId(v)}
          />
        )}

        {confirmationAction && (
          <DeleteConfirmationDialog
            deleteBrandId={confirmationAction ? 1 : null}
            setDeleteBrandId={() => setConfirmationAction(null)}
            confirmDelete={executeBulkAction}
            deleteLoading={bulkActionLoading}
            {...getConfirmationContent()}
          />
        )}

        {showModerationPopup && selectedFlag && (
          <ModerationReviewPopup
            open={showModerationPopup}
            setOpen={setShowModerationPopup}
            flag={selectedFlag}
            partTitle={selectedPartTitle}
            onActionComplete={() => {
              getParts({
                currentPage,
                itemsPerPage,
                searchTerm: filters.search,
                categoryId: filters.category
                  ? parseInt(filters.category)
                  : undefined,
                dateRange: filters.dateRange,
                inventoryStatus: filters.inventoryStatus,
                status: filters.status,
                sortBy,
                sortOrder,
              });
              fetchStats();
            }}
          />
        )}
      </div>
    </div>
  );
};
export default PartsListingPage;
