import { FilterItems } from "@/types/marketplace.type";
import toast from "react-hot-toast";

export const marketplaceService = {
  getData: async ({ filter }: { filter: FilterItems }) => {
    try {
      const categoryData = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/parts/marketplace`,
        {
          method: "POST",
          body: JSON.stringify({
            ...filter,
          }),
        }
      );
      const result = await categoryData.json();
      return result;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
    }
  },
};
