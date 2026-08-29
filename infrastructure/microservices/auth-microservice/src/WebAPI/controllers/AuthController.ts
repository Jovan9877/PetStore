import { Request, Response, Router } from 'express';
import jwt from "jsonwebtoken";
import { IAuthService } from '../../Domain/services/IAuthService';
import { LoginUserDTO } from '../../Domain/DTOs/LoginUserDTO';
import { RegistrationUserDTO } from '../../Domain/DTOs/RegistrationUserDTO';
import { validateLoginData } from '../validators/LoginValidator';
import { validateRegistrationData } from '../validators/RegisterValidator';
import { ILoggerService } from '../../Domain/services/ILoggerService';
import { LogLevel } from '../../Domain/enums/LogLevel';

export class AuthController {
  private router: Router;
  private authService: IAuthService;
  private readonly logger: ILoggerService;

  constructor(authService: IAuthService, logger: ILoggerService) {
    this.router = Router();
    this.authService = authService;
    this.logger = logger;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.login.bind(this));
    this.router.post('/auth/register', this.register.bind(this));
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates a userData?
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Login request received.");

      const data: LoginUserDTO = req.body as LoginUserDTO;

      // Validate login input
      const validation = validateLoginData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.login(data);

      if (result.authenticated) {
        const token = jwt.sign(
          result.userData ?? {},
          process.env.JWT_SECRET as string,
          { expiresIn: '6h' }
        );

        res.status(200).json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials!" });
      }
    } catch (error) {
      await this.logger.log(LogLevel.ERROR, (error as Error).message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registers a new userData?
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log(LogLevel.INFO, "Registration request received.");

      const data: RegistrationUserDTO = req.body as RegistrationUserDTO;

      // Validate registration input
      const validation = validateRegistrationData(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.register(data);

      if (result.authenticated) {
        res.status(201).json({ success: true, message: "Registration successful" });
      } else {
        res.status(400).json({ success: false, message: "Registration failed. Username may already exist." });
      }
    } catch (error) {
      await this.logger.log(LogLevel.ERROR, (error as Error).message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
