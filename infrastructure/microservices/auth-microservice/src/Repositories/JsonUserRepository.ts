import fs from "fs/promises";
import path from "path";
import { IUserRepository } from "../Domain/repositories/IUserRepository";
import { User } from "../Domain/models/User";

type UserDatabase = { users: User[] };

export class JsonUserRepository implements IUserRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async findByUsername(username: string): Promise<User | null> {
    const database = await this.read();
    const normalizedUsername = username.trim().toLowerCase();
    return database.users.find((user) => user.username.toLowerCase() === normalizedUsername) ?? null;
  }

  async add(user: User): Promise<User> {
    const task = this.writeQueue.then(async () => {
      const database = await this.read();
      if (database.users.some((item) => item.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error("Username already exists.");
      }
      database.users.push(user);
      await fs.writeFile(this.filePath, JSON.stringify(database, null, 2), "utf-8");
    });
    this.writeQueue = task.catch(() => undefined);
    await task;
    return user;
  }

  private async read(): Promise<UserDatabase> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const raw = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(raw) as UserDatabase;
  }
}
