import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getTodayAttendance, getStats } from '../controllers/dashboardController'

/**
 * Dashboard routes (Requirements 4.1, 5.1, 6.1)
 *
 * GET /attendance — return today's attendance logs (authenticated)
 * GET /stats      — return aggregated daily statistics (authenticated)
 */
const router = Router()

router.get('/attendance', authMiddleware, getTodayAttendance)
router.get('/stats', authMiddleware, getStats)

export default router
