import { PetSittingPetType } from "../enums/PetSittingPetType";
import { PetSittingStatus } from "../enums/PetSittingStatus";

export type PetSittingStay = {
  id: number;
  petName: string;
  petType: PetSittingPetType;
  birthYear: number;
  ownerName: string;
  ownerPhone: string;
  plannedHours: number;
  arrivalAt: string;
  checkedInBy: string;
  status: PetSittingStatus;
  departureAt?: string;
  checkedOutBy?: string;
  billableHours?: number;
  totalAmount?: number;
};
