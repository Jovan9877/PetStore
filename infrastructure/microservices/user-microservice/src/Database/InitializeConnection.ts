import { Db } from "./DbConnectionPool";
import mysql from "mysql2/promise";

export async function initialize_database() {
  try {
    await ensureDatabaseExists();
    await Db.initialize();
    console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected");

  } catch (err) {
    console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization ", err);
  }
}

async function ensureDatabaseExists(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const dbName = process.env.DB_NAME;
  if (!dbName) {
    await connection.end();
    throw new Error("DB_NAME is not defined in .env");
  }

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.end();
}
