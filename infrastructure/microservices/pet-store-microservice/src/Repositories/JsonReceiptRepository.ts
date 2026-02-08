import { IReceiptRepository } from "../Domain/repositories/IReceiptRepository";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { JsonDatabaseService } from "../Services/JsonDatabaseService";

export class JsonReceiptRepository implements IReceiptRepository {
  constructor(private readonly dbService: JsonDatabaseService) {}

  async getAll(): Promise<FiscalReceipt[]> {
    const db = await this.dbService.read();
    return [...db.receipts];
  }

  async add(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt> {
    const db = await this.dbService.read();

    const receipt: FiscalReceipt = {
      id: db.nextIds.receipt,
      ...input,
    };

    db.nextIds.receipt += 1;
    db.receipts.push(receipt);

    await this.dbService.write(db);
    return receipt;
  }
}
