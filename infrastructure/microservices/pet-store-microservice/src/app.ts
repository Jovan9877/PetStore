import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { JsonDatabaseService } from "./Services/JsonDatabaseService";
import { JsonPetRepository } from "./Repositories/JsonPetRepository";
import { JsonReceiptRepository } from "./Repositories/JsonReceiptRepository";
import { PetStoreService } from "./Services/PetStoreService";
import { FileLoggerService } from "./Services/FileLoggerService";
import { PetStoreController } from "./WebAPI/controllers/PetStoreController";
import { DayShiftPricingService } from "./Services/DayShiftPricingService";
import { NightShiftPricingService } from "./Services/NightShiftPricingService";
import { ShiftPricingServiceResolver } from "./Services/ShiftPricingServiceResolver";
import { requireInternalApiKey } from "./WebAPI/middlewares/InternalApiKeyMiddleware";
import { JsonSaleRepository } from "./Repositories/JsonSaleRepository";

dotenv.config({ quiet: true });

if (!process.env.INTERNAL_API_KEY) {
  throw new Error("INTERNAL_API_KEY must be configured.");
}

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ?? ["GET", "POST"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());
app.use(requireInternalApiKey);

const dataFilePath = path.resolve(process.cwd(), "src", "Data", "store.json");
const logFilePath = path.resolve(process.cwd(), "logs", "events.log");

const dbService = new JsonDatabaseService(dataFilePath);
const petRepository = new JsonPetRepository(dbService);
const receiptRepository = new JsonReceiptRepository(dbService);
const saleRepository = new JsonSaleRepository(dbService);
const loggerService = new FileLoggerService(logFilePath);
const pricingResolver = new ShiftPricingServiceResolver(
  new DayShiftPricingService(),
  new NightShiftPricingService()
);
const petStoreService = new PetStoreService(
  petRepository,
  receiptRepository,
  saleRepository,
  pricingResolver,
  loggerService
);

const petStoreController = new PetStoreController(petStoreService, loggerService);
app.use("/api/v1", petStoreController.getRouter());

export default app;
