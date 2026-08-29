import { UserRole } from "../enums/UserRole";

export type User = {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};
