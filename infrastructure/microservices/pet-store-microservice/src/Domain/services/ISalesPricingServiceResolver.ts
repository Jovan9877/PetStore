import { ISalesPricingService } from "./ISalesPricingService";

export interface ISalesPricingServiceResolver {
  resolve(hour: number): ISalesPricingService;
}
