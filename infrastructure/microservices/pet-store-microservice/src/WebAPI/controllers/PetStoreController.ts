import { Request, Response, Router } from "express";
import { IPetStoreService } from "../../Domain/services/IPetStoreService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";

export class PetStoreController {
  private readonly router: Router;

  constructor(
    private readonly petStoreService: IPetStoreService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/pets", this.getAllPets.bind(this));
    this.router.get("/pets/available", this.getAvailablePets.bind(this));
    this.router.post("/pets", this.addPet.bind(this));
    this.router.post("/sales/:petId", this.sellPet.bind(this));
    this.router.get("/receipts", this.getReceipts.bind(this));
  }

  private async getAllPets(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Fetching all pets.");
      const pets = await this.petStoreService.getAllPets();
      res.status(200).json(pets);
    } catch (error) {
      await this.logger.log(LogLevel.ERROR, (error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getAvailablePets(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Fetching unsold pets.");
      const pets = await this.petStoreService.getUnsoldPets();
      res.status(200).json(pets);
    } catch (error) {
      await this.logger.log(LogLevel.ERROR, (error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async addPet(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Adding a new pet.");
      const pet = await this.petStoreService.addPet(req.body);
      res.status(201).json(pet);
    } catch (error) {
      await this.logger.log(LogLevel.WARNING, (error as Error).message);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  private async sellPet(req: Request, res: Response): Promise<void> {
    try {
      const petId = parseInt(String(req.params.petId), 10);
      const sellerName = String(req.body?.sellerName ?? "unknown_seller");
      const simulatedTime = typeof req.body?.simulatedTime === "string" ? req.body.simulatedTime : undefined;
      await this.logger.log(LogLevel.INFO, `Selling pet with ID ${petId} by ${sellerName}.`);
      const receipt = await this.petStoreService.sellPet(petId, sellerName, simulatedTime);
      res.status(201).json(receipt);
    } catch (error) {
      await this.logger.log(LogLevel.WARNING, (error as Error).message);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  private async getReceipts(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Fetching fiscal receipts.");
      const receipts = await this.petStoreService.getReceipts();
      res.status(200).json(receipts);
    } catch (error) {
      await this.logger.log(LogLevel.ERROR, (error as Error).message);
      res.status(500).json({ message: (error as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
