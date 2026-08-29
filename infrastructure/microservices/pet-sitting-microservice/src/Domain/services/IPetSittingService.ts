import { CreatePetSittingDTO } from "../DTOs/CreatePetSittingDTO";
import { PetSittingReceipt } from "../models/PetSittingReceipt";
import { PetSittingStay } from "../models/PetSittingStay";

export interface IPetSittingService {
  getStays(): Promise<PetSittingStay[]>;
  getReceipts(): Promise<PetSittingReceipt[]>;
  checkIn(data: CreatePetSittingDTO, sellerName: string, simulatedDateTime?: string): Promise<PetSittingStay>;
  checkOut(id: number, sellerName: string, simulatedDateTime?: string): Promise<{ stay: PetSittingStay; receipt: PetSittingReceipt }>;
}
