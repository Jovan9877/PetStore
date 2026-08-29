import { User } from "../models/User";

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  add(user: User): Promise<User>;
}
