import { PetSittingPetType } from "../enums/PetSittingPetType";

export type CreatePetSittingDTO = {
  petName: string;
  petType: PetSittingPetType;
  birthYear: number;
  ownerName: string;
  ownerPhone: string;
  plannedHours: number;
};
