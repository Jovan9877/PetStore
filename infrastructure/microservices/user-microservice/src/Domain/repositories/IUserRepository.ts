import { User } from "../models/User";

export interface IUserRepository {
  getAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
}
