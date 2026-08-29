import { NextFunction, Request, Response } from "express";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";

export function auditRequests(logger: ILoggerService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = Date.now();
    res.on("finish", () => {
      const level = res.statusCode >= 500 ? LogLevel.ERROR : res.statusCode >= 400 ? LogLevel.WARNING : LogLevel.INFO;
      void logger.log(level, `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt} ms)`);
    });
    next();
  };
}
