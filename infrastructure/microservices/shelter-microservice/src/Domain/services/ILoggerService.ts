import { LogLevel } from "../enums/LogLevel";
export interface ILoggerService { log(level: LogLevel, message: string): Promise<boolean>; }
