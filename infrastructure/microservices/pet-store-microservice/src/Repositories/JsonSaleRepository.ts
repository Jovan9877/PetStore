import { ISaleRepository } from "../Domain/repositories/ISaleRepository";
import { FiscalReceipt } from "../Domain/models/FiscalReceipt";
import { JsonDatabaseService } from "../Services/JsonDatabaseService";

export class JsonSaleRepository implements ISaleRepository {
  constructor(private readonly database: JsonDatabaseService) {}

  async completeSale(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt> {
    return this.database.transaction((data) => {
      const pet = data.pets.find((item) => item.id === input.petId);
      if (!pet) throw new Error(`Pet with ID ${input.petId} not found.`);
      if (pet.sold) throw new Error("Pet is already sold.");

      const receipt: FiscalReceipt = { id: data.nextIds.receipt, ...input };
      data.nextIds.receipt += 1;
      pet.sold = true;
      data.receipts.push(receipt);
      return receipt;
    });
  }
}
