import { IPetRepository } from "../Domain/repositories/IPetRepository";
import { Pet } from "../Domain/models/Pet";
import { JsonDatabaseService } from "../Services/JsonDatabaseService";

export class JsonPetRepository implements IPetRepository {
  constructor(private readonly dbService: JsonDatabaseService) {}

  async getAll(): Promise<Pet[]> {
    const db = await this.dbService.read();
    return [...db.pets];
  }

  async getUnsold(): Promise<Pet[]> {
    const db = await this.dbService.read();
    return db.pets.filter((pet) => !pet.sold);
  }

  async findById(id: number): Promise<Pet | null> {
    const db = await this.dbService.read();
    const pet = db.pets.find((item) => item.id === id);
    return pet ?? null;
  }

  async countUnsold(): Promise<number> {
    const unsold = await this.getUnsold();
    return unsold.length;
  }

  async add(input: Omit<Pet, "id">): Promise<Pet> {
    const db = await this.dbService.read();
    const newPet: Pet = {
      id: db.nextIds.pet,
      ...input,
    };

    db.nextIds.pet += 1;
    db.pets.push(newPet);

    await this.dbService.write(db);
    return newPet;
  }

  async markAsSold(id: number): Promise<Pet> {
    const db = await this.dbService.read();
    const pet = db.pets.find((item) => item.id === id);

    if (!pet) {
      throw new Error(`Pet with ID ${id} not found.`);
    }

    pet.sold = true;
    await this.dbService.write(db);

    return pet;
  }
}
