import { IPetSittingPricingService, PetSittingPrice } from "../Domain/services/IPetSittingPricingService";

export class HourlyPetSittingPricingService implements IPetSittingPricingService {
  constructor(private readonly hourlyRate: number) {}
  calculate(arrival: Date, departure: Date): PetSittingPrice {
    const duration = departure.getTime() - arrival.getTime();
    if (duration < 0) throw new Error("Departure cannot be before arrival.");
    const billableHours = Math.max(1, Math.ceil(duration / 3_600_000));
    return { billableHours, hourlyRate: this.hourlyRate, totalAmount: billableHours * this.hourlyRate };
  }
}
