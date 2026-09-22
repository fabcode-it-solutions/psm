import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TagSelect } from "@/component/ui/dashboard/TagSelect";
import RichTextEditor from "@/component/ui/RichTextEditor/RichTextEditor";
import {
  addDefaultVariantField,
  updatePartField,
  updateSeoFields,
} from "@/libs/redux/slices/partsSlice";
import { RootState } from "@/libs/redux/store";
import { Category } from "@/services/categoryService";
import { defaultService } from "@/services/default.services";
import { Brand } from "@/types/brands.types";
import { Manufacturer } from "@/types/manufacturers.types";
import { Model } from "@/types/models.types";
import { Variant } from "@/types/parts.types";
import { Type } from "@/types/types.types";
import { getSlug } from "@/utils/getSlug";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const listedOptions = [
  { value: "For Sale", label: "For Sale" },
  { value: "Up for Offer", label: "Up for Offer" },
];
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const PartBasic = () => {
  const [query, setQuery] = useState<{
    brand?: string;
    categories?: string;
    models?: string;
    type?: string;
    manufacturer?: string;
  }>({
    brand: "",
    categories: "",
    models: "",
    type: "",
    manufacturer: "",
  });
  const dispatch = useDispatch();
  const part = useSelector((state: RootState) => state.part.part);
  const errors = useSelector((state: RootState) => state.part.errors);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [models, setModels] = useState<{ value: string; label: string }[]>([]);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [manufacturers, setManufacturer] = useState<
    { value: string; label: string }[]
  >([]);
  const [types, setTypes] = useState<{ value: string; label: string }[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapOptions = (
    data: Category[] | Brand[] | Manufacturer[] | Model[] | Type[] = []
  ) =>
    data.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        if (query.brand) {
          const res = await defaultService.fetchBrands({
            searchTerm: query.brand,
          });
          setBrands(mapOptions(res?.data));
        }
        if (query.categories) {
          const res = await defaultService.fetchCategories({
            searchTerm: query.categories,
          });
          setCategoryOptions(mapOptions(res?.data));
        }
        if (query.manufacturer) {
          const res = await defaultService.fetchManufacturers({
            searchTerm: query.manufacturer,
          });
          setManufacturer(mapOptions(res?.data));
        }
        if (query.models && part?.brandId) {
          const res = await defaultService.fetchModels({
            searchTerm: query.models,
            brandId: String(part?.brandId),
          });
          setModels(mapOptions(res?.data));
        }
        if (query.type || part?.modelId) {
          const res = await defaultService.fetchModelsTypes({
            searchTerm: query?.type,
            modelId: String(part?.modelId),
          });
          setTypes(mapOptions(res?.data));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, part?.brandId, part?.modelId]);
  useEffect(() => {
    if (part?.brandId) {
      (async () => {
        const modelRes = await defaultService.fetchModels({
          itemsPerPage: "30",
          brandId: String(part?.brandId),
        });
        setModels(mapOptions(modelRes?.data));
      })();
    }
  }, [part?.brandId]);
  useEffect(() => {
    if (part?.modelId) {
      (async () => {
        const res = await defaultService.fetchModelsTypes({
          itemsPerPage: "30",
          modelId: String(part?.modelId),
        });
        setTypes(mapOptions(res?.data));
      })();
    }
  }, [part?.modelId]);
  const getAllData = async () => {
    const resd = await defaultService.fetchBrands({ itemsPerPage: "30" });
    setBrands(mapOptions(resd?.data));
    const res = await defaultService.fetchManufacturers({ itemsPerPage: "30" });
    setManufacturer(mapOptions(res?.data));
    const resm = await defaultService.fetchCategories({ itemsPerPage: "30" });
    setCategoryOptions(mapOptions(resm?.data));
  };
  useEffect(() => {
    getAllData();
  }, []);
  const handleInputChange =
    (field: "title" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field == "title") {
        dispatch(
          updatePartField({ key: "slug", value: getSlug(e.target.value) })
        );
        dispatch(updateSeoFields({ key: "metaTitle", value: e.target.value }));
        dispatch(updateSeoFields({ key: "ogTitle", value: e.target.value }));
      }
      if (field == "description") {
        dispatch(
          updateSeoFields({
            key: "metaDescription",
            value: e.target.value,
          })
        );
        dispatch(
          updateSeoFields({ key: "ogDescription", value: e.target.value })
        );
      }
      dispatch(updatePartField({ key: field, value: e.target.value }));
    };
  const handleDropdownChange =
    (field: "status" | "listed") => (value: string) => {
      dispatch(updatePartField({ key: field, value: value }));
    };
  useEffect(() => {
    dispatch(
      addDefaultVariantField({
        title: "Default Variant",
        option1: "default",
      } as Variant)
    );
  }, []);

  return (
    <div className="space-y-6 part-description">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FormField
          label="Part Title"
          required
          helpText="Enter a descriptive title for this part"
          name="title"
          type="text"
          value={part?.title || ""}
          error={{ message: errors?.title }}
          onChange={handleInputChange("title")}
          placeholder="Enter part title..."
        />

        <Dropdown
          label="Status *"
          options={statusOptions}
          placeholder="Select status..."
          error={{ message: errors?.status }}
          selectedText={part?.status}
          onValueChange={handleDropdownChange("status")}
        />

        <TagSelect
          label="Categories"
          selectMode="multiple"
          options={categoryOptions}
          openOptions={true}
          values={part?.categories}
          placeholder="Select categories..."
          href="/dashboard/categories"
          onChange={(val) => setQuery({ categories: val })}
          setSelected={(e) => {
            if (e.length > 0) {
              const vals = e.map((item) => Number(item.value));
              dispatch(updatePartField({ key: "categoryIds", value: vals }));
            }
          }}
        />
      </div>

      <div className="flex gap-6">
        <TagSelect
          label="Brand"
          selectMode="single"
          options={brands}
          values={
            part?.brand && part.brand.name
              ? [
                  {
                    label: part.brand.name,
                    value: String(part.brand.id),
                  },
                ]
              : undefined
          }
          openOptions={true}
          placeholder="Select brand"
          error={{ message: errors?.brandId }}
          href="/dashboard/brands"
          required={true}
          className="flex-1"
          onChange={(val) => setQuery({ brand: val })}
          setSelected={(e) => {
            if (e.length > 0) {
              const val = e[0];
              dispatch(
                updatePartField({ key: "brandId", value: Number(val.value) })
              );
              dispatch(updatePartField({ key: "brand", value: {} }));
            }
          }}
        />

        {part?.brandId && (
          <TagSelect
            label="Model"
            selectMode="single"
            required={true}
            openOptions={true}
            options={models}
            error={{ message: errors?.modelId }}
            className="flex-1"
            values={
              part?.model && part.model.name && part.modelId
                ? [
                    {
                      label: part.model.name,
                      value: String(part.modelId),
                    },
                  ]
                : undefined
            }
            placeholder="Select Model"
            onChange={(val) => setQuery({ models: val })}
            setSelected={(e) => {
              if (e.length > 0) {
                const val = e[0];
                dispatch(
                  updatePartField({ key: "modelId", value: Number(val.value) })
                );
                dispatch(updatePartField({ key: "model", value: {} }));
              }
            }}
          />
        )}

        {part?.modelId && (
          <TagSelect
            label="Model Type"
            selectMode="single"
            required={true}
            options={types}
            openOptions={true}
            values={
              part?.type && part.type.name && part.typeId
                ? [
                    {
                      label: part.type.name,
                      value: String(part.typeId),
                    },
                  ]
                : undefined
            }
            error={{ message: errors?.typeId }}
            className="flex-1"
            placeholder="Select Type"
            onChange={(val) => setQuery({ type: val })}
            setSelected={(e) => {
              if (e.length > 0) {
                const val = e[0];
                dispatch(
                  updatePartField({ key: "typeId", value: Number(val.value) })
                );
                dispatch(updatePartField({ key: "type", value: {} }));
              }
            }}
          />
        )}
      </div>
      <div className="flex gap-6">
        <TagSelect
          label="Manufacturer"
          selectMode="single"
          error={{ message: errors?.manufacturerId }}
          options={manufacturers}
          className="flex-1"
          openOptions={true}
          values={
            part?.manufacturer && part.manufacturer.name && part.manufacturerId
              ? [
                  {
                    label: part.manufacturer.name,
                    value: String(part.manufacturerId),
                  },
                ]
              : undefined
          }
          placeholder="Select Manufacturer"
          required={true}
          onChange={(val) => setQuery({ manufacturer: val })}
          setSelected={(e) => {
            if (e.length > 0) {
              const val = e[0];
              dispatch(
                updatePartField({
                  key: "manufacturerId",
                  value: Number(val.value),
                })
              );
              dispatch(updatePartField({ key: "manufacturer", value: {} }));
            }
          }}
        />
        <Dropdown
          label="Listed *"
          options={listedOptions}
          error={{ message: errors?.listed }}
          placeholder="Select Listed..."
          className="flex-1"
          selectedText={part?.listed}
          onValueChange={handleDropdownChange("listed")}
        />
      </div>
      <RichTextEditor
        label="Description"
        value={part?.description || ""}
        placeholder="Enter part description, specifications, and features..."
        helpText="Provide detailed information about the part"
        onChange={(value) => {
          dispatch(updatePartField({ key: "description", value: value }));
          const text = document.querySelector(
            ".part-description .jodit-wysiwyg"
          );
          if (text) {
            dispatch(
              updateSeoFields({
                key: "metaDescription",
                value: text.textContent.slice(0, 160),
              })
            );
            dispatch(
              updateSeoFields({
                key: "ogDescription",
                value: text.textContent.slice(0, 160),
              })
            );
          }
        }}
      />
      <TagSelect
        label="Tags"
        resetAllValues={() => {
          dispatch(
            updatePartField({
              key: "tags",
              value: [],
            })
          );
        }}
        setSelected={(e) => {
          const values = e.map((item) => {
            return String(item.value);
          });
          dispatch(
            updatePartField({
              key: "tags",
              value: values,
            })
          );
        }}
        enableEnter={true}
        selectMode="multiple"
        limit={24}
      />
    </div>
  );
};

export default React.memo(PartBasic);
