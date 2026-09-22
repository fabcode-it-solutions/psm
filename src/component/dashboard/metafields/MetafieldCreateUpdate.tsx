/**
 * Metafield Create/Update Component - Updated with Category Support
 *
 * Australian Developer Standards:
 * - Clean component structure
 * - Type safety
 * - Proper state management
 * - Accessible UI
 *
 * @component MetafieldCreateUpdate
 * @version 2.0.0
 */

import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TextArea } from "@/component/ui/dashboard/TextArea";
import {
  CreateMetafieldDefinition,
  EntityType,
  ENTITY_TYPES,
  FIELD_TYPES,
  MetafieldOption,
  MetafieldType,
  NAMESPACES,
} from "@/types/metafield.types";
import React, { useState, useEffect, useRef } from "react";
import { Trash2, Info } from "lucide-react";
import { getSlug } from "@/utils/getSlug";
import DashboardButton from "@/component/ui/dashboard/DashboardButton";
import CheckboxRoot from "@/component/ui/Checkbox/CheckboxRoot";
import CheckboxWithLabel from "@/component/ui/Checkbox/CheckboxWithLabel";
import CategorySelector from "../parts/CategorySelector";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface MetafieldCreateUpdateProps {
  editingDefinition: boolean;
  existingData?: CreateMetafieldDefinition & {
    id?: number;
    categoryIds?: number[];
  };
  show?: boolean;
  onClose?: () => void;
  fetchDefinitions?: () => void;
}

