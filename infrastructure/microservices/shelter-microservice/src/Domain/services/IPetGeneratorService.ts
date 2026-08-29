import { ShelterPet } from "../models/ShelterPet";
export interface IPetGeneratorService { generate(shelterId: number, now: Date): Omit<ShelterPet, "id">; }
