import fs from "fs/promises";
import path from "path";
import { IPetSittingRepository } from "../Domain/repositories/IPetSittingRepository";
import { PetSittingReceipt } from "../Domain/models/PetSittingReceipt";
import { PetSittingStay } from "../Domain/models/PetSittingStay";
import { PetSittingStatus } from "../Domain/enums/PetSittingStatus";

type Database = { nextIds: { stay: number; receipt: number }; stays: PetSittingStay[]; receipts: PetSittingReceipt[] };

export class JsonPetSittingRepository implements IPetSittingRepository {
  private queue: Promise<void> = Promise.resolve();
  constructor(private readonly filePath: string) {}

  async getStays(): Promise<PetSittingStay[]> { return [...(await this.read()).stays]; }
  async getReceipts(): Promise<PetSittingReceipt[]> { return [...(await this.read()).receipts]; }
  async findStay(id: number): Promise<PetSittingStay | null> { return (await this.read()).stays.find((stay) => stay.id === id) ?? null; }

  async addStay(input: Omit<PetSittingStay, "id">): Promise<PetSittingStay> {
    return this.transaction((database) => {
      const stay = { id: database.nextIds.stay, ...input };
      database.nextIds.stay += 1;
      database.stays.push(stay);
      return stay;
    });
  }

  async completeStay(id: number, completion: Omit<PetSittingReceipt, "id" | "stayId"> & { departureAt: string; checkedOutBy: string }): Promise<{ stay: PetSittingStay; receipt: PetSittingReceipt }> {
    return this.transaction((database) => {
      const stay = database.stays.find((item) => item.id === id);
      if (!stay) throw new Error(`Pet sitting stay with ID ${id} not found.`);
      if (stay.status === PetSittingStatus.COMPLETED) throw new Error("Pet sitting stay is already completed.");
      stay.status = PetSittingStatus.COMPLETED;
      stay.departureAt = completion.departureAt;
      stay.checkedOutBy = completion.checkedOutBy;
      stay.billableHours = completion.billableHours;
      stay.totalAmount = completion.totalAmount;
      const receipt: PetSittingReceipt = {
        id: database.nextIds.receipt,
        stayId: id,
        sellerName: completion.sellerName,
        issuedAt: completion.issuedAt,
        billableHours: completion.billableHours,
        hourlyRate: completion.hourlyRate,
        totalAmount: completion.totalAmount,
      };
      database.nextIds.receipt += 1;
      database.receipts.push(receipt);
      return { stay, receipt };
    });
  }

  private async read(): Promise<Database> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    return JSON.parse(await fs.readFile(this.filePath, "utf-8")) as Database;
  }

  private async transaction<T>(operation: (database: Database) => T): Promise<T> {
    let result!: T;
    const task = this.queue.then(async () => {
      const database = await this.read();
      result = operation(database);
      await fs.writeFile(this.filePath, JSON.stringify(database, null, 2), "utf-8");
    });
    this.queue = task.catch(() => undefined);
    await task;
    return result;
  }
}
