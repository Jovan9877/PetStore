import { AuthTokenClaimsType } from "./AuthTokenClaimsType";

export type AuthContextType = {
    user: AuthTokenClaimsType | null;
    token: string | null;
    sessionTime: string | null;
    simulationDateTime: string | null;
    login: (token: string, simulationDateTime: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}