const MetafieldCreateUpdate = ({
  editingDefinition,
  existingData,
  show,
  onClose,
  fetchDefinitions,
}: MetafieldCreateUpdateProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    CreateMetafieldDefinition & { categoryIds?: number[] }
  >({
    entityType: "part",
    namespace: "custom",
    key: "",
    name: "",
    description: "",
    type: "text",
    isRequired: true,
    isSearchable: true,
    isPublic: true,
    displayOrder: 0,
    options: [],
    appliesGlobally: true, // NEW: Default to global
    categoryIds: [], // NEW: Selected categories
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (show) {
     setShowCreateModal(show);
    }
  }, [show]);
  // Load existing data if editing
  useEffect(() => {
    if (existingData && editingDefinition) {
      setFormData({
        ...existingData,
        categoryIds: existingData.categoryIds || [],
      });
    }
  }, [existingData, editingDefinition]);

  // Add option for select fields
  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        {
          value: "",
          label: "",
          displayOrder: prev.options?.length || 0,
        },
      ],
    }));
  };

  // Remove option
  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  // Update option
  const updateOption = (
    index: number,
    field: keyof MetafieldOption,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      options:
        prev.options?.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        ) || [],
    }));
  };

  // Generate key from name
  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.key) {
      toast.error("Name and Key are required");

      return;
    }

    if (
      (formData.type === "select" || formData.type === "multiselect") &&
      (!formData.options || formData.options.length === 0)
    ) {
      toast.error("Options are required for select fields");
      return;
    }

    if (
      !formData.appliesGlobally &&
      (!formData.categoryIds || formData.categoryIds.length === 0)
    ) {
      toast.error(
        'Please select at least one category or enable "Apply to all categories"'
      );
      return;
    }
    setLoading(true);
    try {
      const url =
        editingDefinition && existingData?.id
          ? `/api/metafields/definitions`
          : "/api/metafields/definitions";

      const method = editingDefinition ? "PUT" : "POST";

      const payload = {
        ...formData,
        ...(editingDefinition && existingData?.id
          ? { id: existingData.id }
          : {}),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Metafield ${editingDefinition ? "updated" : "created"} successfully!`
        );
        handleClose();
        if (fetchDefinitions) {
          fetchDefinitions();
        }
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving metafield:", error);
      toast.error("Failed to save metafield definition");
    } finally {
      setLoading(false);
    }
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleClose = () => {
    setShowCreateModal(false);
    if (onClose) {
      onClose();
    }
  };
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      // show loading toast only once
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading(
          editingDefinition ? "Updating..." : "Creating..."
        );
      }
    } else {
      // dismiss only if toast exists
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [loading]);

  return (
    <>
      {!editingDefinition && (
        <DashboardButton
          buttonText="Add Definition"
          onClick={() => setShowCreateModal(true)}
        />
      )}
      <DialogPopup
        heading={
          editingDefinition
            ? "Edit Metafield Definition"
            : "Create Metafield Definition"
        }
        open={showCreateModal}
        setShowCreateModal={handleClose}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Name"
                type="text"
                name="name"
                required={true}
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name,
                    key: generateKey(name),
                  }));
                }}
                placeholder="Display name"
              />
              <FormField
                label="Key"
                type="text"
                name="key"
                required={true}
                value={formData.key}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, key: e.target.value }))
                }
                placeholder="field_key"
                pattern="[a-z0-9_]+"
                helpText="Only lowercase letters, numbers, and underscores"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Dropdown
                label="Entity Type *"
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    entityType: value as EntityType,
                  }))
                }
                options={ENTITY_TYPES}
                selectedText={formData.entityType}
              />

              <Dropdown
                label="Namespace"
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, namespace: value }))
                }
                options={NAMESPACES}
                selectedText={formData.namespace as string}
              />

              <Dropdown
                label="Field Type *"
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as MetafieldType,
                    options:
                      value === "select" || value === "multiselect"
                        ? []
                        : undefined,
                  }))
                }
                options={FIELD_TYPES}
                selectedText={formData.type}
              />
            </div>

            <div>
              <TextArea
                placeholder="Describe what this field is for..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormField
                  name="placeholder"
                  label="Placeholder"
                  type="text"
                  value={formData.placeholder || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      placeholder: e.target.value,
                    }))
                  }
                  placeholder="Enter placeholder text..."
                />
              </div>

              <div>
                <FormField
                  name="defaultValue"
                  label="Default Value"
                  type="text"
                  value={formData.defaultValue || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultValue: e.target.value,
                    }))
                  }
                  placeholder="Enter default value..."
                />
              </div>
            </div>

            <div>
              <FormField
                type="text"
                value={formData.helpText || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    helpText: e.target.value,
                  }))
                }
                name="helpText"
                label="Help Text"
                placeholder="Help text to show users..."
              />
            </div>

            {/* NEW: Category Selection Section */}
            {formData.entityType === "part" && (
              <div className="bg-gray-5/5 border border-gray-5/20 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-accent-100 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-light-100 font-sofia-sans mb-1">
                      Category Assignment
                    </h4>
                    <p className="text-xs text-gray-4 font-sofia-sans">
                      Choose whether this metafield applies to all categories or
                      specific ones
                    </p>
                  </div>
                </div>

                {/* Global Toggle */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckboxWithLabel
                      label="Apply to all categories"
                      onChecked={handleFormChange}
                      checked={formData.appliesGlobally}
                      name="appliesGlobally"
                      id="apply-to-all-categories"
                    />
                  </div>
                  <p className="text-xs text-gray-4 font-sofia-sans mt-1 ml-6">
                    {formData.appliesGlobally
                      ? "This metafield will show for all parts regardless of category"
                      : "This metafield will only show for selected categories"}
                  </p>
                </div>

                {/* Category Selection - Only show if not global */}
                {!formData.appliesGlobally && (
                  <div>
                    <CategorySelector
                      selectedCategories={formData.categoryIds || []}
                      onSelectionChange={(ids) =>
                        setFormData((prev) => ({ ...prev, categoryIds: ids }))
                      }
                      required={formData.isRequired}
                      label="Categories"
                      placeholder="Select categories..."
                      multiSelect={true}
                    />

                    {!formData.appliesGlobally &&
                      formData.categoryIds &&
                      formData.categoryIds.length > 0 && (
                        <p className="text-xs text-accent-100 font-sofia-sans mt-2">
                          {formData.categoryIds.length}{" "}
                          {formData.categoryIds.length === 1
                            ? "category"
                            : "categories"}{" "}
                          selected
                        </p>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Options for select fields */}
            {(formData.type === "select" ||
              formData.type === "multiselect") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-light-100 font-sofia-sans">
                    Options *
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-1 bg-accent-100/20 text-accent-100 rounded text-sm hover:bg-accent-100/30 transition-colors font-sofia-sans"
                  >
                    Add Option
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.options?.map((option, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-2 items-center"
                    >
                      <FormField
                        type="text"
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => {
                          updateOption(index, "label", e.target.value);
                          updateOption(index, "value", getSlug(e.target.value));
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <FormField
                          type="text"
                          placeholder="Value"
                          value={option.value}
                          onChange={(e) =>
                            updateOption(index, "value", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!formData.options || formData.options.length === 0) && (
                    <p className="text-sm text-gray-4 text-center py-4 font-sofia-sans">
                      No options added yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Field Properties */}
            <div>
              <label className="block text-sm text-light-100 mb-3 font-sofia-sans">
                Properties
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckboxWithLabel
                    label="Required field"
                    onChecked={handleFormChange}
                    name="isRequired"
                    id="is-required"
                    checked={formData.isRequired}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <CheckboxWithLabel
                    label="Searchable"
                    onChecked={handleFormChange}
                    name="isSearchable"
                    id="is-searchable"
                    checked={formData.isSearchable}
                  />
                </div>
              </div>
            </div>

            <div>
              <FormField
                label="Display Order"
                type="number"
                value={String(formData.displayOrder)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayOrder: parseInt(e.target.value) || 0,
                  }))
                }
                name="displayOrder"
                helpText="Lower numbers appear first"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-5/20">
              <button
                onClick={handleClose}
                type="button"
                className="px-4 py-2 text-gray-4 hover:text-light-100 transition-colors font-sofia-sans"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-accent-100 text-dark-100 rounded-lg hover:bg-accent-100/90 transition-colors font-sofia-sans"
              >
                {editingDefinition ? "Update" : "Create"} Definition
              </button>
            </div>
          </div>
        </form>
      </DialogPopup>
    </>
  );
};

export default MetafieldCreateUpdate;
