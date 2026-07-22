/**
 * Unit tests for AttendanceService — determineStatus()
 *
 * Task 13.1: Verify the three core status-determination rules
 * Requirements: 2.1, 2.2, 2.3, 2.6
 */

import { determineStatus } from './attendanceService';
import { AttendanceLogAttributes } from '../types/models';

// Minimal stub for AttendanceLogAttributes — only the fields determineStatus cares about
function makeLog(status: 'IN' | 'OUT'): AttendanceLogAttributes {
  return {
    id: 1,
    student_id: 1,
    scan_time: new Date(),
    status,
  };
}

describe('determineStatus', () => {
  // Requirement 2.1 — first scan of the day returns 'IN'
  it('returns "IN" when lastLog is null (first scan of the day)', () => {
    expect(determineStatus(null)).toBe('IN');
  });

  // Requirement 2.2 — student was IN, next status is OUT
  it('returns "OUT" when lastLog.status is "IN"', () => {
    expect(determineStatus(makeLog('IN'))).toBe('OUT');
  });

  // Requirement 2.3 — student was OUT, next status is IN
  it('returns "IN" when lastLog.status is "OUT"', () => {
    expect(determineStatus(makeLog('OUT'))).toBe('IN');
  });

  // Requirement 2.6 — return value is always exactly 'IN' or 'OUT'
  it('always returns exactly "IN" or "OUT" (never another string or falsy value)', () => {
    const results = [
      determineStatus(null),
      determineStatus(makeLog('IN')),
      determineStatus(makeLog('OUT')),
    ];
    for (const result of results) {
      expect(['IN', 'OUT']).toContain(result);
    }
  });
});
