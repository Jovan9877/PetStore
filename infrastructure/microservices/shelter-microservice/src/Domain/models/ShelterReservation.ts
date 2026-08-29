import { ReservationStatus } from "../enums/ReservationStatus";
export type ShelterReservation = { id: number; petId: number; customerName: string; customerPhone: string; reservedBy: string; reservedAt: string; expiresAt: string; status: ReservationStatus };
