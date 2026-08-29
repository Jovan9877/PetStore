import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";
import { IAuthService } from './Domain/services/IAuthService';
import { AuthService } from './Services/AuthService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { ILoggerService } from './Domain/services/ILoggerService';
import { FileLoggerService } from './Services/FileLoggerService';
import { JsonUserRepository } from './Repositories/JsonUserRepository';
import { requireInternalApiKey } from './WebAPI/middlewares/InternalApiKeyMiddleware';

dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET || !process.env.INTERNAL_API_KEY) {
  throw new Error("JWT_SECRET and INTERNAL_API_KEY must be configured.");
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
const authService: IAuthService = new AuthService(userRepository, loggerService);

// WebAPI routes
const authController = new AuthController(authService, loggerService);

// Registering routes
app.use('/api/v1', authController.getRouter());

export default app;
