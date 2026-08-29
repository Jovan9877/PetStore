import assert from "node:assert/strict";
import { IPetRepository } from "../src/Domain/repositories/IPetRepository";
import { IReceiptRepository } from "../src/Domain/repositories/IReceiptRepository";
import { Pet } from "../src/Domain/models/Pet";
import { FiscalReceipt } from "../src/Domain/models/FiscalReceipt";
import { PetStoreService } from "../src/Services/PetStoreService";
import { ShiftPricingServiceResolver } from "../src/Services/ShiftPricingServiceResolver";
import { DayShiftPricingService } from "../src/Services/DayShiftPricingService";
import { NightShiftPricingService } from "../src/Services/NightShiftPricingService";
import { ILoggerService } from "../src/Domain/services/ILoggerService";
import { LogLevel } from "../src/Domain/enums/LogLevel";
import { PetType } from "../src/Domain/enums/PetType";
import { ISaleRepository } from "../src/Domain/repositories/ISaleRepository";

class MemoryPetRepository implements IPetRepository {
  constructor(public readonly pets: Pet[]) {}
  async getAll(): Promise<Pet[]> { return [...this.pets]; }
  async getUnsold(): Promise<Pet[]> { return this.pets.filter((pet) => !pet.sold); }
  async findById(id: number): Promise<Pet | null> { return this.pets.find((pet) => pet.id === id) ?? null; }
  async countUnsold(): Promise<number> { return (await this.getUnsold()).length; }
  async add(input: Omit<Pet, "id">): Promise<Pet> {
    const pet = { id: this.pets.length + 1, ...input };
    this.pets.push(pet);
    return pet;
  }
  async markAsSold(id: number): Promise<Pet> {
    const pet = this.pets.find((item) => item.id === id);
    if (!pet) throw new Error("Not found");
    pet.sold = true;
    return pet;
  }
}

class MemoryReceiptRepository implements IReceiptRepository {
  public readonly receipts: FiscalReceipt[] = [];
  async getAll(): Promise<FiscalReceipt[]> { return [...this.receipts]; }
  async add(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt> {
    const receipt = { id: this.receipts.length + 1, ...input };
    this.receipts.push(receipt);
    return receipt;
  }
}

class MemorySaleRepository implements ISaleRepository {
  constructor(private readonly pets: Pet[], private readonly receipts: MemoryReceiptRepository) {}
  async completeSale(input: Omit<FiscalReceipt, "id">): Promise<FiscalReceipt> {
    const pet = this.pets.find((item) => item.id === input.petId);
    if (!pet) throw new Error("Pet not found.");
    if (pet.sold) throw new Error("Pet is already sold.");
    pet.sold = true;
    return this.receipts.add(input);
  }
}

class MemoryLogger implements ILoggerService {
  async log(_level: LogLevel, _message: string): Promise<boolean> { return true; }
}

function createService(pets: Pet[]) {
  const receiptRepository = new MemoryReceiptRepository();
  return new PetStoreService(
    new MemoryPetRepository(pets),
    receiptRepository,
    new MemorySaleRepository(pets, receiptRepository),
    new ShiftPricingServiceResolver(new DayShiftPricingService(), new NightShiftPricingService()),
    new MemoryLogger()
  );
}

async function expectReject(action: () => Promise<unknown>, message: RegExp): Promise<void> {
  await assert.rejects(action, message);
}

async function run(): Promise<void> {
  const pet = (): Pet => ({ id: 1, latinName: "Felis catus", name: "Maca", type: PetType.MAMMAL, salePrice: 100, sold: false });
  assert.equal((await createService([pet()]).sellPet(1, "seller", "10:00")).totalAmount, 85);
  assert.equal((await createService([pet()]).sellPet(1, "seller", "18:00")).totalAmount, 110);
  await expectReject(() => createService([pet()]).sellPet(1, "seller", "07:59"), /allowed only during shifts/i);

  const soldPet = pet();
  soldPet.sold = true;
  await expectReject(() => createService([soldPet]).sellPet(1, "seller", "10:00"), /already sold/i);

  const tenPets = Array.from({ length: 10 }, (_, index) => ({ ...pet(), id: index + 1 }));
  await expectReject(() => createService(tenPets).addPet({ latinName: "Canis lupus", name: "Rex", type: PetType.MAMMAL, salePrice: 200 }), /at most 10/i);
  console.log("PetStoreService tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
