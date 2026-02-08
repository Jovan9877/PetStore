import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";
import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { FiscalReceiptDTO } from "../../models/receipts/FiscalReceiptDTO";
import { readValueByKey } from "../../helpers/local_storage";

export class PlantAPI implements IPlantAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    const sessionTime = readValueByKey("sessionTime");
    return {
      Authorization: `Bearer ${token}`,
      ...(sessionTime ? { "X-Simulated-Time": sessionTime } : {}),
    };
  }

  async getAllPets(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<PlantDTO[]> = await this.axiosInstance.get("/pets", {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async getAvailablePets(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<PlantDTO[]> = await this.axiosInstance.get("/pets/available", {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async createPet(pet: CreatePlantDTO, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.post("/pets", pet, {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }

  async sellPet(petId: number, token: string): Promise<FiscalReceiptDTO> {
    const response: AxiosResponse<FiscalReceiptDTO> = await this.axiosInstance.post(
      `/sales/${petId}`,
      {},
      {
        headers: this.getAuthHeaders(token),
      }
    );
    return response.data;
  }

  async getReceipts(token: string): Promise<FiscalReceiptDTO[]> {
    const response: AxiosResponse<FiscalReceiptDTO[]> = await this.axiosInstance.get("/receipts", {
      headers: this.getAuthHeaders(token),
    });
    return response.data;
  }
}
