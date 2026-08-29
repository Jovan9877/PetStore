import assert from "node:assert/strict";
import { ShelterService } from "../src/Services/ShelterService";
import { ShelterPetStatus } from "../src/Domain/enums/ShelterPetStatus";
import { ReservationStatus } from "../src/Domain/enums/ReservationStatus";
import { ShelterPetType } from "../src/Domain/enums/ShelterPetType";
import { IShelterRepository, ShelterData } from "../src/Domain/repositories/IShelterRepository";
import { IClockService } from "../src/Domain/services/IClockService";
import { IPetGeneratorService } from "../src/Domain/services/IPetGeneratorService";
import { ILoggerService } from "../src/Domain/services/ILoggerService";
import { LogLevel } from "../src/Domain/enums/LogLevel";
import { ShelterReservation } from "../src/Domain/models/ShelterReservation";

class Repository implements IShelterRepository {
  data: ShelterData = { shelters: [{ id: 1, name: "Test", city: "Novi Sad", phone: "123456" }], pets: [{ id: 1, shelterId: 1, name: "Rex", birthYear: 2022, breed: "Mix", type: ShelterPetType.DOG, status: ShelterPetStatus.AVAILABLE, addedAt: "2026-08-28T10:00:00.000Z" }], reservations: [] };
  async getData() { return this.data; }
  async releaseExpired(now: Date) { let count = 0; for (const reservation of this.data.reservations) if (reservation.status === ReservationStatus.ACTIVE && new Date(reservation.expiresAt) <= now) { reservation.status = ReservationStatus.EXPIRED; this.data.pets.find((pet) => pet.id === reservation.petId)!.status = ShelterPetStatus.AVAILABLE; count++; } return count; }
  async reserve(petId: number, customerName: string, customerPhone: string, reservedBy: string, now: Date, expiresAt: Date) { const pet = this.data.pets.find((item) => item.id === petId)!; if (pet.status !== ShelterPetStatus.AVAILABLE) throw new Error("already reserved"); pet.status = ShelterPetStatus.RESERVED; const reservation: ShelterReservation = { id: 1, petId, customerName, customerPhone, reservedBy, reservedAt: now.toISOString(), expiresAt: expiresAt.toISOString(), status: ReservationStatus.ACTIVE }; this.data.reservations.push(reservation); return reservation; }
  async addPet(input: Omit<(typeof this.data.pets)[number], "id">) { const pet = { id: 2, ...input }; this.data.pets.push(pet); return pet; }
  async removeRandomAvailable() { const pet = this.data.pets.find((item) => item.status === ShelterPetStatus.AVAILABLE) ?? null; if (pet) this.data.pets = this.data.pets.filter((item) => item.id !== pet.id); return pet; }
  async trimAvailableToMaximum(maximumPets: number) { const removed = []; while (this.data.pets.length > maximumPets) { const pet = this.data.pets.find((item) => item.status === ShelterPetStatus.AVAILABLE); if (!pet) break; this.data.pets = this.data.pets.filter((item) => item.id !== pet.id); removed.push(pet); } return removed; }
}
class Clock implements IClockService { now(value?: string) { return new Date(value ?? "2026-08-28T10:00:00.000Z"); } }
class Generator implements IPetGeneratorService { generate(shelterId: number, now: Date) { return { shelterId, name: "Nova", birthYear: 2024, breed: "Mix", type: ShelterPetType.CAT, status: ShelterPetStatus.AVAILABLE, addedAt: now.toISOString() }; } }
class Logger implements ILoggerService { async log(_level: LogLevel, _message: string) { return true; } }

async function run() {
  const repository = new Repository();
  const service = new ShelterService(repository, new Generator(), new Clock(), new Logger(), 24, () => 0);
  const reservation = await service.reserve(1, { customerName: "Ana", customerPhone: "+38164111222" }, "seller", "2026-08-28T10:00:00.000Z");
  assert.equal(reservation.expiresAt, "2026-08-29T10:00:00.000Z");
  await service.getData("2026-08-29T10:01:00.000Z");
  assert.equal(repository.data.pets[0].status, ShelterPetStatus.AVAILABLE);
  assert.equal(repository.data.reservations[0].status, ReservationStatus.EXPIRED);

  for (let id = 2; id <= 10; id += 1) {
    repository.data.pets.push({ id, shelterId: 1, name: `Pet ${id}`, birthYear: 2022, breed: "Mixed Breed", type: ShelterPetType.DOG, status: ShelterPetStatus.AVAILABLE, addedAt: "2026-08-28T10:00:00.000Z" });
  }
  const change = await service.simulateChange();
  assert.equal(change?.action, "REMOVED");
  assert.equal(repository.data.pets.length, 8, "The simulation should remove several pets at the upper limit.");

  for (let id = 11; id <= 20; id += 1) {
    repository.data.pets.push({ id, shelterId: 1, name: `Extra ${id}`, birthYear: 2023, breed: "Mixed Breed", type: ShelterPetType.CAT, status: ShelterPetStatus.AVAILABLE, addedAt: "2026-08-28T10:00:00.000Z" });
  }
  const trimmedData = await service.getData();
  assert.equal(trimmedData.pets.length, 10, "An oversized persisted list should be trimmed before it is returned.");
  console.log("ShelterService tests passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
