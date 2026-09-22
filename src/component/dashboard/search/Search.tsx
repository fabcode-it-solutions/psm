// File: src/component/global/CommandPalette.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Plus,
  AlertTriangle,
  Home,
  Folder,
  Tag,
  Settings,
  FolderPlus,
  Command,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  route: string;
  icon?: string;
  category: string;
  status?: string;
}

interface UniverseSearchResults {
  actions: SearchResult[];
  pages: SearchResult[];
  parts: SearchResult[];
  categories: SearchResult[];
  brands: SearchResult[];
  models: SearchResult[];
  types: SearchResult[];
  manufacturers: SearchResult[];
  users: SearchResult[];
  metafields: SearchResult[];
}

interface UniverseApiResponse {
  success: boolean;
  query: string;
  results: UniverseSearchResults;
  totalResults: number;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plus: Plus,
  package: Package,
  "alert-triangle": AlertTriangle,
  "folder-plus": FolderPlus,
  tag: Tag,
  home: Home,
  folder: Folder,
  settings: Settings,
};

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UniverseSearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch search results from universe API
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/universe?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: UniverseApiResponse = await response.json();

      if (data.success) {
        // ✅ CORRECT: Access "results.parts" (plural), not "results.part"
        setResults(data.results);
      }
    } catch (error) {
      console.error("Command palette search error:", error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (query) {
        fetchResults(query);
      } else {
        setResults(null);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, fetchResults]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Flatten all results into a single array for keyboard navigation
  const allResults = React.useMemo(() => {
    if (!results) return [];

    return [
      ...results.actions,
      ...results.pages,
      ...results.parts,
      ...results.categories,
      ...results.brands,
      ...results.models,
      ...results.types,
      ...results.manufacturers,
      ...results.users,
      ...results.metafields,
    ];
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < allResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    router.push(result.route);
    setIsOpen(false);
  };

  // Render result group
  const renderResultGroup = (
    title: string,
    items: SearchResult[],
    startIndex: number
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ">
          {title}
        </div>
        <div>
          {items.map((item, index) => {
            const globalIndex = startIndex + index;
            const isSelected = globalIndex === selectedIndex;
            const Icon = item.icon ? iconMap[item.icon] : Package;

            return (
              <button
                key={`${item.category}-${item.id}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(globalIndex)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-accent-100/20 text-accent-100"
                    : "text-light-100 hover:bg-gray-5/10"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-sm text-gray-4 truncate">
                      {item.subtitle}
                    </div>
                  )}
                </div>
                {item.status && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.status === "active"
                        ? "bg-green-400/20 text-green-400"
                        : "bg-yellow-400/20 text-yellow-400"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex !w-md items-center justify-between px-3 py-2 bg-gray-5/10 border border-gray-5/20 rounded-lg text-gray-4 hover:border-gray-5/40 transition-colors"
      >
        <div className="flex gap-2">
        <Search className="w-4 h-4" />
        <span className="text-sm">Search parts, categories , brands...</span>
        </div>
        <kbd className="hidden sm:inline-flex justify-end gap-1 px-2 py-0.5 bg-gray-5/20 rounded text-xs items-end">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-dark-100 border border-gray-5/20 rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-5/20">
              <Search className="w-5 h-5 text-gray-4" />
              <input
                type="text"
                placeholder="Search for actions, pages, parts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-light-100 placeholder-gray-4 outline-none"
                autoFocus
              />
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-100" />
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!query || query.length < 2 ? (
                <div className="py-8 text-center text-gray-4">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Type to search...</p>
                  <p className="text-sm mt-1">
                    Search for parts, categories, brands, and more
                  </p>
                </div>
              ) : loading ? (
                <div className="py-8 text-center text-gray-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-100 mx-auto" />
                  <p className="mt-3">Searching...</p>
                </div>
              ) : !results || allResults.length === 0 ? (
                <div className="py-8 text-center text-gray-4">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for &quot;{query}&quot;</p>
                </div>
              ) : (
                <>
                  {renderResultGroup(
                    "Quick Actions",
                    results.actions,
                    0
                  )}
                  {renderResultGroup(
                    "Pages",
                    results.pages,
                    results.actions.length
                  )}
                  {renderResultGroup(
                    "Parts",
                    results.parts,
                    results.actions.length + results.pages.length
                  )}
                  {renderResultGroup(
                    "Categories",
                    results.categories,
                    results.actions.length +
                      results.pages.length +
                      results.parts.length
                  )}
                  {renderResultGroup(
                    "Brands",
                    results.brands,
                    results.actions.length +
                      results.pages.length +
                      results.parts.length +
                      results.categories.length
                  )}
                  {renderResultGroup(
                    "Metafields",
                    results.metafields,
                    results.actions.length +
                      results.pages.length +
                      results.parts.length +
                      results.categories.length +
                      results.brands.length +
                      results.models.length +
                      results.types.length +
                      results.manufacturers.length +
                      results.users.length
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-5/20 bg-gray-5/5">
              <div className="flex items-center gap-4 text-xs text-gray-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-5/20 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-5/20 rounded">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-5/20 rounded">Esc</kbd>
                  Close
                </span>
              </div>
              {results && allResults.length > 0 && (
                <span className="text-xs text-gray-4">
                  {allResults.length} results
                </span>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}