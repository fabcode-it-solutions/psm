import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as Switch from "@radix-ui/react-switch";
import { FormField } from "@/component/ui/dashboard/FormField";
import { RootState } from "@/libs/redux/store";
import { Variant } from "@/types/parts.types";
import {
  updateVariantField,
  updateErrors,
} from "@/libs/redux/slices/partsSlice";

interface ShowVariantsProps {
  productOptions: { id: string; name: string; values: string[] }[];
}

const ShowVariants: React.FC<ShowVariantsProps> = ({ productOptions }) => {
  const dispatch = useDispatch();
  const variants = useSelector((state: RootState) => state.part.part?.variants);
  const variantFields: (keyof Variant)[] = [
    "price",
    "compareAtPrice",
    "quantity",
    "lowStockThreshold",
    "sku",
    "barcode",
    "inventoryTracking",
  ];
  const [errors, setErrors] = useState<{ index: number; type: string }[]>([]);
  useEffect(() => {
    if (errors.find((item) => item.type == "price")) {
      dispatch(
        updateErrors({
          key: "price",
          value: "Price should be less than to Compare at Price",
        })
      );
    } else {
      dispatch(
        updateErrors({
          key: "price",
          value: "",
        })
      );
    }
    if (errors.find((item) => item.type == "compareAtPrice")) {
      dispatch(
        updateErrors({
          key: "compareAtPrice",
          value: "Compare at Price should be greater than to Price",
        })
      );
    } else {
      dispatch(
        updateErrors({
          key: "compareAtPrice",
          value: "",
        })
      );
    }
  }, [errors]);
  return (
    variants &&
    variants.length > 0 && (
      <div className="space-y-2 mt-6">
        <h3 className="font-medium text-light-100 font-sofia-sans">Variants</h3>
        <div className="space-y-0">
          <div className="flex gap-0 bg-gray-5/5 border-gray-5/20 border-t  rounded-t-lg">
            {productOptions.map((item, index) => (
              <div
                className="flex-1 text-light-300  text-center p-2"
                key={item.name + "-options-" + index}
              >
                {item.name}
              </div>
            ))}
            {[
              "Base Price",
              "Compare At Price",
              "Quantity",
              "Low Stock Threshold",
              "SKU",
              "Barcode",
              "Track Quantity",
            ].map((item, index) => (
              <div
                className="flex-1 text-light-300 text-center  p-2"
                key={item + "-index-" + index}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="border-gray-5/20 border  rounded-b-lg">
            {variants.map((variant, idx) => (
              <div
                key={"variant--" + idx}
                className="p-0 border-b items-center  last:border-b-0 border-gray-5/20 text-light-300  bg-gray-5/5 flex justify-between"
              >
                <div className="flex-1 text-center p-2">{variant?.option1}</div>
                {variant?.option2 && (
                  <div className="flex-1 text-center p-2">
                    {variant?.option2}
                  </div>
                )}
                {variant?.option3 && (
                  <div className="flex-1 text-center p-2">
                    {variant?.option3}
                  </div>
                )}
                {variantFields.map((item, index) => (
                  <div
                    className="flex-1 text-light-300 text-center  p-2"
                    key={item + "--index--" + index}
                  >
                    {item == "inventoryTracking" ? (
                      <Switch.Root
                        checked={variant?.inventoryTracking ?? false}
                        onCheckedChange={(checked) =>
                          dispatch(
                            updateVariantField({
                              index: idx,
                              key: item,
                              value: checked,
                            })
                          )
                        }
                        className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                      >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                      </Switch.Root>
                    ) : (item == "lowStockThreshold" || item == "quantity") &&
                      !variant?.inventoryTracking ? (
                      "-"
                    ) : (
                      <FormField
                        type={
                          item == "sku" || item == "barcode" ? "text" : "number"
                        }
                        value={
                          variant[item] && variant[item] != undefined
                            ? (variant[item] as string)
                            : ""
                        }
                        error={{
                          message:
                            item == "price"
                              ? errors.find(
                                  (item) =>
                                    item.type == "price" && item.index == idx
                                )?.index == idx
                                ? "Price should be less than to Compare at Price"
                                : ""
                              : item == "compareAtPrice"
                              ? errors.filter(
                                  (item) =>
                                    item.type == "compareAtPrice" &&
                                    item.index == idx
                                ).length > 0
                                ? "Compare at Price should be greater than to Price"
                                : ""
                              : "",
                        }}
                        onChange={(e) => {
                          if (
                            item == "price" &&
                            variant.compareAtPrice &&
                            Number(e.target.value) >= variant.compareAtPrice
                          ) {
                            setErrors((prev) => [
                              ...prev,
                              { index: idx, type: "price" },
                            ]);
                          } else {
                            setErrors((prev) =>
                              prev.filter(
                                (err) =>
                                  !(err.index === idx && err.type === "price")
                              )
                            );
                          }
                          if (
                            item == "compareAtPrice" &&
                            variant.price &&
                            Number(e.target.value) <= variant.price
                          ) {
                            setErrors((prev) => [
                              ...prev,
                              { index: idx, type: "compareAtPrice" },
                            ]);
                          } else {
                            setErrors((prev) =>
                              prev.filter(
                                (err) =>
                                  !(
                                    err.index === idx &&
                                    err.type === "compareAtPrice"
                                  )
                              )
                            );
                          }
                          dispatch(
                            updateVariantField({
                              index: idx,
                              key: item,
                              value: e.target.value,
                            })
                          );
                        }}
                        className="flex-1 text-light-300   p-2"
                        inputStyle={"text-center"}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default ShowVariants;
