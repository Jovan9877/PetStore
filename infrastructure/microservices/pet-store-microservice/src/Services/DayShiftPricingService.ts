import { ISalesPricingService } from "../Domain/services/ISalesPricingService";

export class DayShiftPricingService implements ISalesPricingService {
  calculateFinalAmount(basePrice: number): number {
    return Number((basePrice * 0.85).toFixed(2));
  }
}
