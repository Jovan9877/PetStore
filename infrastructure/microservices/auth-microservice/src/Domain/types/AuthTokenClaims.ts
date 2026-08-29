import { UserRole } from "../enums/UserRole";

export type AuthTokenClaims = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};
