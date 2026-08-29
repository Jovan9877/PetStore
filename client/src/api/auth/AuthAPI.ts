import axios, { AxiosInstance } from "axios";
import { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { IAuthAPI } from "./IAuthAPI";
import { AuthResponseType } from "../../types/AuthResponseType";
import { getErrorMessage } from "../../helpers/error_message";

export class AuthAPI implements IAuthAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({baseURL: import.meta.env.VITE_GATEWAY_URL, headers: { "Content-Type": "application/json" }});
  }

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.axiosInstance.post("/login", data);
      return this.normalizeAuthResponse(response.data, "login");
    } catch (error: unknown) {
      throw getErrorMessage(error, "Login request failed.");
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.axiosInstance.post("/register", data);
      return this.normalizeAuthResponse(response.data, "register");
    } catch (error: unknown) {
      throw getErrorMessage(error, "Registration request failed.");
    }
  }

  private normalizeAuthResponse(
    raw: unknown,
    mode: "login" | "register"
  ): AuthResponseType {
    const payload = raw as Partial<AuthResponseType>;
    if (typeof payload.success === "boolean") {
      return {
        success: payload.success,
        message: payload.message,
        token: payload.token,
      };
    }

    if (payload.token) {
      return { success: true, token: payload.token, message: payload.message };
    }

    return {
      success: false,
      message: payload.message ?? `Unexpected ${mode} response.`,
    };
  }
}
