/**
 * Express namespace augmentation.
 * Extends Express.Request to include the decoded JWT user identity
 * attached by the auth middleware (Requirement 6.3).
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: string
      }
    }
  }
}

export {}
