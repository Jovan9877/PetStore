import { Response, Router } from "express";
import { IShelterService } from "../../Domain/services/IShelterService";
export class ShelterController {
  private readonly router = Router();
  constructor(private readonly service: IShelterService) {
    this.router.get("/shelters/data", async (req, res) => this.respond(res, () => this.service.getData(typeof req.query.simulatedDateTime === "string" ? req.query.simulatedDateTime : undefined)));
    this.router.post("/shelters/pets/:id/reserve", async (req, res) => this.respond(res, () => this.service.reserve(Number(req.params.id), req.body.data, String(req.body.reservedBy), req.body.simulatedDateTime), 201));
  }
  private async respond(res: Response, action: () => Promise<unknown>, status = 200): Promise<void> { try { res.status(status).json(await action()); } catch (error) { res.status(400).json({ message: (error as Error).message }); } }
  getRouter(): Router { return this.router; }
}
