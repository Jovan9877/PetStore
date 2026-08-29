import React from "react";
import { PetFilters } from "../../../types/PetFilterTypes";

type PetsFilterProps = {
  filters: PetFilters;
  onChange: (filters: PetFilters) => void;
};

export const PetsFilter: React.FC<PetsFilterProps> = ({ filters, onChange }) => {
  return (
    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <select
          value={filters.type ?? ""}
          onChange={(e) => onChange({ ...filters, type: (e.target.value || undefined) as PetFilters["type"] })}
        >
          <option value="">All Types</option>
          <option value="MAMMAL">MAMMAL</option>
          <option value="REPTILE">REPTILE</option>
          <option value="RODENT">RODENT</option>
        </select>

        <select
          value={filters.sold ?? "all"}
          onChange={(e) => onChange({ ...filters, sold: e.target.value as PetFilters["sold"] })}
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <input
          type="number"
          min={0}
          placeholder="Min price"
          value={filters.minPrice ?? ""}
          onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
        />

        <input
          type="number"
          min={0}
          placeholder="Max price"
          value={filters.maxPrice ?? ""}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        />

        <select
          value={filters.sortBy ?? ""}
          onChange={(e) => onChange({ ...filters, sortBy: (e.target.value || undefined) as PetFilters["sortBy"] })}
        >
          <option value="">No Sorting</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
          <option value="price_asc">Price Low-High</option>
          <option value="price_desc">Price High-Low</option>
        </select>
      </div>
    </div>
  );
};
