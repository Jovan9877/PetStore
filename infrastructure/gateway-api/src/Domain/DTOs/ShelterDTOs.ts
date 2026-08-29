export type ShelterDTO = { id: number; name: string; city: string; phone: string };
export type ShelterPetDTO = { id: number; shelterId: number; name: string; birthYear: number; breed: string; type: string; status: "AVAILABLE" | "RESERVED"; addedAt: string };
export type ShelterReservationDTO = { id: number; petId: number; customerName: string; customerPhone: string; reservedBy: string; reservedAt: string; expiresAt: string; status: "ACTIVE" | "EXPIRED" };
export type ShelterDataDTO = { shelters: ShelterDTO[]; pets: ShelterPetDTO[]; reservations: ShelterReservationDTO[] };
export type ReserveShelterPetDTO = { customerName: string; customerPhone: string };
