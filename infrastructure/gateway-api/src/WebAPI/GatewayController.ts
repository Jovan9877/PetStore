import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { CreatePetDTO } from "../Domain/DTOs/CreatePetDTO";
import { CreatePetSittingDTO } from "../Domain/DTOs/CreatePetSittingDTO";
import { ReserveShelterPetDTO } from "../Domain/DTOs/ShelterDTOs";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("manager"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("manager", "seller"), this.getUserById.bind(this));

    // Pet store
    this.router.get("/pets", authenticate, authorize("manager"), this.getAllPets.bind(this));
    this.router.get("/pets/available", authenticate, authorize("manager", "seller"), this.getAvailablePets.bind(this));
    this.router.post("/pets", authenticate, authorize("manager"), this.createPet.bind(this));
    this.router.post("/sales/:petId", authenticate, authorize("seller"), this.sellPet.bind(this));
    this.router.get("/receipts", authenticate, authorize("manager"), this.getReceipts.bind(this));
    this.router.get("/pet-sitting/stays", authenticate, authorize("manager", "seller"), this.getPetSittingStays.bind(this));
    this.router.post("/pet-sitting/stays", authenticate, authorize("seller"), this.createPetSitting.bind(this));
    this.router.post("/pet-sitting/stays/:id/checkout", authenticate, authorize("seller"), this.checkoutPetSitting.bind(this));
    this.router.get("/pet-sitting/receipts", authenticate, authorize("manager"), this.getPetSittingReceipts.bind(this));
    this.router.get("/shelters/data", authenticate, authorize("manager", "seller"), this.getShelterData.bind(this));
    this.router.post("/shelters/pets/:id/reserve", authenticate, authorize("manager", "seller"), this.reserveShelterPet.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginUserDTO = req.body;
      const result = await this.gatewayService.login(data);
      res.status(200).json(result);
    } catch (err) {
      const message = (err as Error).message;
      res.status(401).json({ success: false, message });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationUserDTO = req.body;
      const result = await this.gatewayService.register(data);
      res.status(200).json(result);
    } catch (err) {
      const message = (err as Error).message;
      res.status(400).json({ success: false, message });
    }
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (req.user.role.toLowerCase() !== "manager" && req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // Pet store
  private async getAllPets(req: Request, res: Response): Promise<void> {
    try {
      const pets = await this.gatewayService.getAllPets();
      res.status(200).json(pets);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAvailablePets(req: Request, res: Response): Promise<void> {
    try {
      const pets = await this.gatewayService.getAvailablePets();
      res.status(200).json(pets);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async createPet(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePetDTO = req.body;
      const pet = await this.gatewayService.createPet(data);
      res.status(201).json(pet);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async sellPet(req: Request, res: Response): Promise<void> {
    try {
      const petId = parseInt(String(req.params.petId), 10);
      const sellerName = req.user?.username ?? "unknown_seller";
      const simulatedTimeHeader = req.header("x-simulated-time");
      const simulatedTime = typeof simulatedTimeHeader === "string" ? simulatedTimeHeader : undefined;
      const receipt = await this.gatewayService.sellPet(petId, sellerName, simulatedTime);
      res.status(201).json(receipt);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async getReceipts(req: Request, res: Response): Promise<void> {
    try {
      const receipts = await this.gatewayService.getReceipts();
      res.status(200).json(receipts);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private simulatedDateTime(req: Request): string | undefined {
    const value = req.header("x-simulated-time");
    return typeof value === "string" ? value : undefined;
  }

  private async getPetSittingStays(_req: Request, res: Response): Promise<void> {
    try { res.status(200).json(await this.gatewayService.getPetSittingStays()); }
    catch (error) { res.status(500).json({ message: (error as Error).message }); }
  }
  private async createPetSitting(req: Request, res: Response): Promise<void> {
    try { res.status(201).json(await this.gatewayService.createPetSitting(req.body as CreatePetSittingDTO, req.user?.username ?? "unknown_seller", this.simulatedDateTime(req))); }
    catch (error) { res.status(400).json({ message: (error as Error).message }); }
  }
  private async checkoutPetSitting(req: Request, res: Response): Promise<void> {
    try { res.status(201).json(await this.gatewayService.checkoutPetSitting(Number(req.params.id), req.user?.username ?? "unknown_seller", this.simulatedDateTime(req))); }
    catch (error) { res.status(400).json({ message: (error as Error).message }); }
  }
  private async getPetSittingReceipts(_req: Request, res: Response): Promise<void> {
    try { res.status(200).json(await this.gatewayService.getPetSittingReceipts()); }
    catch (error) { res.status(500).json({ message: (error as Error).message }); }
  }
  private async getShelterData(req: Request, res: Response): Promise<void> {
    try { res.status(200).json(await this.gatewayService.getShelterData(this.simulatedDateTime(req))); }
    catch (error) { res.status(500).json({ message: (error as Error).message }); }
  }
  private async reserveShelterPet(req: Request, res: Response): Promise<void> {
    try { res.status(201).json(await this.gatewayService.reserveShelterPet(Number(req.params.id), req.body as ReserveShelterPetDTO, req.user?.username ?? "unknown_user", this.simulatedDateTime(req))); }
    catch (error) { res.status(400).json({ message: (error as Error).message }); }
  }

  public getRouter(): Router {
    return this.router;
  }
}
