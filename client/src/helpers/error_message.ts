import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") return error;
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string") return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
