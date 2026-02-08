import axios, { AxiosInstance } from "axios";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { IAuthAPI } from "./IAuthAPI";
import { AuthResponseType } from "../../types/AuthResponseType";

export class AuthAPI implements IAuthAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" }});
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.axiosInstance.post("/login", data);
      return this.normalizeAuthResponse(response.data, "login");
    } catch (err: any) {
      throw err?.response?.data?.message ?? "Login request failed.";
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.axiosInstance.post("/register", data);
      return this.normalizeAuthResponse(response.data, "register");
    } catch (err: any) {
      throw err?.response?.data?.message ?? "Registration request failed.";
    }
  }

  private normalizeAuthResponse(
    raw: any,
    mode: "login" | "register"
  ): AuthResponseType {
    if (typeof raw?.success === "boolean") {
      return {
        success: raw.success,
        message: raw.message,
        token: raw.token,
      };
    }

    if (typeof raw?.authenificated === "boolean") {
      return {
        success: raw.authenificated,
        message:
          raw.message ??
          (raw.authenificated
            ? undefined
            : mode === "login"
              ? "Invalid credentials!"
              : "Registration failed."),
        token: raw.token,
      };
    }

    if (raw?.token) {
      return { success: true, token: raw.token, message: raw.message };
    }

    return {
      success: false,
      message: raw?.message ?? "Unexpected authentication response.",
    };
  }
}
