import { Pet } from "../models/Pet";

export interface IPetRepository {
  getAll(): Promise<Pet[]>;
  getUnsold(): Promise<Pet[]>;
  findById(id: number): Promise<Pet | null>;
  countUnsold(): Promise<number>;
  add(input: Omit<Pet, "id">): Promise<Pet>;
  markAsSold(id: number): Promise<Pet>;
}
