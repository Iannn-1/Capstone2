/**
 * Shared TypeScript model interfaces for the School Attendance Monitoring System.
 * These interfaces define the shape of all data models and API response envelopes.
 */

// ---------------------------------------------------------------------------
// Data model interfaces
// ---------------------------------------------------------------------------

export interface UserAttributes {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'admin' | 'staff'
  createdAt?: Date
  updatedAt?: Date
}

export interface StudentAttributes {
  id: number
  rfid_tag_uid: string
  name: string
  grade_level: string
  section: string
  parent_name: string
  parent_email: string
  parent_phone: string
  createdAt?: Date
  updatedAt?: Date
}

export interface AttendanceLogAttributes {
  id: number
  student_id: number
  scan_time: Date
  status: 'IN' | 'OUT'
  createdAt?: Date
  updatedAt?: Date
}

/** An AttendanceLog record with its associated Student included. */
export interface AttendanceLogWithStudent extends AttendanceLogAttributes {
  Student: StudentAttributes
}

// ---------------------------------------------------------------------------
// Service / business-logic interfaces
// ---------------------------------------------------------------------------

/** Returned by AttendanceService.processRfidScan() after a successful scan. */
export interface ScanResult {
  student: StudentAttributes
  log: AttendanceLogAttributes
}

/** Aggregated daily attendance statistics returned by the dashboard. */
export interface AttendanceStats {
  presentCount: number
  absentCount: number
  onTimeCount: number
  lateCount: number
}

// ---------------------------------------------------------------------------
// Request body interfaces
// ---------------------------------------------------------------------------

/** Request body for POST /api/v1/rfid/scan */
export interface RfidScanBody {
  rfid_tag_uid: string
}

// ---------------------------------------------------------------------------
// API response envelope interfaces
// ---------------------------------------------------------------------------

/** Successful API response envelope — success is always true and data is always present. */
export interface ApiResponse<T> {
  success: true
  data: T
}

/** Error API response envelope — success is always false and error is a descriptive string. */
export interface ApiErrorResponse {
  success: false
  error: string
}
