import React from "react";
import Dropdown from "../ui/dashboard/Dropdown";
import { itemsPerPageOptions } from "@/utils/defaults";

const ItemsPerPageOptions = ({
  onValueChange,
}: {
  onValueChange: (v: number) => void;
}) => {
  return (
    <div className="flex items-center gap-4">
      <Dropdown
        options={itemsPerPageOptions}
        onValueChange={(value) => onValueChange(parseInt(value))}
        placeholder="25 per page"
      />
    </div>
  );
};

export default ItemsPerPageOptions;
