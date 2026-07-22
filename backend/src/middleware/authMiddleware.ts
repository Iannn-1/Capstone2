import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/**
 * JWT authentication middleware (Requirements 6.1, 6.3).
 *
 * Validates the `Authorization: Bearer <token>` header, verifies the token
 * against JWT_SECRET, and attaches the decoded identity to `req.user`.
 *
 * On failure (missing header, malformed token, invalid signature, expired
 * token) responds with HTTP 401 without leaking internal error details.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const token = authHeader.slice(7) // strip "Bearer " prefix

  const secret = process.env.JWT_SECRET
  if (!secret) {
    // Misconfigured environment — treat as unauthorized without exposing detail
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: number
      email: string
      role: string
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role }
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized' })
  }
}

export default authMiddleware
