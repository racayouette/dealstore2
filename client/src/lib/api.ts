import { apiRequest } from "./queryClient";
import type { 
  Category, 
  Store, 
  DealWithRelations, 
  CategoryWithChildren 
} from "@shared/schema";

export const api = {
  // Categories
  getCategories: async (): Promise<CategoryWithChildren[]> => {
    const res = await apiRequest("GET", "/api/categories");
    return res.json();
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const res = await apiRequest("GET", `/api/categories/${slug}`);
    return res.json();
  },

  // Stores
  getStores: async (): Promise<Store[]> => {
    const res = await apiRequest("GET", "/api/stores");
    return res.json();
  },

  getFeaturedStores: async (): Promise<Store[]> => {
    const res = await apiRequest("GET", "/api/stores/featured");
    return res.json();
  },

  getStoresByLetter: async (letter: string): Promise<Store[]> => {
    const res = await apiRequest("GET", `/api/stores/letter/${letter}`);
    return res.json();
  },

  getStoreBySlug: async (slug: string): Promise<Store> => {
    const res = await apiRequest("GET", `/api/stores/${slug}`);
    return res.json();
  },

  // Deals
  getDeals: async (limit?: number): Promise<DealWithRelations[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await apiRequest("GET", `/api/deals${params}`);
    return res.json();
  },

  getFeaturedDeals: async (limit?: number): Promise<DealWithRelations[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await apiRequest("GET", `/api/deals/featured${params}`);
    return res.json();
  },

  getDealsByCategory: async (slug: string, limit?: number): Promise<DealWithRelations[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await apiRequest("GET", `/api/deals/category/${slug}${params}`);
    return res.json();
  },

  getDealsByStore: async (slug: string, limit?: number): Promise<DealWithRelations[]> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await apiRequest("GET", `/api/deals/store/${slug}${params}`);
    return res.json();
  },

  searchDeals: async (query: string, limit?: number): Promise<DealWithRelations[]> => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append("limit", limit.toString());
    const res = await apiRequest("GET", `/api/deals/search?${params}`);
    return res.json();
  },

  getDealById: async (id: string): Promise<DealWithRelations> => {
    const res = await apiRequest("GET", `/api/deals/${id}`);
    return res.json();
  },

  // Utility
  seedDatabase: async (): Promise<{ message: string }> => {
    const res = await apiRequest("POST", "/api/seed");
    return res.json();
  },
};
