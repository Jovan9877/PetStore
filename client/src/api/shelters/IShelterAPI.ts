import { ReserveShelterPetDTO, ShelterDataDTO, ShelterReservationDTO } from "../../models/shelters/ShelterModels";
export interface IShelterAPI { getData(token: string): Promise<ShelterDataDTO>; reserve(id: number, data: ReserveShelterPetDTO, token: string): Promise<ShelterReservationDTO>; }
