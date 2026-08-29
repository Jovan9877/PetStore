import { NextFunction, Request, Response } from "express";
export function requireInternalApiKey(req: Request, res: Response, next: NextFunction): void {
  if (req.header("x-internal-api-key") !== process.env.INTERNAL_API_KEY) { res.status(403).json({ message: "Direct microservice access is forbidden." }); return; }
  next();
}
