import { Router } from 'express'
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware'
import { scan } from '../controllers/rfidController'

/**
 * RFID routes (Requirements 1.1, 6.2)
 *
 * POST /scan — validate API key, then process an RFID scan
 */
const router = Router()

router.post('/scan', apiKeyMiddleware, scan)

export default router
