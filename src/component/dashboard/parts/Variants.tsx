/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TagSelect } from "@/component/ui/dashboard/TagSelect";
import { Trash, Settings } from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { Variant } from "@/types/parts.types";
import {
  addOptions,
  addVariants,
  Errors,
  removeOptionByName,
  updateErrors,
  updateOptionsField,
} from "@/libs/redux/slices/partsSlice";
import ShowVariants from "./ShowVariants";

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

const Variants = () => {
  const dispatch = useDispatch();
  const variants =
    useSelector((state: RootState) => state.part.part?.variants) || [];
  const errors = useSelector((state: RootState) => state.part.errors);
  const productOptions =
    useSelector((state: RootState) => state.part.part?.options) || [];
  const defaultVariant = useSelector(
    (state: RootState) => state.part.part?.defaultVariant
  );

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [accordion, setAccordion] = useState<string | null>(null);

  const addProductOption = useCallback(() => {
    if (productOptions.length >= 3) {
      return;
    }

    const newOption: ProductOption = {
      id: `option_${Date.now()}`,
      name: "",
      values: [],
    };
    dispatch(addOptions(newOption));

    const newIndex = productOptions.length;
    setAccordion(newOption.id);

    setTimeout(() => {
      const el = sectionRefs.current[newIndex];
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 150, behavior: "smooth" });
      }
    }, 300);
  }, [productOptions]);

  const removeProductOption = useCallback(
    (id: string) => dispatch(removeOptionByName(id)),
    [dispatch]
  );

  // Generate all possible variant combinations
  const generateVariants = useCallback(
    (options: ProductOption[]) => {
      if (!options.length) return;

      let combinations = options[0].values.map((val) => [
        { label: options[0].name, value: val },
      ]);
      for (let i = 1; i < options.length; i++) {
        const current = options[i];
        combinations = combinations.flatMap((combo) =>
          current.values.map((val) => [
            ...combo,
            { label: current.name, value: val },
          ])
        );
      }

      const newVariants: Variant[] = combinations.map((combo) => {
        const title = combo.map((c) => c.value).join(" / ");
        const existing = variants.find((v) =>
          combo.every(
            (c, i) => v[`option${i + 1}` as keyof Variant] === c.value
          )
        );

        const variant: Variant = existing
          ? { ...existing }
          : {
              title,
              option1: combo[0]?.value,
              option1Label: combo[0]?.label,
              option2: combo[1]?.value,
              option2Label: combo[1]?.label,
              option3: combo[2]?.value,
              option3Label: combo[2]?.label,
              quantity: defaultVariant?.quantity || 0,
              price: defaultVariant?.price,
              compareAtPrice: defaultVariant?.compareAtPrice,
              inventoryTracking: defaultVariant?.inventoryTracking,
              lowStockThreshold: defaultVariant?.lowStockThreshold,
            };
        return variant;
      });

      dispatch(addVariants(newVariants));
    },
    [variants, defaultVariant]
  );

  useEffect(() => {
    if (productOptions.every((o) => o.name && o.values.length > 0)) {
      generateVariants(productOptions);
    }
  }, [productOptions]);

  const getOptionKeys = (index: number) => ({
    nameKey: `option${index + 1}label`,
    valuesKey: `option${index + 1}Values`,
  });

  return (
    <div className="space-y-6">
      {productOptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-5/5 rounded-lg border-2 border-dashed border-gray-5/20">
          <Settings className="w-8 h-8 text-gray-4 mx-auto mb-4" />
          <p className="text-gray-4 text-sm font-sofia-sans">
            No product options configured yet.
          </p>
          <p className="text-gray-5 text-xs font-sofia-sans mt-1">
            Add options like Size, Color, or Material to create product
            variants.
          </p>
          <div className="flex items-center justify-center">
            <button
              type="button"
              disabled={productOptions.length >= 3}
              onClick={addProductOption}
              className={`flex items-center mt-4 gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium ${
                productOptions.length >= 3
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <Settings className="w-4 h-4" />
              Add Option
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {productOptions.map((option, index) => {
            const { nameKey, valuesKey } = getOptionKeys(index);
            const values = option.values.map((item) => ({
              label: item,
              value: item,
            }));

            return (
              <div
                key={option.id}
                className={`bg-gray-5/5 rounded-lg border ${
                  errors?.[nameKey as keyof Errors]
                    ? "border-red-500"
                    : "border-gray-5/20"
                }`}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() =>
                    setAccordion((prev) =>
                      prev === option.id ? null : option.id
                    )
                  }
                  ref={(el) => {
                    sectionRefs.current[option.id] = el;
                  }}
                >
                  <h4 className="font-medium text-light-100 font-sofia-sans">
                    {option.name || `Option ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeProductOption(option.id)}
                    className="text-gray-4 w-6 h-6 hover:text-red-400 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {accordion === option.id && (
                    <motion.div
                      key={index}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 p-4 pt-0">
                        <FormField
                          label="Option Name"
                          required
                          name={`option_name_${index}`}
                          type="text"
                          value={option.name}
                          error={{
                            message: errors?.[nameKey as keyof Errors] || "",
                          }}
                          onChange={(e) => {
                            dispatch(
                              updateOptionsField({
                                id: option.id,
                                key: "name",
                                value: e.target.value,
                              })
                            );
                            if (e.target.value)
                              dispatch(
                                updateErrors({
                                  key: nameKey as keyof Errors,
                                  value: "",
                                })
                              );
                          }}
                          placeholder="e.g., Size, Color, Material"
                        />
                        {option.name && (
                          <OptionsItems
                            option={option}
                            optionValues={option.values}
                            productOptionsLength={productOptions.length}
                            valuesKey={valuesKey as keyof Errors}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
      {productOptions.length > 0 && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={addProductOption}
            className={`flex items-center mt-4 gap-2 px-4 py-2 bg-accent-100/20 text-accent-100 rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium ${
              productOptions.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={productOptions.length >= 3}
          >
            <Settings className="w-4 h-4" />
            Add Option
          </button>
        </div>
      )}
      {productOptions.length > 0 && (
        <ShowVariants productOptions={productOptions} />
      )}
    </div>
  );
};

export default Variants;

const OptionsItems = ({
  optionValues,
  valuesKey,
  option,
  productOptionsLength,
}: {
  optionValues: string[];
  valuesKey: keyof Errors;
  option: { id: string };
  productOptionsLength: number;
}) => {
  const dispatch = useDispatch();
  const errors = useSelector((state: RootState) => state.part.errors);
  const values = useMemo(
    () => optionValues.map((item) => ({ label: item, value: item })),
    [optionValues]
  );
  return (
    <TagSelect
      label="Option Values *"
      values={values}
      selectMode="multiple"
      enableEnter
      limit={Math.ceil(99 / productOptionsLength)}
      placeholder="e.g., Small, Medium, Large"
      error={{
        message: errors?.[`${valuesKey as keyof Errors}`] || "",
      }}
      resetAllValues={() =>
        dispatch(
          updateOptionsField({
            id: option.id,
            key: "values",
            value: [],
          })
        )
      }
      setSelected={(selected) => {
        const newValues = selected.map((v) => String(v.value));
        dispatch(
          updateOptionsField({
            id: option.id,
            key: "values",
            value: newValues,
          })
        );
        if (newValues.length)
          dispatch(
            updateErrors({
              key: valuesKey as keyof Errors,
              value: "",
            })
          );
      }}
    />
  );
};
