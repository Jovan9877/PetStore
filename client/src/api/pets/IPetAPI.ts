import { PetDTO } from "../../models/pets/PetDTO";
import { CreatePetDTO } from "../../models/pets/CreatePetDTO";
import { FiscalReceiptDTO } from "../../models/receipts/FiscalReceiptDTO";

export interface IPetAPI {
  getAllPets(token: string): Promise<PetDTO[]>;
  getAvailablePets(token: string): Promise<PetDTO[]>;
  createPet(pet: CreatePetDTO, token: string): Promise<PetDTO>;
  sellPet(petId: number, token: string): Promise<FiscalReceiptDTO>;
  getReceipts(token: string): Promise<FiscalReceiptDTO[]>;
}
