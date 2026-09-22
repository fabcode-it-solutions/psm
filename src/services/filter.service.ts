import toast from "react-hot-toast";

export const filterService = {
  getCategoryFilter: async ({ slug }: { slug: string }) => {
    try {
      const filterData = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/filters?slug=${slug}`,{
        next:{
          tags:[`filter-${slug}`]
        }
      });
      const user = await filterData.json();
      return user;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
    }
  },
};
