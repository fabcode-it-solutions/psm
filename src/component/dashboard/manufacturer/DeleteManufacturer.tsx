import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useApiRequest } from "@/hooks/useApiRequest";
import { ManufacturerApiResponse } from "@/types/manufacturers.types";

import React from "react";

type DeleteManufacturerProps = {
  deleteManufacturerId: number | null;
  setDeleteManufacturerId: (v: number | null) => void;
  loadManufacturers: () => void;
};

const DeleteManufacturer = ({ 
  deleteManufacturerId, 
  setDeleteManufacturerId, 
  loadManufacturers 
}: DeleteManufacturerProps) => {
  const { request: deleteManufacturer, loading: deleteLoading } =
    useApiRequest<ManufacturerApiResponse>();

  const confirmDelete = async () => {
    if (!deleteManufacturerId) return;

    try {
      const result = await deleteManufacturer({
        url: `/api/admin/cars/manufacturers/${deleteManufacturerId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        loadManufacturers();
        setDeleteManufacturerId(null);
      }
    } catch (error) {
      console.error("Error deleting manufacturer:", error);
    }
  };

  return (
    <DeleteConfirmationDialog
      confirmDelete={() => confirmDelete()}
      deleteBrandId={deleteManufacturerId}
      deleteLoading={deleteLoading}
      setDeleteBrandId={() => setDeleteManufacturerId(null)}
      heading="Delete Manufacturer"
      content="Are you sure you want to delete this manufacturer? This action cannot be undone and will affect all associated products."
    />
  );
};

export default DeleteManufacturer;