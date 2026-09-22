import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useApiRequest } from "@/hooks/useApiRequest";
import { BrandApiResponse } from "@/types/brands.types";
import React from "react";
type T = {
  deleteId: number | null;
  setdeleteId: (v: number | null) => void;
  loads: () => void;
};
const Delete = ({ deleteId, setdeleteId, loads }: T) => {
  const { request: deleteItem, loading: deleteLoading } =
    useApiRequest<BrandApiResponse>();

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await deleteItem({
        url: `/api/parts/${deleteId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        loads();
        setdeleteId(null);
      } else {
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  return (
    <DeleteConfirmationDialog
      confirmDelete={() => confirmDelete()}
      deleteBrandId={deleteId}
      deleteLoading={deleteLoading}
      setDeleteBrandId={() => setdeleteId(null)}
      heading="Delete Part"
      content="Are you sure you want to delete this part? This action cannot
                        be undone and will affect all associated lisitings."
    />
  );
};

export default Delete;
