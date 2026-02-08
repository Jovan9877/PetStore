import { LogLevel } from "../enums/LogLevel";

export interface ILogerService {
  log(level: LogLevel, message: string): Promise<void>;
}
