import fs from "fs/promises";
import { IUserRepository } from "../Domain/repositories/IUserRepository";
import { User } from "../Domain/models/User";

type UserDatabase = { users: User[] };

export class JsonUserRepository implements IUserRepository {
  constructor(private readonly filePath: string) {}

  async getAll(): Promise<User[]> {
    return [...(await this.read()).users];
  }

  async findById(id: string): Promise<User | null> {
    return (await this.read()).users.find((user) => user.id === id) ?? null;
  }

  private async read(): Promise<UserDatabase> {
    return JSON.parse(await fs.readFile(this.filePath, "utf-8")) as UserDatabase;
  }
}
