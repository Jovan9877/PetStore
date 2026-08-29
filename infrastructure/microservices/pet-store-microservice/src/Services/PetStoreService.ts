import { IPetStoreService } from "../Domain/services/IPetStoreService";
import { IPetRepository } from "../Domain/repositories/IPetRepository";
import { IReceiptRepository } from "../Domain/repositories/IReceiptRepository";
import { AddPetDTO } from "../Domain/DTOs/AddPetDTO";
import { Pet } from "../Domain/models/Pet";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { PetType } from "../Domain/enums/PetType";
import { ISalesPricingServiceResolver } from "../Domain/services/ISalesPricingServiceResolver";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { ISaleRepository } from "../Domain/repositories/ISaleRepository";

export class PetStoreService implements IPetStoreService {
  constructor(
    private readonly petRepository: IPetRepository,
    private readonly receiptRepository: IReceiptRepository,
    private readonly saleRepository: ISaleRepository,
    private readonly pricingResolver: ISalesPricingServiceResolver,
    private readonly logger: ILoggerService
  ) {}

  async getAllPets(): Promise<Pet[]> {
    const pets = await this.petRepository.getAll();
    await this.logger.log(LogLevel.INFO, `Returned ${pets.length} pets.`);
    return pets;
  }

  async getUnsoldPets(): Promise<Pet[]> {
    const pets = await this.petRepository.getUnsold();
    await this.logger.log(LogLevel.INFO, `Returned ${pets.length} available pets.`);
    return pets;
  }

  async addPet(data: AddPetDTO): Promise<Pet> {
    const unsoldCount = await this.petRepository.countUnsold();
    if (unsoldCount >= 10) {
      throw new Error("The store can have at most 10 unsold pets.");
    }

    if (!data.latinName?.trim() || !data.name?.trim()) {
      throw new Error("Latin name and pet name are required.");
    }

    const normalizedType = data.type?.toUpperCase() as PetType;
    if (!Object.values(PetType).includes(normalizedType)) {
      throw new Error("Pet type must be one of: MAMMAL, REPTILE, RODENT.");
    }

    if (data.salePrice <= 0) {
      throw new Error("Sale price must be greater than zero.");
    }

    const pet = await this.petRepository.add({
      latinName: data.latinName.trim(),
      name: data.name.trim(),
      type: normalizedType,
      salePrice: data.salePrice,
      sold: false,
    });
    await this.logger.log(LogLevel.INFO, `Pet '${pet.id}' added.`);
    return pet;
  }

  async sellPet(petId: number, sellerName: string, simulatedTime?: string): Promise<FiscalReceipt> {
    const now = this.resolveSaleDate(simulatedTime);
    const hour = now.getHours();

    if (!this.isWithinBusinessHours(hour)) {
      throw new Error("Sales are allowed only during shifts: 08:00-16:00 and 16:00-22:00.");
    }

    const pet = await this.petRepository.findById(petId);
    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found.`);
    }

    if (pet.sold) {
      throw new Error("Pet is already sold.");
    }

    const pricingService = this.pricingResolver.resolve(hour);
    const totalAmount = pricingService.calculateFinalAmount(pet.salePrice);

    const receipt = await this.saleRepository.completeSale({
      sellerName,
      soldAt: now.toISOString(),
      totalAmount,
      petId,
    });
    await this.logger.log(LogLevel.INFO, `Pet '${petId}' sold by '${sellerName}', receipt '${receipt.id}' issued.`);
    return receipt;
  }

  async getReceipts(): Promise<FiscalReceipt[]> {
    const receipts = await this.receiptRepository.getAll();
    await this.logger.log(LogLevel.INFO, `Returned ${receipts.length} fiscal receipts.`);
    return receipts;
  }

  private isWithinBusinessHours(hour: number): boolean {
    return hour >= 8 && hour < 22;
  }

  private resolveSaleDate(simulatedTime?: string): Date {
    if (!simulatedTime) {
      return new Date();
    }

    const hhmmMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(simulatedTime.trim());
    if (hhmmMatch) {
      const now = new Date();
      now.setHours(parseInt(hhmmMatch[1], 10), parseInt(hhmmMatch[2], 10), 0, 0);
      return now;
    }

    const parsed = new Date(simulatedTime);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    throw new Error("Invalid simulated time format. Use HH:mm.");
  }
}
