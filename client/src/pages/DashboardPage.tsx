import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IPetAPI } from "../api/pets/IPetAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { PetDTO } from "../models/pets/PetDTO";
import { FiscalReceiptDTO } from "../models/receipts/FiscalReceiptDTO";
import { useAuth } from "../hooks/useAuthHook";
import { DashboardNavbar } from "../components/dashboard/navbar/Navbar";
import { PetFilters } from "../types/PetFilterTypes";
import { PetsFilter } from "../components/pets/pets_filter/PetsFilter";
import { PetCard } from "../components/pets/pet_card/PetCard";
import { PetDialog } from "../components/pets/pet_dialog/PetDialog";
import { CreatePetDTO } from "../models/pets/CreatePetDTO";
import { UserDTO } from "../models/users/UserDTO";
import { getErrorMessage } from "../helpers/error_message";
import { IPetSittingAPI } from "../api/pet_sitting/IPetSittingAPI";
import { IShelterAPI } from "../api/shelters/IShelterAPI";
import { PetSittingTab } from "../components/pet_sitting/PetSittingTab";
import { SheltersTab } from "../components/shelters/SheltersTab";

type DashboardPageProps = {
  petAPI: IPetAPI;
  userAPI: IUserAPI;
  petSittingAPI: IPetSittingAPI;
  shelterAPI: IShelterAPI;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ petAPI, userAPI, petSittingAPI, shelterAPI }) => {
  const { token, user, sessionTime } = useAuth();
  const [allPets, setAllPets] = useState<PetDTO[]>([]);
  const [receipts, setReceipts] = useState<FiscalReceiptDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [receiptQuery, setReceiptQuery] = useState<string>("");
  const [receiptSort, setReceiptSort] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [userQuery, setUserQuery] = useState<string>("");
  const [userSort, setUserSort] = useState<"name_asc" | "name_desc" | "role">("name_asc");
  const [filters, setFilters] = useState<PetFilters>({ sold: "all" });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"store" | "pet-sitting" | "shelters">("store");

  const isManager = user?.role === "MANAGER";
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
      if (isManager) {
        const [pets, fiscalReceipts, systemUsers] = await Promise.all([
          petAPI.getAllPets(token),
          petAPI.getReceipts(token),
          userAPI.getAllUsers(token),
        ]);

        setAllPets(pets);
        setReceipts(fiscalReceipts);
        setUsers(systemUsers);
      }

      if (isSeller) {
        const availablePets = await petAPI.getAvailablePets(token);
        setAllPets(availablePets);
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load dashboard data."));
    } finally {
      setIsLoading(false);
    }
  }, [isManager, isSeller, petAPI, token, userAPI]);

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

  const filteredReceipts = useMemo(() => {
    const query = receiptQuery.trim().toLowerCase();
    const result = receipts.filter((receipt) => !query || Object.values(receipt).some((value) => String(value).toLowerCase().includes(query)));
    return result.sort((a, b) => {
      if (receiptSort === "date_asc") return new Date(a.soldAt).getTime() - new Date(b.soldAt).getTime();
      if (receiptSort === "amount_desc") return b.totalAmount - a.totalAmount;
      if (receiptSort === "amount_asc") return a.totalAmount - b.totalAmount;
      return new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime();
    });
  }, [receiptQuery, receiptSort, receipts]);

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    const result = users.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query)));
    return result.sort((a, b) => {
      if (userSort === "name_desc") return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      if (userSort === "role") return a.role.localeCompare(b.role);
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
  }, [userQuery, userSort, users]);

  const handleAddPet = async (pet: CreatePetDTO) => {
    if (!token) {
      return;
    }

    setIsSaving(true);
    setError("");
    setStatus("");

    try {
      await petAPI.createPet(pet, token);
      setStatus("Pet added successfully.");
      setIsDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to add pet."));
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
      await petAPI.sellPet(petId, token);
      setStatus("Sale created and fiscal receipt issued.");
      await loadData();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to sell pet."));
    }
  };

  const navigation = <div className="card flex gap-2" style={{ padding: 8, marginBottom: 20 }}>
    <button className={`btn ${activeTab === "store" ? "btn-accent" : "btn-ghost"}`} onClick={() => setActiveTab("store")}>Pet Store</button>
    <button className={`btn ${activeTab === "pet-sitting" ? "btn-accent" : "btn-ghost"}`} onClick={() => setActiveTab("pet-sitting")}>Pet Sitting</button>
    <button className={`btn ${activeTab === "shelters" ? "btn-accent" : "btn-ghost"}`} onClick={() => setActiveTab("shelters")}>Shelters</button>
  </div>;

  if (activeTab !== "store") {
    return <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}><DashboardNavbar userAPI={userAPI} /><div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>{navigation}{activeTab === "pet-sitting" ? <PetSittingTab api={petSittingAPI} /> : <SheltersTab api={shelterAPI} />}</div></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--win11-bg)" }}>
      <DashboardNavbar userAPI={userAPI} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {navigation}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}>Pet Store Dashboard</h1>
          </div>

          {isManager && (
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
            Sales are available only during working hours, from 08:00 to 22:00.
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

            {isManager && (
              <div className="card" style={{ padding: 16 }}>
                <h3 style={{ marginBottom: 8 }}>Fiscal Receipts</h3>
                <div className="flex gap-2" style={{ marginBottom: 12 }}>
                  <input type="search" placeholder="Search any receipt field..." value={receiptQuery} onChange={(event) => setReceiptQuery(event.target.value)} />
                  <select value={receiptSort} onChange={(event) => setReceiptSort(event.target.value as typeof receiptSort)}>
                    <option value="date_desc">Newest first</option><option value="date_asc">Oldest first</option><option value="amount_desc">Amount high-low</option><option value="amount_asc">Amount low-high</option>
                  </select>
                </div>
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
                      {filteredReceipts.map((receipt) => (
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

            {isManager && (
              <div className="card" style={{ padding: 16, marginTop: 16 }}>
                <h3 style={{ marginBottom: 8 }}>System Users</h3>
                <div className="flex gap-2" style={{ marginBottom: 12 }}>
                  <input type="search" placeholder="Search any user field..." value={userQuery} onChange={(event) => setUserQuery(event.target.value)} />
                  <select value={userSort} onChange={(event) => setUserSort(event.target.value as typeof userSort)}>
                    <option value="name_asc">Name A-Z</option><option value="name_desc">Name Z-A</option><option value="role">Role</option>
                  </select>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th style={{ textAlign: "left", padding: 8 }}>Name</th><th style={{ textAlign: "left", padding: 8 }}>Username</th><th style={{ textAlign: "left", padding: 8 }}>Role</th></tr></thead>
                    <tbody>{filteredUsers.map((item) => <tr key={item.id}><td style={{ padding: 8 }}>{item.firstName} {item.lastName}</td><td style={{ padding: 8 }}>{item.username}</td><td style={{ padding: 8 }}>{item.role}</td></tr>)}</tbody>
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
