import { Shelter } from "../models/Shelter";
import { ShelterPet } from "../models/ShelterPet";
import { ShelterReservation } from "../models/ShelterReservation";
export type ShelterData = { shelters: Shelter[]; pets: ShelterPet[]; reservations: ShelterReservation[] };
export interface IShelterRepository {
  getData(): Promise<ShelterData>;
  releaseExpired(now: Date): Promise<number>;
  reserve(petId: number, customerName: string, customerPhone: string, reservedBy: string, now: Date, expiresAt: Date): Promise<ShelterReservation>;
  addPet(input: Omit<ShelterPet, "id">): Promise<ShelterPet>;
  removeRandomAvailable(randomValue: number): Promise<ShelterPet | null>;
  trimAvailableToMaximum(maximumPets: number, randomValue: number): Promise<ShelterPet[]>;
}
