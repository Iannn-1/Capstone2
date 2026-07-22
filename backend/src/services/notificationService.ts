/**
 * Notification service for the School Attendance Monitoring System.
 * Sends parent/guardian notifications when a student scans in or out.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { AttendanceLogAttributes, StudentAttributes } from '../types/models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a Date object as "HH:MM AM/PM" (12-hour clock, leading zero for hours).
 *
 * Examples:
 *   07:45 → "07:45 AM"
 *   13:30 → "01:30 PM"
 *   00:00 → "12:00 AM"
 *   12:00 → "12:00 PM"
 */
function formatScanTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  // Convert 24-hour to 12-hour
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours = hours - 12;
  }

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${hh}:${mm} ${period}`;
}

// ---------------------------------------------------------------------------
// sendParentNotification
// ---------------------------------------------------------------------------

/**
 * Sends a notification to the student's parent/guardian after an attendance scan.
 *
 * In development mode (NODE_ENV === 'development'), the formatted message is
 * printed to console.log. In all environments, any internal error is caught
 * and logged to console.error without re-throwing (fire-and-forget safe).
 *
 * @param student - The student who scanned in or out
 * @param log     - The attendance log record that was just created
 *
 * Postconditions (Requirements 3.1, 3.2, 3.3):
 *   - Message includes: student name, status, scan time (HH:MM AM/PM),
 *     parent_name, parent_email, parent_phone
 *   - In development, message is output via console.log
 *   - Any internal error is caught and logged; this function NEVER re-throws
 */
export async function sendParentNotification(
  student: StudentAttributes,
  log: AttendanceLogAttributes,
): Promise<void> {
  try {
    const formattedTime = formatScanTime(log.scan_time);

    const message =
      `Attendance Notification\n` +
      `------------------------\n` +
      `Student   : ${student.name}\n` +
      `Status    : ${log.status}\n` +
      `Scan Time : ${formattedTime}\n` +
      `------------------------\n` +
      `Parent    : ${student.parent_name}\n` +
      `Email     : ${student.parent_email}\n` +
      `Phone     : ${student.parent_phone}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[NotificationService] ' + message);
    }

    // -----------------------------------------------------------------------
    // Future email integration via Nodemailer (commented out until configured)
    // -----------------------------------------------------------------------
    //
    // import nodemailer from 'nodemailer';
    //
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT) || 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: `"School Attendance" <${process.env.SMTP_FROM}>`,
    //   to: student.parent_email,
    //   subject: `Attendance Alert: ${student.name} scanned ${log.status}`,
    //   text: message,
    // });
    // -----------------------------------------------------------------------
  } catch (error) {
    console.error('[NotificationService] Failed to send parent notification:', error);
  }
}
