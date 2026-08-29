import { LogLevel } from "../Domain/enums/LogLevel";
import { ILoggerService } from "../Domain/services/ILoggerService";
import fs from "fs/promises";
import path from "path";

export class FileLoggerService implements ILoggerService {
  constructor(private readonly logFilePath: string) {}

  async log(level: LogLevel, message: string): Promise<boolean> {
    try {
      const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
      await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });
      await fs.appendFile(this.logFilePath, entry, "utf-8");
      return true;
    } catch {
      return false;
    }
  }
}
