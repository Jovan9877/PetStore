import { CreatePetSittingDTO, PetSittingReceiptDTO, PetSittingStayDTO } from "../../models/pet_sitting/PetSittingModels";
export interface IPetSittingAPI {
  getStays(token: string): Promise<PetSittingStayDTO[]>;
  checkIn(data: CreatePetSittingDTO, token: string): Promise<PetSittingStayDTO>;
  checkOut(id: number, token: string): Promise<{ stay: PetSittingStayDTO; receipt: PetSittingReceiptDTO }>;
  getReceipts(token: string): Promise<PetSittingReceiptDTO[]>;
}
