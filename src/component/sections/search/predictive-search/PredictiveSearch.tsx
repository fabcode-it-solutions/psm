"use client";
import React, { useState, useMemo, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { RootState } from "@/libs/redux/store";
import { useSelector } from "react-redux";
import { useTheme } from "@/providers/ThemeProvider";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import { usePredictiveSearch } from "@/hooks/usePredictiveSearch";
import { UsersSection } from "../UsersSection";
import { GridSection } from "../GridSection";
import { PartsSection } from "../PartsSection";
import { SearchInput } from "../SearchInput";
import { SearchResultHeader } from "../SearchResultHeader";
import { SearchTabs } from "../SearchTabs";
import { User } from "../../AllCards/UserCards";

type PredictiveSearchProps = {
  fullPage?: boolean;
  initialQuery?: string;
};

const PredictiveSearch: React.FC<PredictiveSearchProps> = ({
  fullPage = false,
  initialQuery = "",
}) => {
  const [activeTab, setActiveTab] = useState("");
  const { wishlistedItems } = useTheme();
  const userId = useSelector((state: RootState) => state.user.user?.user.id);
  const { query, setQuery, results, isLoading } = usePredictiveSearch(
    String(userId),
    initialQuery,
    fullPage
  );

  const tabs = useMemo(() => {
    const tabsData: string[] = [];
    if (results?.results?.brands?.length) tabsData.push("Brands");
    if (results?.results?.models?.length) tabsData.push("Models");
    if (results?.results?.types?.length) tabsData.push("Types");
    if (results?.results?.categories?.length) tabsData.push("Categories");
    if (results?.results?.manufacturers?.length) tabsData.push("Manufacturers");
    if (results?.results?.parts?.length) tabsData.push("Parts");
    if (results?.results?.usersData?.length) tabsData.push("Users");

    if (tabsData.length > 0 && !tabsData.includes(activeTab)) {
      setActiveTab(tabsData[0]);
    }

    return tabsData;
  }, [results, activeTab]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery, setQuery]);

  const renderTabContent = () => {
    const { results: searchResults } = results;
    if (!searchResults) return null;

    switch (activeTab) {
      case "Users":
        return searchResults.usersData?.length ? (
          <UsersSection users={searchResults.usersData as User[]} />
        ) : null;

      case "Categories":
        return searchResults.categories?.length ? (
          <GridSection
            title="Categories"
            items={searchResults.categories}
            getHref={(id) => `/marketplaces/${id}`}
            gridCols="!flex flex-wrap"
          />
        ) : null;

      case "Brands":
        return searchResults.brands?.length ? (
          <GridSection
            title="Brands"
            items={searchResults.brands}
            getHref={(id) => `/brands/${id}`}
          />
        ) : null;

      case "Models":
        return searchResults.models?.length ? (
          <GridSection
            title="Models"
            items={searchResults.models}
            getHref={(id) => `/models/${id}`}
          />
        ) : null;

      case "Types":
        return searchResults.types?.length ? (
          <GridSection
            title="Car Types"
            items={searchResults.types}
            getHref={(id) => `/types/${id}`}
          />
        ) : null;

      case "Manufacturers":
        return searchResults.manufacturers?.length ? (
          <GridSection
            title="Manufacturers"
            items={searchResults.manufacturers}
            getHref={(id) => `/manufacturers/${id}`}
          />
        ) : null;

      case "Parts":
        return searchResults.parts?.length ? (
          <PartsSection
            parts={searchResults.parts}
            wishlistedItems={wishlistedItems}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative w-full ${
        fullPage
          ? !query
            ? ""
            : " bg-white"
          : "max-w-[1072px] mb-[71px] max-tab-sm:mb-[19px] max-des-xs:mb-[50px]"
      }`}
    >
      <SearchInput query={query} onQueryChange={setQuery} />

      {(fullPage || query) && (
        <div
          className={`${
            fullPage
              ? "w-full min-h-[calc(60vh-52px)] mt-4 overflow-auto"
              : "max-h-[650px] absolute shadow-2xs top-[52px] z-[2] rounded-b-md w-full overflow-auto bg-white"
          }`}
        >
          {fullPage && !query ? (
            <div className="flex justify-center items-center h-full text-dark-blue-cm text-lg font-semibold px-4 text-center font-audiowide mt-30">
              - Your search garage is empty. Try adding a keyword 🚗 -
            </div>
          ) : isLoading || !results?.success ? (
            <div className="py-12 flex justify-center">
              <LoaderDots className="!bg-accent-100 !w-4 !h-4" />
            </div>
          ) : (
            <div className="p-5">
              <SearchResultHeader
                query={query}
                totalResults={results.totalResults || 0}
              />

              {results.totalResults && tabs.length > 0 && (
                <SearchTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              )}

              <Suspense
                fallback={<LoaderDots className="!bg-accent-100 !w-4 !h-4" />}
              >
                <AnimatePresence mode="wait">
                  {renderTabContent()}
                </AnimatePresence>
              </Suspense>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveSearch;
