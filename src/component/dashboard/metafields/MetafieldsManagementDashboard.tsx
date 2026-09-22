/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Edit, Trash2, Settings, Search, Filter } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import toast from "react-hot-toast";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import {
  CreateMetafieldDefinition,
  ENTITY_TYPES,
  MetafieldDefinition,
  NAMESPACES,
} from "@/types/metafield.types";
import PageHeader from "@/component/dashboard/PageHeader";
import { RootState } from "@/libs/redux/store";
import { useSelector } from "react-redux";
import MetafieldCreateUpdate from "@/component/dashboard/metafields/MetafieldCreateUpdate";
import Pagination from "@/component/ui/dashboard/Pagination";

const MetafieldsManagementDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user?.user);
  const [definitions, setDefinitions] = useState<MetafieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDefinition, setEditingDefinition] =
    useState<MetafieldDefinition | null>(null);
  const [deleteDefinitionId, setDeleteDefinitionId] = useState<number | null>(
    null
  );
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toastIdRef = useRef<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const handleItemsPerPageChange = (value: string) => {
    setLimit(Number(value));
  };
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search changes
      if (searchTerm !== debouncedSearchTerm) {
        setPage(1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Delete loading toast
  useEffect(() => {
    if (deleteLoading) {
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading("Deleting...");
      }
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [deleteLoading]);

  const [formData, setFormData] = useState<CreateMetafieldDefinition>({
    entityType: "part",
    namespace: "custom",
    key: "",
    name: "",
    description: "",
    type: "text",
    isRequired: false,
    isSearchable: false,
    isPublic: true,
    displayOrder: 0,
    options: [],
    categories: [],
  });

  // Fetch metafield definitions with pagination
  const fetchDefinitions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (selectedEntityType) params.append("entityType", selectedEntityType);
      if (selectedNamespace) params.append("namespace", selectedNamespace);
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const response = await fetch(`/api/metafields/definitions?${params}`);
      const data = await response.json();

      if (data.success) {
        setDefinitions(data.data);

        // Update pagination info
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
          setHasMore(data.pagination.hasMore);
        }
      } else {
        toast.error("Failed to fetch metafield definitions");
      }
    } catch (error) {
      toast.error("Error fetching metafield definitions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedEntityType, selectedNamespace, debouncedSearchTerm]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedEntityType, selectedNamespace]);

  // Delete metafield definition
  const handleDeleteDefinition = async (id: number) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/metafields/definitions?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Definition deleted successfully");
        fetchDefinitions();
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to delete definition");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the definition");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
    setDeleteDefinitionId(null);
  };

  // Handle edit
  const handleEdit = (definition: MetafieldDefinition) => {
    setEditingDefinition(definition);
    setFormData({
      entityType: definition.entityType,
      namespace: definition.namespace,
      key: definition.key,
      name: definition.name,
      description: definition.description || "",
      type: definition.type,
      validationRules: definition.validationRules,
      defaultValue: definition.defaultValue || "",
      placeholder: definition.placeholder || "",
      helpText: definition.helpText || "",
      isRequired: definition.isRequired,
      isSearchable: definition.isSearchable,
      isPublic: definition.isPublic,
      displayOrder: definition.displayOrder,
      settings: definition.settings,
      options: definition.options || [],
      id: definition.id,
      categories: definition?.categories,
      categoryIds: definition?.categoryIds,
    });
    setShowCreateModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
      case "rich_text":
        return "bg-blue-500/20 text-blue-400";
      case "number":
      case "boolean":
        return "bg-purple-500/20 text-purple-400";
      case "select":
      case "multiselect":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Metafields"
        describe="Define custom fields for your entities"
        button={
          <MetafieldCreateUpdate
            editingDefinition={false}
            fetchDefinitions={fetchDefinitions}
          />
        }
      />

      {/* Search and Filters */}
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-1 justify-between w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-4 w-4 h-4" />
              <input
                type="text"
                placeholder="Search metafields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-5/10 border border-gray-5/20 rounded-lg text-light-100 placeholder-gray-4 focus:ring-1 focus:ring-accent-100 focus:border-transparent font-sofia-sans"
              />
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-100"></div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-gray-5/10 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="font-sofia-sans">Filters</span>
                {(selectedEntityType || selectedNamespace) && (
                  <span className="ml-1 px-2 py-0.5 bg-accent-100/20 text-accent-100 rounded-full text-xs font-sofia-sans">
                    {
                      [selectedEntityType, selectedNamespace].filter(Boolean)
                        .length
                    }
                  </span>
                )}
              </button>
              <div className="flex gap-2 max-mb-xl:hidden">
                <Dropdown
                  options={[
                    { value: "20", label: "20 per page" },
                    { value: "50", label: "50 per page" },
                    { value: "75", label: "75 per page" },
                    { value: "100", label: "100 per page" },
                  ]}
                  onValueChange={handleItemsPerPageChange}
                  placeholder="Items per page"
                />
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-5/20">
            <div className="grid grid-cols-1  gap-4">
              <Dropdown
                label="Entity Type"
                options={ENTITY_TYPES}
                onValueChange={setSelectedEntityType}
                placeholder="Select entity type"
              />
            </div>

            {/* Clear Filters */}
            {(selectedEntityType || selectedNamespace) && (
              <button
                onClick={() => {
                  setSelectedEntityType("");
                  setSelectedNamespace("");
                }}
                className="mt-3 text-sm text-accent-100 hover:text-accent-100/80 font-sofia-sans"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metafields Table */}
      <div className="bg-dark-100 border border-gray-5/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-5/5 border-b border-gray-5/20">
              <tr>
                {["Field", "Type", "Entity", "Namespace", "Actions"].map(
                  (item) => (
                    <th
                      key={item}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-4 uppercase tracking-wider font-sofia-sans"
                    >
                      {item}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-5/20">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-4 font-sofia-sans"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-100"></div>
                      <span className="ml-2">Loading metafields...</span>
                    </div>
                  </td>
                </tr>
              ) : definitions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-4 font-sofia-sans"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg">No metafield definitions found</p>
                      {(searchTerm ||
                        selectedEntityType ||
                        selectedNamespace) && (
                        <p className="text-sm">
                          Try adjusting your filters or search term
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                definitions.map((definition) => (
                  <tr key={definition.id} className="hover:bg-gray-5/5">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-light-100 font-medium font-sofia-sans">
                          {definition.name}
                        </span>
                        <span className="text-gray-4 text-sm font-sofia-sans">
                          {definition.key}
                        </span>
                        {definition.description && (
                          <span className="text-gray-4 text-xs mt-1 font-sofia-sans">
                            {definition.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full capitalize text-xs font-medium ${getTypeColor(
                          definition.type
                        )} font-sofia-sans`}
                      >
                        {definition.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-light-100 font-sofia-sans capitalize">
                      {definition.entityType}
                    </td>
                    <td className="px-4 py-3 text-light-100 font-sofia-sans capitalize">
                      {definition.namespace}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 text-gray-4 hover:text-light-100 hover:bg-gray-5/10 rounded">
                            <Settings className="w-4 h-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="bg-dark-100 border border-gray-5/20 rounded-lg shadow-lg p-1 min-w-[120px] z-50"
                            sideOffset={5}
                          >
                            <DropdownMenu.Item
                              onClick={() => handleEdit(definition)}
                              className="flex items-center gap-2 px-3 py-2 text-light-100 hover:bg-accent-100/10 cursor-pointer rounded font-sofia-sans"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-5/20 my-1" />
                            <DropdownMenu.Item
                              onClick={() =>
                                setDeleteDefinitionId(definition.id)
                              }
                              className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 cursor-pointer rounded font-sofia-sans"
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

        {/* Pagination */}
        <Pagination
          currentPage={page}
          hasNext={hasMore}
          hasPrev={page > 1}
          itemsPerPage={limit}
          setCurrentPage={(page) => setPage(page)}
          totalItems={total}
          totalPages={totalPages}
        />
      </div>

      {/* Create/Edit Modal */}
      <MetafieldCreateUpdate
        editingDefinition={true}
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingDefinition(null);
        }}
        fetchDefinitions={fetchDefinitions}
        existingData={formData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={deleteDefinitionId !== null}
        onOpenChange={() => setDeleteDefinitionId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-100 border border-gray-5/20 rounded-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-audiowide text-light-100 mb-2">
              Delete Metafield Definition
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-4 font-sofia-sans mb-6">
              Are you sure you want to delete this metafield definition? This
              will also delete all associated values and cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() =>
                    deleteDefinitionId &&
                    handleDeleteDefinition(deleteDefinitionId)
                  }
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-sofia-sans disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default MetafieldsManagementDashboard;
