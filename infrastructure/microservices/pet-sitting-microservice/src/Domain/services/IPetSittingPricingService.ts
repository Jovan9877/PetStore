export type PetSittingPrice = { billableHours: number; hourlyRate: number; totalAmount: number };
export interface IPetSittingPricingService { calculate(arrival: Date, departure: Date): PetSittingPrice; }
