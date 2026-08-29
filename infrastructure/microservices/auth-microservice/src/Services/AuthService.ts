import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { IUserRepository } from "../Domain/repositories/IUserRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { UserRole } from "../Domain/enums/UserRole";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);
  private readonly maxLoginAttempts: number = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10);
  private readonly lockoutMilliseconds: number = parseInt(process.env.LOCKOUT_MINUTES || "5", 10) * 60_000;
  private readonly failedLogins = new Map<string, { attempts: number; lockedUntil?: number }>();

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  /**
   * Login user
   */
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    const username = data.username.trim();
    const loginState = this.failedLogins.get(username.toLowerCase());
    if (loginState?.lockedUntil && loginState.lockedUntil > Date.now()) {
      await this.logger.log(LogLevel.WARNING, `Login blocked for locked username '${username}'.`);
      return { authenticated: false };
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      await this.registerFailedLogin(username);
      return { authenticated: false };
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      await this.registerFailedLogin(username);
      return { authenticated: false };
    }

    this.failedLogins.delete(username.toLowerCase());
    await this.logger.log(LogLevel.INFO, `User '${user.username}' logged in successfully.`);

    return {
      authenticated: true,
      userData: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private async registerFailedLogin(username: string): Promise<void> {
    const key = username.toLowerCase();
    const attempts = (this.failedLogins.get(key)?.attempts ?? 0) + 1;
    const lockedUntil = attempts >= this.maxLoginAttempts ? Date.now() + this.lockoutMilliseconds : undefined;
    this.failedLogins.set(key, { attempts: lockedUntil ? 0 : attempts, lockedUntil });
    await this.logger.log(
      LogLevel.WARNING,
      lockedUntil ? `Username '${username}' locked after repeated failed logins.` : `Unsuccessful login for username '${username}'.`
    );
  }

  /**
   * Register new user
   */
  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    const username = data.username.trim();
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      await this.logger.log(LogLevel.WARNING, `Registration rejected for existing username '${username}'.`);
      return { authenticated: false };
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser: User = {
      id: randomUUID(),
      username,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: UserRole.SELLER,
      password: hashedPassword,
    };

    const savedUser = await this.userRepository.add(newUser);
    await this.logger.log(LogLevel.INFO, `Seller account '${savedUser.username}' registered.`);

    return {
      authenticated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
      },
    };
  }
}
