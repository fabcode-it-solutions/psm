import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useApiRequest } from "@/hooks/useApiRequest";
import { TypeApiResponse } from "@/types/types.types";
import React from "react";

type DeleteTypeProps = {
  deleteTypeId: number | null;
  setDeleteTypeId: (v: number | null) => void;
  loadTypes: () => void;
};

const DeleteType = ({ deleteTypeId, setDeleteTypeId, loadTypes }: DeleteTypeProps) => {
  const { request: deleteType, loading: deleteLoading } =
    useApiRequest<TypeApiResponse>();

  const confirmDelete = async () => {
    if (!deleteTypeId) return;

    try {
      const result = await deleteType({
        url: `/api/admin/cars/types/${deleteTypeId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        loadTypes();
        setDeleteTypeId(null);
      }
    } catch (error) {
      console.error("Error deleting type:", error);
    }
  };

  return (
    <DeleteConfirmationDialog
      confirmDelete={() => confirmDelete()}
      deleteBrandId={deleteTypeId}
      deleteLoading={deleteLoading}
      setDeleteBrandId={() => setDeleteTypeId(null)}
      heading="Delete Type"
      content="Are you sure you want to delete this type? This action cannot
                        be undone and will affect all associated builds."
    />
  );
};

export default DeleteType;