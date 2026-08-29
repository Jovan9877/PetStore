import { NextFunction, Request, Response } from "express";

export function requireInternalApiKey(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.INTERNAL_API_KEY;
  if (req.header("x-internal-api-key") !== expected) {
    res.status(403).json({ message: "Direct microservice access is forbidden." });
    return;
  }
  next();
}
