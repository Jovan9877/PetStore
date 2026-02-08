import { Db } from "./DbConnectionPool";
import mysql from "mysql2/promise";

export async function initialize_database() {
  try {
    await ensureDatabaseExists();
    await Db.initialize();
    await removeLegacyProfileImageColumn();
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

async function removeLegacyProfileImageColumn(): Promise<void> {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    return;
  }

  const result = await Db.query(
    "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profileImage'",
    [dbName]
  );

  const count = Number(result?.[0]?.count ?? 0);
  if (count > 0) {
    await Db.query("ALTER TABLE users DROP COLUMN profileImage");
  }
}
