import React, { useEffect, useState } from "react";
import { CreatePetDTO } from "../../../models/pets/CreatePetDTO";

type PetDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: CreatePetDTO) => Promise<void>;
  isLoading: boolean;
};

const initialState: CreatePetDTO = {
  latinName: "",
  name: "",
  type: "MAMMAL",
  salePrice: 1,
};

export const PetDialog: React.FC<PetDialogProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [form, setForm] = useState<CreatePetDTO>(initialState);

  useEffect(() => {
    if (isOpen) {
      setForm(initialState);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="overlay">
      <div className="window" style={{ width: "520px", maxWidth: "95%" }}>
        <div className="titlebar">
          <span className="titlebar-title">Add New Pet</span>
          <div className="titlebar-controls">
            <button className="titlebar-btn close" onClick={onClose} aria-label="Close">
              X
            </button>
          </div>
        </div>

        <div className="window-content">
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <input
              placeholder="Latin name"
              value={form.latinName}
              onChange={(e) => setForm((prev) => ({ ...prev, latinName: e.target.value }))}
              required
            />
            <input
              placeholder="Pet name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as CreatePetDTO["type"] }))}
            >
              <option value="MAMMAL">MAMMAL</option>
              <option value="REPTILE">REPTILE</option>
              <option value="RODENT">RODENT</option>
            </select>
            <input
              type="number"
              min={1}
              step={0.01}
              value={form.salePrice}
              onChange={(e) => setForm((prev) => ({ ...prev, salePrice: Number(e.target.value) }))}
              required
            />

            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <button className="btn btn-standard" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button className="btn btn-accent" type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
