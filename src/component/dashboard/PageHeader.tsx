import { MetafieldDefinition } from "@/types/metafield.types";
import { Plus } from "lucide-react";
import React from "react";

interface PageHeaderProps {
  resetForm?: () => void;
  setEditingDefinition?: (value: MetafieldDefinition | null) => void;
  setShowCreateModal?: (value: boolean) => void;
  heading: string;
  describe?: string;
  button?: React.ReactNode;
}
const PageHeader = ({
  heading,
  describe,
  button,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-audiowide text-light-100">{heading}</h1>
        <p className="text-gray-4 font-sofia-sans mt-1">
          {describe || "Define custom fields for your entities"}
        </p>
      </div>

      {button}
    </div>
  );
};

export default PageHeader;
