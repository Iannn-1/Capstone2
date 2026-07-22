import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index';
import { ApiResponse, ApiErrorResponse } from '../types/models';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'staff';
}

interface AuthData {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns a JWT token.
 */
export async function login(
  req: Request<Record<string, never>, ApiResponse<AuthData> | ApiErrorResponse, LoginBody>,
  res: Response<ApiResponse<AuthData> | ApiErrorResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'email and password are required' });
      return;
    }

    // Fetch user including password_hash (unscoped to bypass defaultScope exclusion)
    const user = await (User as any).unscoped().findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/register
 * Creates a new admin or staff user. Protected — requires an existing admin JWT.
 */
export async function register(
  req: Request<Record<string, never>, ApiResponse<{ id: number; name: string; email: string; role: string }> | ApiErrorResponse, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role = 'staff' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'name, email and password are required' });
      return;
    }

    if (!['admin', 'staff'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role value' });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, error: 'Email already in use' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await (User as any).unscoped().create({ name, email, password_hash, role });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}
