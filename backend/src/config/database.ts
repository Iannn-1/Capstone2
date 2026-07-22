import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME,
  DB_USER = 'root',
  DB_PASSWORD,
  NODE_ENV = 'development',
} = process.env;

if (!DB_NAME || !DB_PASSWORD) {
  throw new Error('DB_NAME and DB_PASSWORD must be set in .env');
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'mysql',
  logging: NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});
