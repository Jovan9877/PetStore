import axios, { AxiosInstance } from "axios";
import { readValueByKey } from "../../helpers/local_storage";
import { CreatePetSittingDTO, PetSittingReceiptDTO, PetSittingStayDTO } from "../../models/pet_sitting/PetSittingModels";
import { IPetSittingAPI } from "./IPetSittingAPI";
export class PetSittingAPI implements IPetSittingAPI {
  private readonly client: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" } });
  private headers(token: string) { const value = readValueByKey("simulationDateTime"); return { Authorization: `Bearer ${token}`, ...(value ? { "X-Simulated-Time": value } : {}) }; }
  async getStays(token: string) { return (await this.client.get<PetSittingStayDTO[]>("/pet-sitting/stays", { headers: this.headers(token) })).data; }
  async checkIn(data: CreatePetSittingDTO, token: string) { return (await this.client.post<PetSittingStayDTO>("/pet-sitting/stays", data, { headers: this.headers(token) })).data; }
  async checkOut(id: number, token: string) { return (await this.client.post<{ stay: PetSittingStayDTO; receipt: PetSittingReceiptDTO }>(`/pet-sitting/stays/${id}/checkout`, {}, { headers: this.headers(token) })).data; }
  async getReceipts(token: string) { return (await this.client.get<PetSittingReceiptDTO[]>("/pet-sitting/receipts", { headers: this.headers(token) })).data; }
}
