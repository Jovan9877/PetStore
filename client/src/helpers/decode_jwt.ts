import { jwtDecode } from "jwt-decode";
import { AuthTokenClaimsType } from "../types/AuthTokenClaimsType";

export const decodeJWT = (token: string): AuthTokenClaimsType | null => {
  try {
    const decoded = jwtDecode<AuthTokenClaimsType>(token);

    if (decoded.id && decoded.username && decoded.firstName && decoded.lastName && decoded.role) {
      return {
        id: decoded.id,
        username: decoded.username,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
      };
    }

    return null;
  } catch {
    return null;
  }
};
