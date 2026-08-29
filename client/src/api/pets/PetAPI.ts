import axios, { AxiosInstance } from "axios";
import { PetDTO } from "../../models/pets/PetDTO";
import { CreatePetDTO } from "../../models/pets/CreatePetDTO";
import { FiscalReceiptDTO } from "../../models/receipts/FiscalReceiptDTO";
import { IPetAPI } from "./IPetAPI";
import { readValueByKey } from "../../helpers/local_storage";

export class PetAPI implements IPetAPI {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  private headers(token: string) {
    const simulationDateTime = readValueByKey("simulationDateTime");
    return {
      Authorization: `Bearer ${token}`,
      ...(simulationDateTime ? { "X-Simulated-Time": simulationDateTime } : {}),
    };
  }

  async getAllPets(token: string): Promise<PetDTO[]> {
    return (await this.client.get<PetDTO[]>("/pets", { headers: this.headers(token) })).data;
  }

  async getAvailablePets(token: string): Promise<PetDTO[]> {
    return (await this.client.get<PetDTO[]>("/pets/available", { headers: this.headers(token) })).data;
  }

  async createPet(pet: CreatePetDTO, token: string): Promise<PetDTO> {
    return (await this.client.post<PetDTO>("/pets", pet, { headers: this.headers(token) })).data;
  }

  async sellPet(petId: number, token: string): Promise<FiscalReceiptDTO> {
    return (await this.client.post<FiscalReceiptDTO>(`/sales/${petId}`, {}, { headers: this.headers(token) })).data;
  }

  async getReceipts(token: string): Promise<FiscalReceiptDTO[]> {
    return (await this.client.get<FiscalReceiptDTO[]>("/receipts", { headers: this.headers(token) })).data;
  }
}
