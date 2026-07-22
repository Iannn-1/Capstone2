import { Request, Response, NextFunction } from 'express'
import { NotFoundError } from '../utils/errors'

/**
 * Sequelize connection-related error names that indicate database unavailability.
 * These are mapped to HTTP 503 without exposing any connection details.
 */
const DB_UNAVAILABLE_ERRORS = new Set([
  'SequelizeConnectionError',
  'SequelizeConnectionRefusedError',
  'SequelizeHostNotFoundError',
  'SequelizeHostNotReachableError',
  'SequelizeAccessDeniedError',
  'SequelizeConnectionTimedOutError',
])

/**
 * Global error handler middleware (Requirements 8.1, 8.2, 10.2, 10.3, 10.4).
 *
 * Must be registered as the last middleware in the Express application so that
 * errors forwarded via `next(err)` from controllers and other middleware are
 * caught here.
 *
 * Error mapping:
 *   - `NotFoundError`              → 404  { success: false, error: <original message> }
 *   - Database unavailability      → 503  { success: false, error: "Service temporarily unavailable" }
 *   - Everything else              → 500  { success: false, error: "Internal server error" }
 *
 * The full error stack trace is always logged server-side.
 * Connection details, credentials, and stack traces are never sent to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Log the full error server-side for observability (Requirement 8.2)
  console.error(err.stack ?? err.message)

  if (err instanceof NotFoundError) {
    // 404 — resource not found; the message is safe to surface (no credentials)
    res.status(404).json({ success: false, error: err.message })
    return
  }

  if (DB_UNAVAILABLE_ERRORS.has(err.name)) {
    // 503 — database unreachable; never expose connection details (Requirement 8.1)
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
    })
    return
  }

  // 500 — all other unhandled errors; never expose internal details (Requirement 8.2)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

export default errorHandler
