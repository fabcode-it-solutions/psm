import DeleteConfirmationDialog from "@/component/ui/dashboard/DeleteConfirmationDialog";
import { useApiRequest } from "@/hooks/useApiRequest";
import { BrandApiResponse } from "@/types/brands.types";
import React from "react";
type T = {
  deleteBrandId: number | null;
  setDeleteBrandId: (v: number | null) => void;
  loadBrands: () => void;
};
const DeleteBrand = ({ deleteBrandId, setDeleteBrandId, loadBrands }: T) => {
  const { request: deleteBrand, loading: deleteLoading } =
    useApiRequest<BrandApiResponse>();

  const confirmDelete = async () => {
    if (!deleteBrandId) return;

    try {
      const result = await deleteBrand({
        url: `/api/admin/cars/brands/${deleteBrandId}`,
        options: { method: "DELETE" },
      });

      if (result?.success) {
        loadBrands();
        setDeleteBrandId(null);
      } else {
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  return (
    <DeleteConfirmationDialog
      confirmDelete={() => confirmDelete()}
      deleteBrandId={deleteBrandId}
      deleteLoading={deleteLoading}
      setDeleteBrandId={() => setDeleteBrandId(null)}
      heading="Delete Brand"
      content="Are you sure you want to delete this brand? This action cannot
                        be undone and will affect all associated builds."
    />
  );
};

export default DeleteBrand;
