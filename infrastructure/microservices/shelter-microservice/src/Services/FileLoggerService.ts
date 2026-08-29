import fs from "fs/promises";
import path from "path";
import { LogLevel } from "../Domain/enums/LogLevel";
import { ILoggerService } from "../Domain/services/ILoggerService";
export class FileLoggerService implements ILoggerService {
  constructor(private readonly filePath: string) {}
  async log(level: LogLevel, message: string): Promise<boolean> {
    try { await fs.mkdir(path.dirname(this.filePath), { recursive: true }); await fs.appendFile(this.filePath, `[${new Date().toISOString()}] [${level}] ${message}\n`, "utf-8"); return true; }
    catch { return false; }
  }
}
