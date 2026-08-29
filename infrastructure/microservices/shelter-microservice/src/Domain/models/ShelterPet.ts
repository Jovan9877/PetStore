import { ShelterPetStatus } from "../enums/ShelterPetStatus";
import { ShelterPetType } from "../enums/ShelterPetType";
export type ShelterPet = { id: number; shelterId: number; name: string; birthYear: number; breed: string; type: ShelterPetType; status: ShelterPetStatus; addedAt: string };
