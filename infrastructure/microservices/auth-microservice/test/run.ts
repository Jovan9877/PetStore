import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { AuthService } from "../src/Services/AuthService";
import { IUserRepository } from "../src/Domain/repositories/IUserRepository";
import { User } from "../src/Domain/models/User";
import { UserRole } from "../src/Domain/enums/UserRole";
import { ILoggerService } from "../src/Domain/services/ILoggerService";
import { LogLevel } from "../src/Domain/enums/LogLevel";

class MemoryUserRepository implements IUserRepository {
  constructor(public readonly users: User[]) {}
  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username.toLowerCase() === username.toLowerCase()) ?? null;
  }
  async add(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
}

class MemoryLogger implements ILoggerService {
  public readonly entries: Array<{ level: LogLevel; message: string }> = [];
  async log(level: LogLevel, message: string): Promise<boolean> {
    this.entries.push({ level, message });
    return true;
  }
}

async function run(): Promise<void> {
  const password = "Manager123!";
  const repository = new MemoryUserRepository([{
    id: "manager-id",
    username: "manager",
    password: await bcrypt.hash(password, 4),
    firstName: "Milan",
    lastName: "Manager",
    role: UserRole.MANAGER,
  }]);
  const logger = new MemoryLogger();
  const service = new AuthService(repository, logger);

  assert.equal((await service.login({ username: "manager", password })).authenticated, true);
  assert.equal((await service.login({ username: "manager", password: "Wrong123!" })).authenticated, false);

  const registration = await service.register({
    username: "new.seller",
    password: "Seller123!",
    firstName: "Novi",
    lastName: "Prodavac",
  });
  assert.equal(registration.authenticated, true);
  assert.equal(registration.userData?.role, UserRole.SELLER);
  assert.notEqual(repository.users[1].password, "Seller123!");
  assert.equal(await bcrypt.compare("Seller123!", repository.users[1].password), true);
  assert.equal((await service.register({ username: "new.seller", password: "Seller123!", firstName: "Novi", lastName: "Prodavac" })).authenticated, false);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    assert.equal((await service.login({ username: "manager", password: "Wrong123!" })).authenticated, false);
  }
  assert.equal((await service.login({ username: "manager", password })).authenticated, false);
  assert.ok(logger.entries.length >= 4);
  console.log("AuthService tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
