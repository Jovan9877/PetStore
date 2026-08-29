import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { PetDTO } from "../DTOs/PetDTO";
import { FiscalReceiptDTO } from "../DTOs/FiscalReceiptDTO";
import { CreatePetDTO } from "../DTOs/CreatePetDTO";
import { CreatePetSittingDTO } from "../DTOs/CreatePetSittingDTO";
import { PetSittingReceiptDTO } from "../DTOs/PetSittingReceiptDTO";
import { PetSittingStayDTO } from "../DTOs/PetSittingStayDTO";
import { ReserveShelterPetDTO, ShelterDataDTO, ShelterReservationDTO } from "../DTOs/ShelterDTOs";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: string): Promise<UserDTO>;

  // Pet store
  getAllPets(): Promise<PetDTO[]>;
  getAvailablePets(): Promise<PetDTO[]>;
  createPet(data: CreatePetDTO): Promise<PetDTO>;
  sellPet(petId: number, sellerName: string, simulatedTime?: string): Promise<FiscalReceiptDTO>;
  getReceipts(): Promise<FiscalReceiptDTO[]>;
  getPetSittingStays(): Promise<PetSittingStayDTO[]>;
  createPetSitting(data: CreatePetSittingDTO, sellerName: string, simulatedDateTime?: string): Promise<PetSittingStayDTO>;
  checkoutPetSitting(id: number, sellerName: string, simulatedDateTime?: string): Promise<{ stay: PetSittingStayDTO; receipt: PetSittingReceiptDTO }>;
  getPetSittingReceipts(): Promise<PetSittingReceiptDTO[]>;
  getShelterData(simulatedDateTime?: string): Promise<ShelterDataDTO>;
  reserveShelterPet(id: number, data: ReserveShelterPetDTO, reservedBy: string, simulatedDateTime?: string): Promise<ShelterReservationDTO>;
}
