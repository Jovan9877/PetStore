import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PetDTO } from "../Domain/DTOs/PetDTO";
import { CreatePetDTO } from "../Domain/DTOs/CreatePetDTO";
import { FiscalReceiptDTO } from "../Domain/DTOs/FiscalReceiptDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly petStoreClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const petStoreBaseURL = process.env.PET_STORE_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    this.petStoreClient = axios.create({
      baseURL: petStoreBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
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

  async getUserById(id: number): Promise<UserDTO> {
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
