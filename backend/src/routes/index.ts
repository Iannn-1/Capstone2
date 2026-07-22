import { Router } from 'express'
import rfidRouter from './rfid'
import dashboardRouter from './dashboard'
import authRouter from './auth'
import studentsRouter from './students'

/**
 * Root API router (Requirements 10.1, 10.2)
 *
 * Mounts all sub-routers under /api/v1:
 *   /api/v1/auth       — Login & user registration
 *   /api/v1/rfid       — RFID scan endpoints
 *   /api/v1/dashboard  — Dashboard endpoints
 *   /api/v1/students   — Student management (CRUD)
 */
const router = Router()

router.use('/api/v1/auth', authRouter)
router.use('/api/v1/rfid', rfidRouter)
router.use('/api/v1/dashboard', dashboardRouter)
router.use('/api/v1/students', studentsRouter)

export default router
