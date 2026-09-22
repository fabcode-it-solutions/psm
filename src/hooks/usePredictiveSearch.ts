import { useState, useCallback ,useEffect } from "react";
import { SearchResponse } from "@/app/api/search/route";
import { searchService } from "@/services/search.service";
import { useDebounce } from "./useDebounce";

export const usePredictiveSearch = (userId?: string, initialQuery = "", fullPage = false) => {
   const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResponse>({});
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async () => {
    if (!query) {
      setResults({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await searchService.predictiveSearch({
        q: query,
        userId: Number(userId),
        fullPage,
      });
      setResults(res);
    } catch (error) {
      console.error("Search error:", error);
      setResults({});
    } finally {
      setIsLoading(false);
    }
  }, [query, userId]);

  useDebounce(performSearch, 400, [query, userId]);

   useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  return {
    query,
    setQuery,
    results,
    isLoading,
  };
};
