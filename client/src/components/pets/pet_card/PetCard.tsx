import React from "react";
import { PetDTO } from "../../../models/pets/PetDTO";

type PetCardProps = {
  pet: PetDTO;
  canSell: boolean;
  onSell: (id: number) => void;
};

export const PetCard: React.FC<PetCardProps> = ({ pet, canSell, onSell }) => {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{pet.name}</h3>
        <span style={{ fontSize: 12, color: "var(--win11-text-tertiary)" }}>#{pet.id}</span>
      </div>

      <p style={{ marginBottom: 6 }}><strong>Latin:</strong> {pet.latinName}</p>
      <p style={{ marginBottom: 6 }}><strong>Type:</strong> {pet.type}</p>
      <p style={{ marginBottom: 6 }}><strong>Price:</strong> {pet.salePrice}</p>
      <p style={{ marginBottom: 12 }}><strong>Status:</strong> {pet.sold ? "Sold" : "Available"}</p>

      {canSell && !pet.sold && (
        <button className="btn btn-accent" onClick={() => onSell(pet.id)}>
          Sell Pet
        </button>
      )}
    </div>
  );
};
