import fs from "fs/promises";
import path from "path";
import { ReservationStatus } from "../Domain/enums/ReservationStatus";
import { ShelterPetStatus } from "../Domain/enums/ShelterPetStatus";
import { IShelterRepository, ShelterData } from "../Domain/repositories/IShelterRepository";
import { ShelterPet } from "../Domain/models/ShelterPet";
import { ShelterReservation } from "../Domain/models/ShelterReservation";

type Database = ShelterData & { nextIds: { pet: number; reservation: number } };

export class JsonShelterRepository implements IShelterRepository {
  private queue: Promise<void> = Promise.resolve();
  constructor(private readonly filePath: string) {}
  async getData(): Promise<ShelterData> { const data = await this.read(); return { shelters: [...data.shelters], pets: [...data.pets], reservations: [...data.reservations] }; }
  async releaseExpired(now: Date): Promise<number> {
    const snapshot = await this.read();
    const hasExpired = snapshot.reservations.some((reservation) => reservation.status === ReservationStatus.ACTIVE && new Date(reservation.expiresAt) <= now);
    if (!hasExpired) return 0;
    return this.transaction((data) => {
      let count = 0;
      for (const reservation of data.reservations) {
        if (reservation.status === ReservationStatus.ACTIVE && new Date(reservation.expiresAt) <= now) {
          reservation.status = ReservationStatus.EXPIRED;
          const pet = data.pets.find((item) => item.id === reservation.petId);
          if (pet) pet.status = ShelterPetStatus.AVAILABLE;
          count += 1;
        }
      }
      return count;
    });
  }
  async reserve(petId: number, customerName: string, customerPhone: string, reservedBy: string, now: Date, expiresAt: Date): Promise<ShelterReservation> {
    return this.transaction((data) => {
      const pet = data.pets.find((item) => item.id === petId);
      if (!pet) throw new Error(`Shelter pet with ID ${petId} not found.`);
      if (pet.status !== ShelterPetStatus.AVAILABLE) throw new Error("Pet is already reserved.");
      pet.status = ShelterPetStatus.RESERVED;
      const reservation: ShelterReservation = { id: data.nextIds.reservation, petId, customerName, customerPhone, reservedBy, reservedAt: now.toISOString(), expiresAt: expiresAt.toISOString(), status: ReservationStatus.ACTIVE };
      data.nextIds.reservation += 1; data.reservations.push(reservation); return reservation;
    });
  }
  async addPet(input: Omit<ShelterPet, "id">): Promise<ShelterPet> {
    return this.transaction((data) => { const pet = { id: data.nextIds.pet, ...input }; data.nextIds.pet += 1; data.pets.push(pet); return pet; });
  }
  async removeRandomAvailable(randomValue: number): Promise<ShelterPet | null> {
    return this.transaction((data) => {
      const available = data.pets.filter((pet) => pet.status === ShelterPetStatus.AVAILABLE);
      if (available.length === 0) return null;
      const selected = available[Math.min(available.length - 1, Math.floor(randomValue * available.length))];
      data.pets = data.pets.filter((pet) => pet.id !== selected.id); return selected;
    });
  }
  async trimAvailableToMaximum(maximumPets: number, randomValue: number): Promise<ShelterPet[]> {
    const snapshot = await this.read();
    if (snapshot.pets.length <= maximumPets || !snapshot.pets.some((pet) => pet.status === ShelterPetStatus.AVAILABLE)) return [];
    return this.transaction((data) => {
      const removed: ShelterPet[] = [];
      while (data.pets.length > maximumPets) {
        const available = data.pets.filter((pet) => pet.status === ShelterPetStatus.AVAILABLE);
        if (available.length === 0) break;
        const selected = available[Math.min(available.length - 1, Math.floor(randomValue * available.length))];
        data.pets = data.pets.filter((pet) => pet.id !== selected.id);
        removed.push(selected);
      }
      return removed;
    });
  }
  private async read(): Promise<Database> { await fs.mkdir(path.dirname(this.filePath), { recursive: true }); return JSON.parse(await fs.readFile(this.filePath, "utf-8")) as Database; }
  private async transaction<T>(operation: (data: Database) => T): Promise<T> {
    let result!: T;
    const task = this.queue.then(async () => { const data = await this.read(); result = operation(data); await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8"); });
    this.queue = task.catch(() => undefined); await task; return result;
  }
}
