import axios, { AxiosInstance } from "axios";
import { readValueByKey } from "../../helpers/local_storage";
import { ReserveShelterPetDTO, ShelterDataDTO, ShelterReservationDTO } from "../../models/shelters/ShelterModels";
import { IShelterAPI } from "./IShelterAPI";
export class ShelterAPI implements IShelterAPI {
  private readonly client: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" } });
  private headers(token: string) { const value = readValueByKey("simulationDateTime"); return { Authorization: `Bearer ${token}`, ...(value ? { "X-Simulated-Time": value } : {}) }; }
  async getData(token: string) { return (await this.client.get<ShelterDataDTO>("/shelters/data", { headers: this.headers(token) })).data; }
  async reserve(id: number, data: ReserveShelterPetDTO, token: string) { return (await this.client.post<ShelterReservationDTO>(`/shelters/pets/${id}/reserve`, data, { headers: this.headers(token) })).data; }
}
