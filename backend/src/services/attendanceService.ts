/**
 * AttendanceService — core business logic for the School Attendance Monitoring System.
 *
 * Responsibilities:
 *   - Determine IN / OUT status for each RFID scan
 *   - Persist new AttendanceLog records
 *   - Return aggregated daily statistics
 *   - Fire-and-forget parent notifications
 */

import { Op } from 'sequelize';
import { AttendanceLog, Student } from '../models/index';
import {
  AttendanceLogAttributes,
  AttendanceLogWithStudent,
  AttendanceStats,
  ScanResult,
} from '../types/models';
import { NotFoundError } from '../utils/errors';
import { sendParentNotification } from './notificationService';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the start (00:00:00.000) and end (23:59:59.999) of today
 * in the server's local time zone.
 */
function getTodayRange(): { todayStart: Date; todayEnd: Date } {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, 0, 0, 0,
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999,
  );

  return { todayStart, todayEnd };
}

// ---------------------------------------------------------------------------
// Task 5.1 — determineStatus()
// ---------------------------------------------------------------------------

/**
 * Determines the next attendance status based on the student's last log today.
 *
 * Rules (Requirements 2.1–2.3, 2.6):
 *   - null  → 'IN'  (first scan of the day; student is arriving)
 *   - 'IN'  → 'OUT' (was in, now leaving)
 *   - 'OUT' → 'IN'  (was out, now returning)
 *
 * The return value is always exactly 'IN' or 'OUT'.
 */
export function determineStatus(lastLog: AttendanceLogAttributes | null): 'IN' | 'OUT' {
  if (lastLog === null) {
    return 'IN';
  }
  return lastLog.status === 'IN' ? 'OUT' : 'IN';
}

// ---------------------------------------------------------------------------
// Task 5.3 — processRfidScan()
// ---------------------------------------------------------------------------

/**
 * Processes an RFID card scan end-to-end.
 *
 * Steps:
 *   1. Look up the student by rfid_tag_uid — throw NotFoundError (404) if absent.
 *   2. Query the student's last attendance log for today.
 *   3. Call determineStatus() to get the next status.
 *   4. Persist a new AttendanceLog record.
 *   5. Fire-and-forget sendParentNotification (void, non-blocking).
 *   6. Return { student, log } as ScanResult.
 *
 * Requirements: 1.1, 1.2, 1.5, 2.4, 2.5
 */
export async function processRfidScan(rfid_tag_uid: string): Promise<ScanResult> {
  // Step 1: Resolve the student
  const student = await Student.findOne({ where: { rfid_tag_uid } });
  if (student === null) {
    throw new NotFoundError(`Student not found for RFID tag: ${rfid_tag_uid}`);
  }

  // Step 2: Find last log for this student today
  const { todayStart, todayEnd } = getTodayRange();

  const lastLog = await AttendanceLog.findOne({
    where: {
      student_id: student.id,
      scan_time: {
        [Op.between]: [todayStart, todayEnd],
      },
    },
    order: [
      ['scan_time', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  // Step 3: Determine the next status
  const status = determineStatus(lastLog ? (lastLog.get() as AttendanceLogAttributes) : null);

  // Step 4: Persist new log
  const log = await AttendanceLog.create({
    student_id: student.id,
    status,
  });

  // Step 5: Fire-and-forget notification (Requirements 1.5, 3.4)
  void sendParentNotification(
    student.get() as import('../types/models').StudentAttributes,
    log.get() as AttendanceLogAttributes,
  );

  // Step 6: Return result
  return {
    student: student.get() as import('../types/models').StudentAttributes,
    log: log.get() as AttendanceLogAttributes,
  };
}

// ---------------------------------------------------------------------------
// Task 5.6 — getTodayLogs()
// ---------------------------------------------------------------------------

/**
 * Returns all attendance logs for today, each with the associated Student included.
 * Results are ordered by scan_time descending (most recent first).
 *
 * Never throws for empty results — returns [] when no logs exist.
 *
 * Requirements: 4.1, 4.2, 4.3
 */
export async function getTodayLogs(): Promise<AttendanceLogWithStudent[]> {
  const { todayStart, todayEnd } = getTodayRange();

  const logs = await AttendanceLog.findAll({
    where: {
      scan_time: {
        [Op.between]: [todayStart, todayEnd],
      },
    },
    include: [
      {
        model: Student,
        as: 'Student',
      },
    ],
    order: [['scan_time', 'DESC']],
  });

  return logs.map((log) => log.get({ plain: true }) as AttendanceLogWithStudent);
}

// ---------------------------------------------------------------------------
// Task 5.8 — getTodayStats()
// ---------------------------------------------------------------------------

/**
 * Computes aggregated daily attendance statistics.
 *
 * Classification rules (Requirements 5.1–5.6):
 *   - present  : student has at least one 'IN' log today
 *   - absent   : student has no 'IN' log today
 *   - on-time  : present student whose earliest 'IN' scan_time ≤ 08:00:00 today
 *   - late     : present student whose earliest 'IN' scan_time >  08:00:00 today
 *
 * Invariants guaranteed:
 *   - presentCount + absentCount === totalStudentCount
 *   - onTimeCount  + lateCount   === presentCount
 */
export async function getTodayStats(): Promise<AttendanceStats> {
  const { todayStart, todayEnd } = getTodayRange();

  // Late threshold: today at 08:00:00.000 local time
  const lateThreshold = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate(),
    8, 0, 0, 0,
  );

  // Fetch all students
  const allStudents = await Student.findAll();
  const totalStudentCount = allStudents.length;

  // Fetch all 'IN' logs for today
  const inLogs = await AttendanceLog.findAll({
    where: {
      status: 'IN',
      scan_time: {
        [Op.between]: [todayStart, todayEnd],
      },
    },
  });

  // Group by student_id, keeping only the earliest (min scan_time) per student
  const earliestInByStudent = new Map<number, Date>();

  for (const log of inLogs) {
    const attrs = log.get() as AttendanceLogAttributes;
    const existing = earliestInByStudent.get(attrs.student_id);

    if (existing === undefined || attrs.scan_time < existing) {
      earliestInByStudent.set(attrs.student_id, attrs.scan_time);
    }
  }

  const presentCount = earliestInByStudent.size;
  const absentCount = totalStudentCount - presentCount;

  let onTimeCount = 0;
  let lateCount = 0;

  for (const scanTime of earliestInByStudent.values()) {
    if (scanTime <= lateThreshold) {
      onTimeCount++;
    } else {
      lateCount++;
    }
  }

  return {
    presentCount,
    absentCount,
    onTimeCount,
    lateCount,
  };
}
