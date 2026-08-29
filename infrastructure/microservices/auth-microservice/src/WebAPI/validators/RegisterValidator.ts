import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";

export function validateRegistrationData(data: RegistrationUserDTO): { success: boolean; message?: string } {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }
  if (!data.password || data.password.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long" };
  }
  if (!data.firstName || data.firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters long" };
  }
  if (!data.lastName || data.lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters long" };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(data.password)) {
    return { success: false, message: "Password must contain uppercase, lowercase, number and special character" };
  }
  return { success: true };
}
