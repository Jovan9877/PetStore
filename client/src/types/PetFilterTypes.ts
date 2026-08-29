export interface PetFilters {
  type?: "MAMMAL" | "REPTILE" | "RODENT";
  sold?: "all" | "sold" | "available";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name_asc" | "name_desc" | "price_asc" | "price_desc";
}
