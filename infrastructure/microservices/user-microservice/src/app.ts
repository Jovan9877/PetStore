import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";
import { IUsersService } from './Domain/services/IUsersService';
import { UsersService } from './Services/UsersService';
import { UsersController } from './WebAPI/controllers/UsersController';
import { ILoggerService } from './Domain/services/ILoggerService';
import { FileLoggerService } from './Services/FileLoggerService';
import { JsonUserRepository } from './Repositories/JsonUserRepository';
import { requireInternalApiKey } from './WebAPI/middlewares/InternalApiKeyMiddleware';

dotenv.config({ quiet: true });

if (!process.env.INTERNAL_API_KEY) {
  throw new Error("INTERNAL_API_KEY must be configured.");
}

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());
app.use(requireInternalApiKey);

const userDataPath = path.resolve(process.cwd(), process.env.USER_DATA_PATH ?? "../../Data/users.json");
const logPath = path.resolve(process.cwd(), "logs/events.log");
const userRepository = new JsonUserRepository(userDataPath);

// Services
const loggerService: ILoggerService = new FileLoggerService(logPath);
const userService: IUsersService = new UsersService(userRepository, loggerService);

// WebAPI routes
const userController = new UsersController(userService, loggerService);

// Registering routes
app.use('/api/v1', userController.getRouter());

export default app;
