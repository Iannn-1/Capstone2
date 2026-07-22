import { Request, Response, NextFunction } from 'express';
import { getTodayLogs, getTodayStats } from '../services/attendanceService';
import { ApiResponse } from '../types/models';
import type { AttendanceLogWithStudent, AttendanceStats } from '../types/models';

/**
 * GET /api/v1/dashboard/today
 *
 * Returns all attendance logs for today, each with the associated student.
 * Requirements: 4.1, 4.2, 4.3, 10.1
 */
export async function getTodayAttendance(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const logs = await getTodayLogs();
    const body: ApiResponse<AttendanceLogWithStudent[]> = { success: true, data: logs };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/dashboard/stats
 *
 * Returns aggregated daily attendance statistics (present, absent, on-time, late).
 * Requirements: 4.4, 5.1, 10.1, 10.4
 */
export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await getTodayStats();
    const body: ApiResponse<AttendanceStats> = { success: true, data: stats };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
