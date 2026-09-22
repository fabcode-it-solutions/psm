import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useApiRequest } from "@/hooks/useApiRequest";
import { ModelApiResponse } from "@/types/models.types";

import React from "react";

type DeleteModelProps = {
  deleteModelId: number | null;
  setDeleteModelId: (v: number | null) => void;
  loadModels: () => void;
};

const DeleteModel = ({ deleteModelId, setDeleteModelId, loadModels }: DeleteModelProps) => {
  const { request: deleteModel, loading: deleteLoading } =
    useApiRequest<ModelApiResponse>();

  const confirmDelete = async () => {
    if (!deleteModelId) return;

    try {
      const result = await deleteModel({
        url: `/api/admin/cars/models/${deleteModelId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        loadModels();
        setDeleteModelId(null);
      } else {
        // Handle error if needed
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  return (
    <DeleteConfirmationDialog
      confirmDelete={() => confirmDelete()}
      deleteBrandId={deleteModelId}
      deleteLoading={deleteLoading}
      setDeleteBrandId={() => setDeleteModelId(null)}
           heading="Delete Model"
      content="Are you sure you want to delete this model? This action cannot
                        be undone and will affect all associated builds."    />
  );
};

export default DeleteModel;