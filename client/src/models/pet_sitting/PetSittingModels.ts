export type PetSittingPetType = "DOG" | "CAT" | "BIRD" | "RODENT" | "REPTILE" | "OTHER";
export type CreatePetSittingDTO = { petName: string; petType: PetSittingPetType; birthYear: number; ownerName: string; ownerPhone: string; plannedHours: number };
export type PetSittingStayDTO = { id: number; petName: string; petType: PetSittingPetType; birthYear: number; ownerName: string; ownerPhone: string; plannedHours: number; arrivalAt: string; checkedInBy: string; status: "ACTIVE" | "COMPLETED"; departureAt?: string; checkedOutBy?: string; billableHours?: number; totalAmount?: number };
export type PetSittingReceiptDTO = { id: number; stayId: number; sellerName: string; issuedAt: string; billableHours: number; hourlyRate: number; totalAmount: number };
