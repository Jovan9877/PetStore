import { Router, Request, Response } from "express";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { IUsersService } from "../../Domain/services/IUsersService";

export class UsersController {
  private readonly router: Router;

  constructor(
    private readonly usersService: IUsersService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/users", this.getAllUsers.bind(this));
    this.router.get("/users/:id", this.getUserById.bind(this));
  }

  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Fetching all users.");
      const users = await this.usersService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      await this.logger.log(LogLevel.ERROR, (err as Error).message);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await this.logger.log(LogLevel.INFO, `Fetching user with ID ${id}.`);
      const user = await this.usersService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      await this.logger.log(LogLevel.WARNING, (err as Error).message);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
