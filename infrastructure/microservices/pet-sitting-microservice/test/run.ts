import assert from "node:assert/strict";
import { PetSittingService } from "../src/Services/PetSittingService";
import { HourlyPetSittingPricingService } from "../src/Services/HourlyPetSittingPricingService";
import { IPetSittingRepository } from "../src/Domain/repositories/IPetSittingRepository";
import { PetSittingStay } from "../src/Domain/models/PetSittingStay";
import { PetSittingReceipt } from "../src/Domain/models/PetSittingReceipt";
import { IClockService } from "../src/Domain/services/IClockService";
import { ILoggerService } from "../src/Domain/services/ILoggerService";
import { LogLevel } from "../src/Domain/enums/LogLevel";
import { PetSittingPetType } from "../src/Domain/enums/PetSittingPetType";
import { PetSittingStatus } from "../src/Domain/enums/PetSittingStatus";

class MemoryRepository implements IPetSittingRepository {
  stays: PetSittingStay[] = []; receipts: PetSittingReceipt[] = [];
  async getStays() { return this.stays; } async getReceipts() { return this.receipts; }
  async findStay(id: number) { return this.stays.find((item) => item.id === id) ?? null; }
  async addStay(input: Omit<PetSittingStay, "id">) { const stay = { id: this.stays.length + 1, ...input }; this.stays.push(stay); return stay; }
  async completeStay(id: number, data: Omit<PetSittingReceipt, "id" | "stayId"> & { departureAt: string; checkedOutBy: string }) {
    const stay = this.stays.find((item) => item.id === id)!;
    stay.status = PetSittingStatus.COMPLETED; stay.departureAt = data.departureAt; stay.billableHours = data.billableHours; stay.totalAmount = data.totalAmount;
    const receipt = { id: this.receipts.length + 1, stayId: id, sellerName: data.sellerName, issuedAt: data.issuedAt, billableHours: data.billableHours, hourlyRate: data.hourlyRate, totalAmount: data.totalAmount };
    this.receipts.push(receipt); return { stay, receipt };
  }
}
class Clock implements IClockService { now(value?: string) { return new Date(value ?? "2026-08-28T10:00:00"); } }
class Logger implements ILoggerService { async log(_level: LogLevel, _message: string) { return true; } }

async function run() {
  const repository = new MemoryRepository();
  const service = new PetSittingService(repository, new HourlyPetSittingPricingService(200), new Clock(), new Logger());
  const stay = await service.checkIn({ petName: "Rex", petType: PetSittingPetType.DOG, birthYear: 2022, ownerName: "Petar Petrović", ownerPhone: "+38164111222", plannedHours: 4 }, "seller", "2026-08-28T10:00:00");
  const result = await service.checkOut(stay.id, "seller", "2026-08-28T12:01:00");
  assert.equal(result.receipt.billableHours, 3);
  assert.equal(result.receipt.totalAmount, 600);
  await assert.rejects(() => service.checkOut(stay.id, "seller", "2026-08-28T13:00:00"), /already completed/i);
  console.log("PetSittingService tests passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
