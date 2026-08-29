import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PetDTO } from "../Domain/DTOs/PetDTO";
import { CreatePetDTO } from "../Domain/DTOs/CreatePetDTO";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";
import { CreatePetSittingDTO } from "../Domain/DTOs/CreatePetSittingDTO";
import { PetSittingStayDTO } from "../Domain/DTOs/PetSittingStayDTO";
import { PetSittingReceiptDTO } from "../Domain/DTOs/PetSittingReceiptDTO";
import { ReserveShelterPetDTO, ShelterDataDTO, ShelterReservationDTO } from "../Domain/DTOs/ShelterDTOs";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly petStoreClient: AxiosInstance;
  private readonly petSittingClient: AxiosInstance;
  private readonly shelterClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const petStoreBaseURL = process.env.PET_STORE_SERVICE_API;
    const petSittingBaseURL = process.env.PET_SITTING_SERVICE_API;
    const shelterBaseURL = process.env.SHELTER_SERVICE_API;
    const internalHeaders = {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": process.env.INTERNAL_API_KEY as string,
    };

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: internalHeaders,
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: internalHeaders,
      timeout: 5000,
    });
    this.petStoreClient = axios.create({
      baseURL: petStoreBaseURL,
      headers: internalHeaders,
      timeout: 5000,
    });
    this.petSittingClient = axios.create({ baseURL: petSittingBaseURL, headers: internalHeaders, timeout: 5000 });
    this.shelterClient = axios.create({ baseURL: shelterBaseURL, headers: internalHeaders, timeout: 5000 });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    try {
      const response = await this.userClient.get<UserDTO[]>("/users");
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async getUserById(id: string): Promise<UserDTO> {
    try {
      const response = await this.userClient.get<UserDTO>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  // Pet store microservice
  async getAllPets(): Promise<PetDTO[]> {
    try {
      const response = await this.petStoreClient.get<PetDTO[]>("/pets");
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async getAvailablePets(): Promise<PetDTO[]> {
    try {
      const response = await this.petStoreClient.get<PetDTO[]>("/pets/available");
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async createPet(data: CreatePetDTO): Promise<PetDTO> {
    try {
      const response = await this.petStoreClient.post<PetDTO>("/pets", data);
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async sellPet(petId: number, sellerName: string, simulatedTime?: string): Promise<FiscalReceiptDTO> {
    try {
      const response = await this.petStoreClient.post<FiscalReceiptDTO>(`/sales/${petId}`, {
        sellerName,
        simulatedTime,
      });
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async getReceipts(): Promise<FiscalReceiptDTO[]> {
    try {
      const response = await this.petStoreClient.get<FiscalReceiptDTO[]>("/receipts");
      return response.data;
    } catch (error) {
      throw new Error(this.extractServiceError(error));
    }
  }

  async getPetSittingStays(): Promise<PetSittingStayDTO[]> {
    try { return (await this.petSittingClient.get<PetSittingStayDTO[]>("/pet-sitting/stays")).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }
  async createPetSitting(data: CreatePetSittingDTO, sellerName: string, simulatedDateTime?: string): Promise<PetSittingStayDTO> {
    try { return (await this.petSittingClient.post<PetSittingStayDTO>("/pet-sitting/stays", { data, sellerName, simulatedDateTime })).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }
  async checkoutPetSitting(id: number, sellerName: string, simulatedDateTime?: string): Promise<{ stay: PetSittingStayDTO; receipt: PetSittingReceiptDTO }> {
    try { return (await this.petSittingClient.post<{ stay: PetSittingStayDTO; receipt: PetSittingReceiptDTO }>(`/pet-sitting/stays/${id}/checkout`, { sellerName, simulatedDateTime })).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }
  async getPetSittingReceipts(): Promise<PetSittingReceiptDTO[]> {
    try { return (await this.petSittingClient.get<PetSittingReceiptDTO[]>("/pet-sitting/receipts")).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }
  async getShelterData(simulatedDateTime?: string): Promise<ShelterDataDTO> {
    try { return (await this.shelterClient.get<ShelterDataDTO>("/shelters/data", { params: { simulatedDateTime } })).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }
  async reserveShelterPet(id: number, data: ReserveShelterPetDTO, reservedBy: string, simulatedDateTime?: string): Promise<ShelterReservationDTO> {
    try { return (await this.shelterClient.post<ShelterReservationDTO>(`/shelters/pets/${id}/reserve`, { data, reservedBy, simulatedDateTime })).data; }
    catch (error) { throw new Error(this.extractServiceError(error)); }
  }

  private extractServiceError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }

      if (typeof error.message === "string" && error.message.trim().length > 0) {
        return error.message;
      }
    }

    return "Unexpected service error.";
  }
}
