import { CreatePetSittingDTO } from "../Domain/DTOs/CreatePetSittingDTO";
import { LogLevel } from "../Domain/enums/LogLevel";
import { PetSittingPetType } from "../Domain/enums/PetSittingPetType";
import { PetSittingStatus } from "../Domain/enums/PetSittingStatus";
import { IPetSittingRepository } from "../Domain/repositories/IPetSittingRepository";
import { IClockService } from "../Domain/services/IClockService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IPetSittingPricingService } from "../Domain/services/IPetSittingPricingService";
import { IPetSittingService } from "../Domain/services/IPetSittingService";

export class PetSittingService implements IPetSittingService {
  constructor(
    private readonly repository: IPetSittingRepository,
    private readonly pricing: IPetSittingPricingService,
    private readonly clock: IClockService,
    private readonly logger: ILoggerService
  ) {}

  async getStays() {
    const stays = await this.repository.getStays();
    await this.logger.log(LogLevel.INFO, `Returned ${stays.length} pet sitting stays.`);
    return stays;
  }

  async getReceipts() {
    const receipts = await this.repository.getReceipts();
    await this.logger.log(LogLevel.INFO, `Returned ${receipts.length} pet sitting receipts.`);
    return receipts;
  }

  async checkIn(data: CreatePetSittingDTO, sellerName: string, simulatedDateTime?: string) {
    const now = this.clock.now(simulatedDateTime);
    this.validate(data, now);
    const stay = await this.repository.addStay({
      petName: data.petName.trim(), petType: data.petType, birthYear: data.birthYear,
      ownerName: data.ownerName.trim(), ownerPhone: data.ownerPhone.trim(), plannedHours: data.plannedHours,
      arrivalAt: now.toISOString(), checkedInBy: sellerName, status: PetSittingStatus.ACTIVE,
    });
    await this.logger.log(LogLevel.INFO, `Pet sitting stay '${stay.id}' opened by '${sellerName}'.`);
    return stay;
  }

  async checkOut(id: number, sellerName: string, simulatedDateTime?: string) {
    const stay = await this.repository.findStay(id);
    if (!stay) throw new Error(`Pet sitting stay with ID ${id} not found.`);
    if (stay.status !== PetSittingStatus.ACTIVE) throw new Error("Pet sitting stay is already completed.");
    const departure = this.clock.now(simulatedDateTime);
    const price = this.pricing.calculate(new Date(stay.arrivalAt), departure);
    const result = await this.repository.completeStay(id, {
      departureAt: departure.toISOString(), checkedOutBy: sellerName, sellerName,
      issuedAt: departure.toISOString(), ...price,
    });
    await this.logger.log(LogLevel.INFO, `Pet sitting stay '${id}' completed; receipt '${result.receipt.id}' issued.`);
    return result;
  }

  private validate(data: CreatePetSittingDTO, now: Date): void {
    if (!data.petName?.trim() || !data.ownerName?.trim() || !data.ownerPhone?.trim()) throw new Error("Pet name, owner name and phone are required.");
    if (!Object.values(PetSittingPetType).includes(data.petType)) throw new Error("Invalid pet type.");
    if (!Number.isInteger(data.birthYear) || data.birthYear < 1980 || data.birthYear > now.getFullYear()) throw new Error("Invalid birth year.");
    if (!Number.isFinite(data.plannedHours) || data.plannedHours <= 0 || data.plannedHours > 720) throw new Error("Planned stay must be between 1 and 720 hours.");
    if (!/^[+\d][\d\s/-]{5,19}$/.test(data.ownerPhone.trim())) throw new Error("Invalid owner phone number.");
  }
}
