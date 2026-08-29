import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { IUserRepository } from "../Domain/repositories/IUserRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";

export class UsersService implements IUsersService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepository.getAll();
    await this.logger.log(LogLevel.INFO, `Returned ${users.length} users.`);
    return users.map(u => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    await this.logger.log(LogLevel.INFO, `Returned user '${id}'.`);
    return this.toDTO(user);
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
