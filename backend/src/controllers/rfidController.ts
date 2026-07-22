import { Request, Response, NextFunction } from 'express'
import { processRfidScan } from '../services/attendanceService'
import { ApiResponse, ApiErrorResponse, RfidScanBody, ScanResult } from '../types/models'

/**
 * RfidController — handles HTTP requests for RFID scan operations.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.4
 */

/**
 * POST /api/v1/rfid/scan
 *
 * Validates the rfid_tag_uid field from the request body, delegates to
 * AttendanceService.processRfidScan(), and returns the scan result.
 *
 * Responses:
 *   - 400  { success: false, error: "rfid_tag_uid is required" }
 *          when rfid_tag_uid is missing, empty, or whitespace-only (Requirement 1.3, 10.1)
 *   - 201  { success: true, data: { student, log } }
 *          on a successful scan (Requirements 1.1, 1.2, 1.4, 1.5)
 *   - Forwards unexpected errors to next(err) for the global error handler (Requirement 10.4)
 */
export async function scan(
  req: Request<Record<string, never>, ApiResponse<ScanResult> | ApiErrorResponse, RfidScanBody>,
  res: Response<ApiResponse<ScanResult> | ApiErrorResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { rfid_tag_uid } = req.body

    // Validate: missing, empty, or whitespace-only (Requirements 1.3, 10.1)
    if (
      rfid_tag_uid === undefined ||
      rfid_tag_uid === null ||
      typeof rfid_tag_uid !== 'string' ||
      rfid_tag_uid.trim() === ''
    ) {
      res.status(400).json({ success: false, error: 'rfid_tag_uid is required' })
      return
    }

    // Delegate to service layer (Requirements 1.1, 1.2, 1.4, 1.5)
    const result = await processRfidScan(rfid_tag_uid)

    res.status(201).json({ success: true, data: result })
  } catch (err) {
    // Forward all unexpected errors to the global error handler (Requirement 10.4)
    next(err)
  }
}

export default { scan }
