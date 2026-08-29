import { FiscalReceipt } from "../models/FiscalReceipt";

export interface ISaleRepository {
  completeSale(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt>;
}
