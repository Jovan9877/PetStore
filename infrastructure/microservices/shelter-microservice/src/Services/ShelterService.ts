import { ReserveShelterPetDTO } from "../Domain/DTOs/ReserveShelterPetDTO";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IShelterRepository } from "../Domain/repositories/IShelterRepository";
import { IClockService } from "../Domain/services/IClockService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IPetGeneratorService } from "../Domain/services/IPetGeneratorService";
import { IShelterService } from "../Domain/services/IShelterService";

export class ShelterService implements IShelterService {
  private static readonly MIN_PETS = 6;
  private static readonly MAX_PETS = 10;

  constructor(
    private readonly repository: IShelterRepository,
    private readonly generator: IPetGeneratorService,
    private readonly clock: IClockService,
    private readonly logger: ILoggerService,
    private readonly reservationHours = 24,
    private readonly random: () => number = Math.random
  ) {}

  async getData(simulatedDateTime?: string) {
    const now = this.clock.now(simulatedDateTime);
    const released = await this.repository.releaseExpired(now);
    if (released) await this.logger.log(LogLevel.INFO, `${released} shelter reservations expired.`);
    const removed = await this.repository.trimAvailableToMaximum(ShelterService.MAX_PETS, this.random());
    if (removed.length > 0) await this.logger.log(LogLevel.INFO, `Removed ${removed.length} excess shelter pet(s) before returning the list.`);
    return this.repository.getData();
  }

  async reserve(petId: number, data: ReserveShelterPetDTO, reservedBy: string, simulatedDateTime?: string) {
    if (!data.customerName?.trim() || !/^[+\d][\d\s/-]{5,19}$/.test(data.customerPhone?.trim() ?? "")) throw new Error("Valid customer name and phone are required.");
    const now = this.clock.now(simulatedDateTime);
    await this.repository.releaseExpired(now);
    const expiresAt = new Date(now.getTime() + this.reservationHours * 3_600_000);
    const reservation = await this.repository.reserve(petId, data.customerName.trim(), data.customerPhone.trim(), reservedBy, now, expiresAt);
    await this.logger.log(LogLevel.INFO, `Shelter pet '${petId}' reserved by '${reservedBy}' until ${expiresAt.toISOString()}.`);
    return reservation;
  }

  async simulateChange() {
    const now = this.clock.now();
    await this.repository.releaseExpired(now);
    const data = await this.repository.getData();
    if (data.pets.length > ShelterService.MAX_PETS) {
      const removed = await this.repository.trimAvailableToMaximum(ShelterService.MAX_PETS, this.random());
      if (removed.length === 0) return null;
      await this.logger.log(LogLevel.INFO, `Simulation removed ${removed.length} excess shelter pet(s).`);
      return { action: "REMOVED" as const, pet: removed[0] };
    }
    if (data.pets.length < ShelterService.MAX_PETS && (this.random() < 0.5 || data.pets.length <= ShelterService.MIN_PETS)) {
      const shelter = data.shelters[Math.floor(this.random() * data.shelters.length)];
      const pet = await this.repository.addPet(this.generator.generate(shelter.id, now));
      await this.logger.log(LogLevel.INFO, `Simulation added shelter pet '${pet.id}' to shelter '${shelter.id}'.`);
      return { action: "ADDED" as const, pet };
    }

    const requestedRemovals = data.pets.length >= ShelterService.MAX_PETS
      ? 2 + Math.floor(this.random() * 3)
      : 1;
    const removed = [];
    for (let index = 0; index < requestedRemovals; index += 1) {
      const pet = await this.repository.removeRandomAvailable(this.random());
      if (!pet) break;
      removed.push(pet);
    }
    if (removed.length === 0) return null;
    await this.logger.log(LogLevel.INFO, `Simulation removed ${removed.length} shelter pet(s): ${removed.map((pet) => pet.id).join(", ")}.`);
    return { action: "REMOVED" as const, pet: removed[0] };
  }
}
