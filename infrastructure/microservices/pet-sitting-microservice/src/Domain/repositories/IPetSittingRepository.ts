import { PetSittingReceipt } from "../models/PetSittingReceipt";
import { PetSittingStay } from "../models/PetSittingStay";

export interface IPetSittingRepository {
  getStays(): Promise<PetSittingStay[]>;
  getReceipts(): Promise<PetSittingReceipt[]>;
  findStay(id: number): Promise<PetSittingStay | null>;
  addStay(input: Omit<PetSittingStay, "id">): Promise<PetSittingStay>;
  completeStay(id: number, completion: Omit<PetSittingReceipt, "id" | "stayId"> & { departureAt: string; checkedOutBy: string }): Promise<{ stay: PetSittingStay; receipt: PetSittingReceipt }>;
}
