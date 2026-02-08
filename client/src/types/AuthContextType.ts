import { AuthTokenClaimsType } from "./AuthTokenClaimsType";

export type AuthContextType = {
    user: AuthTokenClaimsType | null;
    token: string | null;
    sessionTime: string | null;
    login: (token: string, sessionTime: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}
