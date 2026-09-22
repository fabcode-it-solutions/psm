import * as Switch from "@radix-ui/react-switch";
import { FormField } from "@/component/ui/dashboard/FormField";
import {
  updateDefaultVariantField,
  updateErrors,
} from "@/libs/redux/slices/partsSlice";
import { RootState } from "@/libs/redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Pricing = () => {
  const dispatch = useDispatch();
  const defaultVariant = useSelector(
    (state: RootState) => state.part.part?.defaultVariant
  );

  const errors = useSelector((state: RootState) => state.part.errors);
  const handleInputChange = (
    field:
      | "price"
      | "compareAtPrice"
      | "sku"
      | "barcode"
      | "inventoryTracking"
      | "lowStockThreshold"
      | "quantity",
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(updateDefaultVariantField({ key: field, value: e.target.value }));
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          label="Base Price"
          required={true}
          name="price"
          error={{ message: errors?.price }}
          type="number"
          value={String(defaultVariant?.price) || ""}
          onChange={(e) => {
            console.log(e);            
            if (defaultVariant?.compareAtPrice) {
              if (Number(e.target.value) >= defaultVariant?.compareAtPrice) {
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
                dispatch(
                  updateErrors({
                    key: "compareAtPrice",
                    value: "",
                  })
                );
              }
            }
            handleInputChange("price", e);
            dispatch(
              updateErrors({
                key: "price",
                value: "",
              })
            );
          }}
          placeholder="0.00"
          helpText="The selling price of the product"
        />

        <FormField
          label="Compare at Price"
          name="compareAtPrice"
          type="number"
          error={{ message: errors?.compareAtPrice ?? "" }}
          value={String(defaultVariant?.compareAtPrice) || ""}
          onChange={(e) => {
            if (defaultVariant?.price) {
              if (Number(e.target.value) <= defaultVariant?.price) {
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
                dispatch(
                  updateErrors({
                    key: "price",
                    value: "",
                  })
                );
              }
            }
            handleInputChange("compareAtPrice", e);
          }}
          placeholder="0.00"
          helpText="Original price to show discount"
        />
        <FormField
          label="SKU"
          required={false}
          name="sku"
          type="text"
          value={defaultVariant?.sku || ""}
          onChange={(e) => {
            handleInputChange("sku", e);
          }}
          placeholder="0.00"
          helpText="The SKU of the product"
        />
        <FormField
          label="Barcode"
          required={false}
          name="barcode"
          type="text"
          value={defaultVariant?.barcode || ""}
          onChange={(e) => {
            handleInputChange("barcode", e);
          }}
          placeholder="0.00"
          helpText="The barcode of the product"
        />
      </div>
      <div className="border-t border-gray-5/20 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-light-100 font-sofia-sans mb-4">
            Inventory Management
          </h4>
          <div className="flex items-center gap-3">
            <Switch.Root
              checked={defaultVariant?.inventoryTracking}
              onCheckedChange={(checked) =>
                dispatch(
                  updateDefaultVariantField({
                    key: "inventoryTracking",
                    value: checked,
                  })
                )
              }
              className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
            </Switch.Root>
            <label
              htmlFor="trackQuantity"
              className="text-sm text-light-100 font-sofia-sans"
            >
              Track quantity
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {defaultVariant?.inventoryTracking && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Quantity"
                name="quantity"
                type="number"
                value={String(defaultVariant?.quantity) || ""}
                onChange={(e) => {
                  handleInputChange("quantity", e);
                }}
                placeholder="0"
              />

              <FormField
                label="Low Stock Threshold"
                name="lowStockThreshold"
                type="number"
                value={defaultVariant?.lowStockThreshold || ""}
                onChange={(e) => {
                  handleInputChange("lowStockThreshold", e);
                }}
                placeholder="10"
                helpText="Alert when stock falls below this number"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
