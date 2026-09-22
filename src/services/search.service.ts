export const searchService = {
  predictiveSearch: async ({ q, userId, fullPage }: { q: string; userId?: number; fullPage?: boolean }) => {
    if (!q) return [];

    try {
      const controller = new AbortController();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/search?q=${encodeURIComponent(q)}&userId=${userId}${fullPage ? '&fullPage=true' : ''}`,
        {
          signal: controller.signal,
          next: {
            revalidate: 300,
            tags: ["popular-users"],
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Predictive search failed:", err);
      return []; // gracefully return empty results
    }
  },
};
