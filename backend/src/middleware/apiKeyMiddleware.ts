import { Request, Response, NextFunction } from 'express'

/**
 * API key authentication middleware (Requirement 6.2).
 *
 * Validates the `X-API-Key` header against the `API_KEY` environment variable.
 * Responds with 401 Unauthorized when the key is missing or does not match.
 * No internal details or key values are ever included in the response.
 */
export function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const providedKey = req.headers['x-api-key']

  if (
    typeof providedKey !== 'string' ||
    providedKey !== process.env.API_KEY
  ) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  next()
}

export default apiKeyMiddleware
