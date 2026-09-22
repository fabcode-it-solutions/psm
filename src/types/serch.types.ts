/**
 * Universal Search Types
 * 
 * TypeScript type definitions for the universal search system
 */

export type SearchCategory = 
  | 'actions' 
  | 'pages' 
  | 'parts' 
  | 'categories' 
  | 'brands' 
  | 'models' 
  | 'types' 
  | 'manufacturers' 
  | 'users' 
  | 'metafields';

export interface SearchResult {
  id: string | number;
  title: string;
  subtitle: string;
  route: string;
  icon?: string;
  image?: string;
  category: SearchCategory;
  
  // Optional fields for specific categories
  price?: number;
  stock?: number;
  status?: string;
  role?: string;
  description?: string;
}

export interface SearchResults {
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

export interface UniversalSearchResponse {
  success: boolean;
  query: string;
  results: SearchResults;
  totalResults: number;
  error?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  category: 'actions';
  route: string;
  icon: string;
  keywords?: string[];
}

export interface PageNavigation {
  id: string;
  title: string;
  category: 'pages';
  route: string;
  icon: string;
  keywords: string[];
}

export interface SearchState {
  query: string;
  results: SearchResults;
  loading: boolean;
  selectedIndex: number;
  recentSearches: string[];
}