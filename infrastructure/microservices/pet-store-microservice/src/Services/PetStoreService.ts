import { IPetStoreService } from "../Domain/services/IPetStoreService";
import { IPetRepository } from "../Domain/repositories/IPetRepository";
import { IReceiptRepository } from "../Domain/repositories/IReceiptRepository";
import { AddPetDTO } from "../Domain/DTOs/AddPetDTO";
import { Pet } from "../Domain/models/Pet";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { PetType } from "../Domain/enums/PetType";
import { ISalesPricingService } from "../Domain/services/ISalesPricingService";
import { DayShiftPricingService } from "./DayShiftPricingService";
import { NightShiftPricingService } from "./NightShiftPricingService";

export class PetStoreService implements IPetStoreService {
  constructor(
    private readonly petRepository: IPetRepository,
    private readonly receiptRepository: IReceiptRepository
  ) {}

  async getAllPets(): Promise<Pet[]> {
    return this.petRepository.getAll();
  }

  async getUnsoldPets(): Promise<Pet[]> {
    return this.petRepository.getUnsold();
  }

  async addPet(data: AddPetDTO): Promise<Pet> {
    const unsoldCount = await this.petRepository.countUnsold();
    if (unsoldCount >= 10) {
      throw new Error("The store can have at most 10 unsold pets.");
    }

    const normalizedType = data.type.toUpperCase() as PetType;
    if (!Object.values(PetType).includes(normalizedType)) {
      throw new Error("Pet type must be one of: MAMMAL, REPTILE, RODENT.");
    }

    if (data.salePrice <= 0) {
      throw new Error("Sale price must be greater than zero.");
    }

    return this.petRepository.add({
      latinName: data.latinName,
      name: data.name,
      type: normalizedType,
      salePrice: data.salePrice,
      sold: false,
    });
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

    const pricingService = this.resolvePricingService(hour);
    const totalAmount = pricingService.calculateFinalAmount(pet.salePrice);

    await this.petRepository.markAsSold(petId);

    return this.receiptRepository.add({
      sellerName,
      soldAt: now.toISOString(),
      totalAmount,
      petId,
    });
  }

  async getReceipts(): Promise<FiscalReceipt[]> {
    return this.receiptRepository.getAll();
  }

  private isWithinBusinessHours(hour: number): boolean {
    return hour >= 8 && hour < 22;
  }

  private resolvePricingService(hour: number): ISalesPricingService {
    if (hour >= 8 && hour < 16) {
      return new DayShiftPricingService();
    }

    return new NightShiftPricingService();
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
