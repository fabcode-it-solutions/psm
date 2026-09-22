import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { ShippingInfo } from "@/types/parts.types";
import React, { useState } from "react";

const Shipping = () => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    shippingClass: "",
    requiresShipping: true,
    freeShipping: false,
    shippingCost: "",
  });

  const shippingClassOptions = [
    { value: "standard", label: "Standard Shipping" },
    { value: "express", label: "Express Shipping" },
    { value: "overnight", label: "Overnight Shipping" },
    { value: "freight", label: "Freight Shipping" },
  ];
const handleShippingChange =
    (field: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setShippingInfo((prev) => ({ ...prev, [field]: value }));
    };

  const handleDimensionChange =
    (dimension: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setShippingInfo((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: e.target.value },
      }));
    };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          label="Weight"
          name="weight"
          type="number"
          value={shippingInfo.weight}
          onChange={handleShippingChange("weight")}
          placeholder="0.00"
          helpText="Weight in kilograms"
        />

        <Dropdown
          label="Shipping Class"
          options={shippingClassOptions}
          placeholder="Select shipping class..."
          onValueChange={(value) =>
            setShippingInfo((prev) => ({
              ...prev,
              shippingClass: value,
            }))
          }
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-light-100 font-sofia-sans mb-3">
          Dimensions (cm)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            label="Length"
            name="length"
            type="number"
            value={shippingInfo.dimensions.length}
            onChange={handleDimensionChange("length")}
            placeholder="0.00"
          />
          <FormField
            label="Width"
            name="width"
            type="number"
            value={shippingInfo.dimensions.width}
            onChange={handleDimensionChange("width")}
            placeholder="0.00"
          />
          <FormField
            label="Height"
            name="height"
            type="number"
            value={shippingInfo.dimensions.height}
            onChange={handleDimensionChange("height")}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="freeShipping"
              checked={shippingInfo.freeShipping}
              onChange={handleShippingChange("freeShipping")}
              className="w-4 h-4 text-accent-100 border-gray-5/20 rounded focus:ring-accent-100"
            />
            <label
              htmlFor="freeShipping"
              className="text-sm text-light-100 font-sofia-sans"
            >
              Free shipping
            </label>
          </div>
        </div>

        {!shippingInfo.freeShipping && (
          <FormField
            label="Shipping Cost"
            name="shippingCost"
            type="number"
            value={shippingInfo.shippingCost}
            onChange={handleShippingChange("shippingCost")}
            placeholder="0.00"
          />
        )}
      </div>
    </div>
  );
};

export default Shipping;
