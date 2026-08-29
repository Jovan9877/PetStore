import { IClockService } from "../Domain/services/IClockService";

export class ClockService implements IClockService {
  now(simulatedDateTime?: string): Date {
    if (!simulatedDateTime) return new Date();
    const parsed = new Date(simulatedDateTime);
    if (Number.isNaN(parsed.getTime())) throw new Error("Invalid simulation date and time.");
    return parsed;
  }
}
