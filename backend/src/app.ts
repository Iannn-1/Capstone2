import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// CORS middleware (Requirement 8.2)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Global middleware: ensure all responses have Content-Type: application/json (Requirement 10.3)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Mount root router
app.use(router);

// Global error handler — must be registered last (Requirements 8.2, 10.3)
app.use(errorHandler);

export default app;
