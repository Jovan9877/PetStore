import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { PlantDTO } from "../models/plants/PlantDTO";
import { FiscalReceiptDTO } from "../models/receipts/FiscalReceiptDTO";
import { useAuth } from "../hooks/useAuthHook";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { PlantFiltersTypes } from "../types/PlantFilterTypes";
import { PetsFilter } from "../components/pets/pets_filter/PetsFilter";
import { PetCard } from "../components/pets/pet_card/PetCard";
import { PetDialog } from "../components/pets/pet_dialog/PetDialog";
import { CreatePlantDTO } from "../models/plants/CreatePlantDTO";

type DashboardPageProps = {
  plantAPI: IPlantAPI;
  userAPI: IUserAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ plantAPI, userAPI }) => {
  const { token, user, sessionTime } = useAuth();
  const [allPets, setAllPets] = useState<PlantDTO[]>([]);
  const [receipts, setReceipts] = useState<FiscalReceiptDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<PlantFiltersTypes>({ sold: "all" });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const currentHour = sessionTime ? parseInt(sessionTime.split(":")[0], 10) : new Date().getHours();
  const isShiftOpen = currentHour >= 8 && currentHour < 22;

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isAdmin) {
        const [pets, fiscalReceipts] = await Promise.all([
          plantAPI.getAllPets(token),
          plantAPI.getReceipts(token),
        ]);

        setAllPets(pets);
        setReceipts(fiscalReceipts);
      }

      if (isSeller) {
        const availablePets = await plantAPI.getAvailablePets(token);
        setAllPets(availablePets);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isSeller, plantAPI, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPets = useMemo(() => {
    let result = [...allPets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (pet) =>
          pet.name.toLowerCase().includes(q) ||
          pet.latinName.toLowerCase().includes(q) ||
          pet.type.toLowerCase().includes(q)
      );
    }

    if (filters.type) {
      result = result.filter((pet) => pet.type === filters.type);
    }

    if (filters.sold && filters.sold !== "all") {
      const sold = filters.sold === "sold";
      result = result.filter((pet) => pet.sold === sold);
    }

    if (typeof filters.minPrice === "number") {
      result = result.filter((pet) => pet.salePrice >= filters.minPrice!);
    }

    if (typeof filters.maxPrice === "number") {
      result = result.filter((pet) => pet.salePrice <= filters.maxPrice!);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price_asc":
          result.sort((a, b) => a.salePrice - b.salePrice);
          break;
        case "price_desc":
          result.sort((a, b) => b.salePrice - a.salePrice);
          break;
      }
    }

    return result;
  }, [allPets, filters, searchQuery]);

  const handleAddPet = async (pet: CreatePlantDTO) => {
    if (!token) {
      return;
    }

    setIsSaving(true);
    setError("");
    setStatus("");

    try {
      await plantAPI.createPet(pet, token);
      setStatus("Pet added successfully.");
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to add pet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSellPet = async (petId: number) => {
    if (!token) {
      return;
    }

    setError("");
    setStatus("");

    try {
      await plantAPI.sellPet(petId, token);
      setStatus("Sale created and fiscal receipt issued.");
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to sell pet.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      <DashboardNavbar userAPI={userAPI} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Pet Store Dashboard</h1>
            <p style={{ margin: 0 }}>Role: {user?.role}</p>
          </div>

          {isAdmin && (
            <button className="btn btn-accent" onClick={() => setIsDialogOpen(true)}>
              Add Pet
            </button>
          )}
        </div>

        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <input
            type="search"
            placeholder="Search by name, latin name, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <PetsFilter filters={filters} onChange={setFilters} />

        {status && <div className="card" style={{ marginBottom: 16, padding: 12 }}>{status}</div>}
        {error && (
          <div className="card" style={{ marginBottom: 16, padding: 12, borderColor: "var(--win11-close-hover)" }}>
            {error}
          </div>
        )}
        {isSeller && !isShiftOpen && (
          <div className="card" style={{ marginBottom: 16, padding: 12, borderColor: "var(--win11-divider)" }}>
            Sales are available only during shifts 08:00-22:00. Selected session time: {sessionTime ?? `${currentHour}:00`}.
          </div>
        )}

        {isLoading ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0 }}>Loading data...</p>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: 12 }}>
              Showing {filteredPets.length} of {allPets.length} pets
            </p>

            {filteredPets.length === 0 ? (
              <div className="card" style={{ padding: 24 }}>
                No pets for current filters.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {filteredPets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} canSell={isSeller && isShiftOpen} onSell={handleSellPet} />
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Fiscal Receipts</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: 8 }}>ID</th>
                        <th style={{ textAlign: "left", padding: 8 }}>Seller</th>
                        <th style={{ textAlign: "left", padding: 8 }}>Sold At</th>
                        <th style={{ textAlign: "left", padding: 8 }}>Total</th>
                        <th style={{ textAlign: "left", padding: 8 }}>Pet ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((receipt) => (
                        <tr key={receipt.id}>
                          <td style={{ padding: 8 }}>{receipt.id}</td>
                          <td style={{ padding: 8 }}>{receipt.sellerName}</td>
                          <td style={{ padding: 8 }}>{new Date(receipt.soldAt).toLocaleString()}</td>
                          <td style={{ padding: 8 }}>{receipt.totalAmount}</td>
                          <td style={{ padding: 8 }}>{receipt.petId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleAddPet}
        isLoading={isSaving}
      />
    </div>
  );
};
