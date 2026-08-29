import { ReserveShelterPetDTO } from "../DTOs/ReserveShelterPetDTO";
import { ShelterData } from "../repositories/IShelterRepository";
import { ShelterPet } from "../models/ShelterPet";
import { ShelterReservation } from "../models/ShelterReservation";
export interface IShelterService {
  getData(simulatedDateTime?: string): Promise<ShelterData>;
  reserve(petId: number, data: ReserveShelterPetDTO, reservedBy: string, simulatedDateTime?: string): Promise<ShelterReservation>;
  simulateChange(): Promise<{ action: "ADDED" | "REMOVED"; pet: ShelterPet } | null>;
}
