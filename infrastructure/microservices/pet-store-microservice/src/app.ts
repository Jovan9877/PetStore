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

dotenv.config({ quiet: true });

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

const dataFilePath = path.resolve(process.cwd(), "src", "Data", "store.json");
const logFilePath = path.resolve(process.cwd(), "logs", "events.log");

const dbService = new JsonDatabaseService(dataFilePath);
const petRepository = new JsonPetRepository(dbService);
const receiptRepository = new JsonReceiptRepository(dbService);
const loggerService = new FileLoggerService(logFilePath);
const petStoreService = new PetStoreService(petRepository, receiptRepository);

const petStoreController = new PetStoreController(petStoreService, loggerService);
app.use("/api/v1", petStoreController.getRouter());

export default app;
