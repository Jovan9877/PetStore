import { AddPetDTO } from "../DTOs/AddPetDTO";
import { FiscalReceipt } from "../models/FiscalReceipt";
import { Pet } from "../models/Pet";

export interface IPetStoreService {
  getAllPets(): Promise<Pet[]>;
  getUnsoldPets(): Promise<Pet[]>;
  addPet(data: AddPetDTO): Promise<Pet>;
  sellPet(petId: number, sellerName: string, simulatedTime?: string): Promise<FiscalReceipt>;
  getReceipts(): Promise<FiscalReceipt[]>;
}
