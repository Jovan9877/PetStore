import fs from "fs/promises";
import path from "path";
import { PetType } from "../Domain/enums/PetType";

type JsonDb = {
  nextIds: {
    pet: number;
    receipt: number;
  };
  pets: Array<{
    id: number;
    latinName: string;
    name: string;
    type: PetType;
    salePrice: number;
    sold: boolean;
  }>;
  receipts: Array<{
    id: number;
    sellerName: string;
    soldAt: string;
    totalAmount: number;
    petId: number;
  }>;
};

export class JsonDatabaseService {
  constructor(private readonly filePath: string) {}

  async read(): Promise<JsonDb> {
    await this.ensureFileExists();
    const raw = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(raw) as JsonDb;
  }

  async write(data: JsonDb): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private async ensureFileExists(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await this.write(this.getSeedData());
    }
  }

  private getSeedData(): JsonDb {
    return {
      nextIds: {
        pet: 6,
        receipt: 2,
      },
      pets: [
        { id: 1, latinName: "Canis lupus familiaris", name: "Rex", type: PetType.MAMMAL, salePrice: 400, sold: false },
        { id: 2, latinName: "Felis catus", name: "Maca", type: PetType.MAMMAL, salePrice: 300, sold: false },
        { id: 3, latinName: "Python regius", name: "Kobra", type: PetType.REPTILE, salePrice: 550, sold: false },
        { id: 4, latinName: "Cavia porcellus", name: "Bubi", type: PetType.RODENT, salePrice: 150, sold: false },
        { id: 5, latinName: "Mesocricetus auratus", name: "Nix", type: PetType.RODENT, salePrice: 120, sold: true }
      ],
      receipts: [
        {
          id: 1,
          sellerName: "template_seller",
          soldAt: "2026-01-12T10:05:00.000Z",
          totalAmount: 102,
          petId: 5,
        },
      ],
    };
  }
}
