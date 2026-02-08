import { PlantDTO } from "../../models/plants/PlantDTO";
import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { FiscalReceiptDTO } from "../../models/receipts/FiscalReceiptDTO";

export interface IPlantAPI {
  getAllPets(token: string): Promise<PlantDTO[]>;
  getAvailablePets(token: string): Promise<PlantDTO[]>;
  createPet(pet: CreatePlantDTO, token: string): Promise<PlantDTO>;
  sellPet(petId: number, token: string): Promise<FiscalReceiptDTO>;
  getReceipts(token: string): Promise<FiscalReceiptDTO[]>;
}
