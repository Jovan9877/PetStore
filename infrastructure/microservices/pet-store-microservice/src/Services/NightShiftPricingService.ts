import { ISalesPricingService } from "../Domain/services/ISalesPricingService";

export class NightShiftPricingService implements ISalesPricingService {
  calculateFinalAmount(basePrice: number): number {
    return Number((basePrice * 1.1).toFixed(2));
  }
}
