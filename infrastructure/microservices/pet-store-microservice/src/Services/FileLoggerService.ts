import { LogLevel } from "../Domain/enums/LogLevel";
import { ILogerService } from "../Domain/services/ILogerService";
import fs from "fs/promises";
import path from "path";

export class FileLoggerService implements ILogerService {
  constructor(private readonly logFilePath: string) {}

  async log(level: LogLevel, message: string): Promise<void> {
    const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });
    await fs.appendFile(this.logFilePath, entry, "utf-8");
  }
}
