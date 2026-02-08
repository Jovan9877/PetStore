import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { PetDTO } from "../DTOs/PetDTO";
import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { CreatePetDTO } from "../DTOs/CreatePetDTO";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Pet store
  getAllPets(): Promise<PetDTO[]>;
  getAvailablePets(): Promise<PetDTO[]>;
  createPet(data: CreatePetDTO): Promise<PetDTO>;
  sellPet(petId: number, sellerName: string, simulatedTime?: string): Promise<FiscalReceiptDTO>;
  getReceipts(): Promise<FiscalReceiptDTO[]>;
}
