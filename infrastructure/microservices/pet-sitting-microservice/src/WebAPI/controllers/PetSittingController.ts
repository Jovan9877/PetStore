import { Request, Response, Router } from "express";
import { IPetSittingService } from "../../Domain/services/IPetSittingService";

export class PetSittingController {
  private readonly router = Router();
  constructor(private readonly service: IPetSittingService) { this.initializeRoutes(); }
  private initializeRoutes(): void {
    this.router.get("/pet-sitting/stays", async (_req, res) => this.respond(res, () => this.service.getStays()));
    this.router.get("/pet-sitting/receipts", async (_req, res) => this.respond(res, () => this.service.getReceipts()));
    this.router.post("/pet-sitting/stays", async (req, res) => this.respond(res, () => this.service.checkIn(req.body.data, String(req.body.sellerName), req.body.simulatedDateTime), 201));
    this.router.post("/pet-sitting/stays/:id/checkout", async (req, res) => this.respond(res, () => this.service.checkOut(Number(req.params.id), String(req.body.sellerName), req.body.simulatedDateTime), 201));
  }
  private async respond(res: Response, action: () => Promise<unknown>, successStatus = 200): Promise<void> {
    try { res.status(successStatus).json(await action()); }
    catch (error) { res.status(400).json({ message: (error as Error).message }); }
  }
  getRouter(): Router { return this.router; }
}
