import { FiscalReceipt } from "../models/FiscalReceipt";

export interface IReceiptRepository {
  getAll(): Promise<FiscalReceipt[]>;
  add(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt>;
}
