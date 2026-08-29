import { ISalesPricingService } from "../Domain/services/ISalesPricingService";
import { ISalesPricingServiceResolver } from "../Domain/services/ISalesPricingServiceResolver";

export class ShiftPricingServiceResolver implements ISalesPricingServiceResolver {
  constructor(
    private readonly dayShiftPricing: ISalesPricingService,
    private readonly nightShiftPricing: ISalesPricingService
  ) {}

  resolve(hour: number): ISalesPricingService {
    return hour >= 8 && hour < 16 ? this.dayShiftPricing : this.nightShiftPricing;
  }
}
