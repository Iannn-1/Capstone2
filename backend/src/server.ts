import dotenv from 'dotenv';
dotenv.config();

import mysql2 from 'mysql2/promise';
import app from './app';
import { sequelize } from './config/database';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MAX_RETRIES = 3;

/**
 * Connects to MySQL without a database selected and creates the database
 * if it does not already exist.
 */
async function ensureDatabaseExists(): Promise<void> {
  const {
    DB_HOST = 'localhost',
    DB_PORT = '3306',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = '',
  } = process.env;

  // Connect without specifying a database
  const connection = await mysql2.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`✅ Database "${DB_NAME}" is ready.`);
  } finally {
    await connection.end();
  }
}

/**
 * Attempts to authenticate the Sequelize database connection with retry logic.
 * Retries up to MAX_RETRIES times before giving up (Requirement 8.4).
 */
async function connectWithRetry(attempt: number = 1): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (err) {
    console.error(`Database connection attempt ${attempt} of ${MAX_RETRIES} failed:`, err);

    if (attempt < MAX_RETRIES) {
      console.log('Retrying database connection...');
      await connectWithRetry(attempt + 1);
    } else {
      console.error(`All ${MAX_RETRIES} database connection attempts exhausted. Shutting down.`);
      process.exit(1);
    }
  }
}

async function startServer(): Promise<void> {
  // Step 1: Ensure the database schema exists (creates it if missing)
  await ensureDatabaseExists();

  // Step 2: Authenticate Sequelize connection with retry
  await connectWithRetry();

  // Step 3: Sync models in dependency order to satisfy foreign key constraints:
  //   Users (no deps) → Students (no deps) → AttendanceLogs (FK → Students)
  const { User, Student, AttendanceLog } = await import('./models/index');
  await User.sync({ alter: true });
  await Student.sync({ alter: true });
  await AttendanceLog.sync({ alter: true });
  console.log('Database tables synced successfully.');

  app.listen(PORT, () => {
    console.log(`School Attendance API is running on port ${PORT}`);
  });
}

startServer();
