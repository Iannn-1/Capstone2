# Requirements Document

## Introduction

This document defines the requirements for the School Attendance Monitoring System — a backend REST API that enables schools to track student attendance in real time using RFID card scanning. When a student taps their RFID card on a physical reader, the system records an attendance log (IN or OUT), persists it to a MySQL database, and notifies the student's parent or guardian asynchronously. Staff and administrators authenticate via JWT to access dashboard and management endpoints. The system is built as a Node.js + Express + TypeScript API consumed by RFID readers and a future Next.js frontend.

---

## Glossary

- **API**: The Express REST API backend (Node.js + TypeScript)
- **AttendanceLog**: A persisted record containing student_id, scan_time, and status (IN or OUT)
- **AttendanceService**: The service layer responsible for core IN/OUT determination and log persistence
- **DashboardController**: The controller that aggregates and serves attendance data to consumers
- **NotificationService**: The service responsible for sending parent/guardian notifications on scan events
- **RFID_Reader**: A physical RFID card scanning device that POSTs scan events to the API
- **RfidController**: The controller that validates RFID scan requests and delegates to AttendanceService
- **Student**: A school student record containing identity fields and a unique RFID tag UID
- **User**: A staff member or administrator account used to authenticate against the API
- **JWT**: JSON Web Token used to authenticate User requests to protected endpoints
- **API_Key**: A secret key credential that authorizes RFID_Reader devices to POST scan events
- **ScanResult**: The typed response object returned after a successful RFID scan, containing the Student and AttendanceLog records
- **AttendanceStats**: An aggregated object containing presentCount, absentCount, onTimeCount, and lateCount for the current day
- **Late_Threshold**: The daily cutoff time (08:00:00 server local time) after which an IN scan is classified as late

---

## Requirements

### Requirement 1: RFID Scan Processing

**User Story:** As an RFID reader device, I want to submit a card scan event to the API, so that student attendance is automatically recorded with the correct IN or OUT status.

#### Acceptance Criteria

1. WHEN an RFID_Reader sends a scan request with a non-empty `rfid_tag_uid` that matches an existing Student record, THE API SHALL look up that Student and create a new AttendanceLog with a status of either `'IN'` or `'OUT'` determined by toggling the Student's most recent log status for the current day.
2. WHEN an RFID_Reader sends a scan request and the scan is successfully processed, THE API SHALL return HTTP 201 with a JSON body `{ success: true, data: { student, log } }` containing the fully typed ScanResult.
3. WHEN an RFID_Reader sends a scan request with an `rfid_tag_uid` that does not match any Student record, THE API SHALL return HTTP 404 with `{ success: false, error: "Student not found for RFID tag: <uid>" }` and SHALL NOT create any AttendanceLog record.
4. WHEN an RFID_Reader sends a scan request with a missing, empty, or whitespace-only `rfid_tag_uid` field, THE API SHALL return HTTP 400 with `{ success: false, error: "rfid_tag_uid is required" }` and SHALL NOT create any AttendanceLog record.
5. WHEN a new AttendanceLog is created for a Student, THE API SHALL return HTTP 201 with the ScanResult regardless of whether the parent notification succeeds or fails.

---

### Requirement 2: Attendance Status Determination

**User Story:** As the system, I want to determine whether each RFID scan represents an IN or OUT event, so that the attendance log accurately reflects student entry and exit.

#### Acceptance Criteria

1. WHEN a Student has no AttendanceLog records for the current day, THE AttendanceService SHALL assign the status `'IN'` to the new AttendanceLog.
2. WHEN the most recent AttendanceLog for a Student on the current day has status `'IN'`, THE AttendanceService SHALL assign the status `'OUT'` to the new AttendanceLog.
3. WHEN the most recent AttendanceLog for a Student on the current day has status `'OUT'`, THE AttendanceService SHALL assign the status `'IN'` to the new AttendanceLog, where "most recent" is determined by the latest `scan_time` value and ties are broken by insertion order (highest `id`).
4. WHEN determining the current scan status, THE AttendanceService SHALL only consider AttendanceLog records whose `scan_time` falls on the current calendar date in the system's configured timezone (from 00:00:00 to 23:59:59 inclusive).
5. WHEN determining the current scan status, THE AttendanceService SHALL NOT consider AttendanceLog records whose `scan_time` falls on any date prior to the current calendar date in the system's configured timezone.
6. THE AttendanceService SHALL produce a status value that is exactly `'IN'` or `'OUT'` — no other value is permitted.

---

### Requirement 3: Parent/Guardian Notification

**User Story:** As a parent or guardian, I want to be notified when my child scans in or out of school, so that I can monitor their attendance in real time.

#### Acceptance Criteria

1. WHEN a new AttendanceLog is created, THE NotificationService SHALL format a notification message that includes the student's name, scan status (`'IN'` or `'OUT'`), scan time formatted as `HH:MM AM/PM`, `parent_name`, `parent_email`, and `parent_phone`.
2. IF the environment variable `NODE_ENV` equals `"development"`, THEN THE NotificationService SHALL output the formatted notification message to `console.log`.
3. IF NotificationService.sendParentNotification encounters an internal error, THEN THE NotificationService SHALL catch the error and output it to `console.error` without re-throwing it.
4. WHEN a valid RFID scan is processed successfully and an AttendanceLog is created, THE API SHALL return the HTTP 201 scan response before the notification completes.

---

### Requirement 4: Dashboard — Today's Attendance

**User Story:** As a staff member or administrator, I want to view today's attendance logs, so that I can monitor which students have arrived or departed.

#### Acceptance Criteria

1. WHEN an authenticated User requests today's attendance, THE system SHALL return all attendance events for the current day, each including the student's name, grade level, section, scan status, and scan time, ordered by scan time descending; if the request is unauthenticated, THE system SHALL return HTTP 401.
2. WHEN querying today's attendance, THE system SHALL only include AttendanceLog records where `scan_time` falls within the current calendar date in the server's configured timezone (00:00:00 to 23:59:59 inclusive).
3. WHEN no AttendanceLog records exist for the current day, THE system SHALL return a success response with an empty list and SHALL NOT return an error.
4. IF the database is unavailable when an authenticated User requests today's attendance, THEN THE system SHALL return HTTP 503 with `{ success: false, error: "Service temporarily unavailable" }`.

---

### Requirement 5: Dashboard — Attendance Statistics

**User Story:** As an administrator, I want to view daily attendance statistics, so that I can quickly assess overall student attendance health.

#### Acceptance Criteria

1. WHEN an authenticated User requests daily attendance statistics, THE DashboardController SHALL return HTTP 200 with `{ success: true, data: AttendanceStats }` containing `presentCount`, `absentCount`, `onTimeCount`, and `lateCount`; IF the database is unavailable, THEN THE API SHALL return HTTP 503 with `{ success: false, error: "Service temporarily unavailable" }`.
2. WHEN computing daily stats, THE AttendanceService SHALL classify a Student as present if the Student has at least one AttendanceLog with status `'IN'` whose `scan_time` falls within the current calendar day (00:00:00 to 23:59:59 server local time).
3. WHEN computing daily stats, THE AttendanceService SHALL classify a Student as absent if the Student has no AttendanceLog records whose `scan_time` falls within the current calendar day (00:00:00 to 23:59:59 server local time).
4. WHEN computing daily stats, THE AttendanceService SHALL classify a present Student as on-time if the Student's earliest `'IN'` log of the current day has a `scan_time` at or before 08:00:00 server local time (the Late_Threshold).
5. WHEN computing daily stats, THE AttendanceService SHALL classify a present Student as late if the Student's earliest `'IN'` log of the current day has a `scan_time` strictly after 08:00:00 server local time (the Late_Threshold).
6. WHEN daily stats are computed, THE AttendanceService SHALL ensure `presentCount + absentCount` equals the total number of Student records in the database and `onTimeCount + lateCount` equals `presentCount`.

---

### Requirement 6: Authentication and Authorization

**User Story:** As a system administrator, I want all sensitive API endpoints to be protected by authentication, so that only authorized users and devices can access attendance data.

#### Acceptance Criteria

1. WHEN a request is made to any dashboard endpoint without a valid, non-expired JWT in the `Authorization: Bearer <token>` header, THE API SHALL return HTTP 401 with `{ success: false, error: "Unauthorized" }` and SHALL NOT return any attendance data or create any side effects.
2. WHEN a request is made to the RFID scan endpoint without a valid API_Key in the `X-API-Key` request header, THE API SHALL return HTTP 401 with `{ success: false, error: "Unauthorized" }` and SHALL NOT create any AttendanceLog record or trigger any notification.
3. WHEN a JWT is validated successfully, THE Auth Middleware SHALL attach the decoded User identity (id, email, role) to the request object for use by downstream controllers.
4. THE API SHALL never include `User.password_hash` in any API response body.

---

### Requirement 7: Student Data Management

**User Story:** As an administrator, I want each student to have a unique RFID tag assigned, so that scans are unambiguously attributed to the correct student.

#### Acceptance Criteria

1. WHEN a request is made to create or update a Student with an `rfid_tag_uid` that already exists in the database, THE API SHALL return HTTP 409 with `{ success: false, error: "RFID tag UID already in use" }` and SHALL NOT persist any partial Student record.
2. WHEN a request is made to create a Student, THE API SHALL require non-empty values for `name`, `grade_level`, `section`, `parent_name`, `parent_email`, and `parent_phone`, where each field must be a non-empty string with at most 255 characters.
3. WHEN a request is made to create or update a Student where `parent_email` does not conform to the format `local@domain.tld` (RFC 5322 local part, a single `@`, and a domain with at least one `.`), THE API SHALL return HTTP 400 with `{ success: false, error: "Invalid parent_email format" }` and SHALL NOT persist the record.
4. WHEN a Student creation or update request fails validation (missing required field, duplicate RFID UID, or invalid email format), THE API SHALL return the appropriate 4xx error response and SHALL NOT persist any partial Student record.

---

### Requirement 8: Error Handling and Resilience

**User Story:** As a system operator, I want the API to handle errors gracefully, so that partial failures do not cause unhandled crashes or expose internal details to clients.

#### Acceptance Criteria

1. IF the API cannot reach the MySQL database, THEN THE API SHALL return HTTP 503 with `{ success: false, error: "Service temporarily unavailable" }` and SHALL NOT expose database connection details, credentials, or stack traces in the response body.
2. WHEN an unhandled error occurs during request processing, THE API SHALL log the full error stack trace server-side and return HTTP 500 with `{ success: false, error: "Internal server error" }` to the client.
3. IF NotificationService fails internally after an AttendanceLog has been committed, THEN THE API SHALL return HTTP 201 with the ScanResult confirming the committed log.
4. WHEN the database connection is unavailable, THE API SHALL attempt to reconnect up to 3 times before returning HTTP 503, without exposing retry state or connection details to the client.

---

### Requirement 9: Data Persistence and Integrity

**User Story:** As a system operator, I want all attendance data to be reliably persisted with correct relational integrity, so that historical records are accurate and auditable.

#### Acceptance Criteria

1. THE AttendanceLog model SHALL enforce a NOT NULL foreign key constraint on `student_id` referencing the `Students` table with ON DELETE RESTRICT, preventing orphaned log records and blocking deletion of a Student who has AttendanceLog entries.
2. THE AttendanceLog model SHALL restrict the `status` field to the values `'IN'` and `'OUT'` using a database-level ENUM constraint, rejecting any other value at the persistence layer.
3. WHEN an AttendanceLog record is created without an explicit `scan_time`, THE API SHALL default `scan_time` to the current server timestamp at the moment of record creation.
4. THE User model SHALL enforce that `email` is unique across all User records, returning HTTP 409 with `{ success: false, error: "Email already in use" }` if a duplicate email is submitted.
5. THE User model SHALL restrict the `role` field to the values `'admin'` and `'staff'` using a database-level ENUM constraint, returning HTTP 400 with `{ success: false, error: "Invalid role value" }` if any other value is submitted.

---

### Requirement 10: API Response Consistency

**User Story:** As a frontend developer or RFID reader firmware developer, I want all API responses to follow a consistent JSON envelope, so that client-side handling is predictable and uniform.

#### Acceptance Criteria

1. WHEN an API request succeeds, THE API SHALL return a JSON response body containing exactly the key `success` set to `true` and the key `data` set to the response payload — the `data` key SHALL always be present and SHALL NOT be omitted or null on success.
2. WHEN an API request fails, THE API SHALL return a JSON response body containing exactly the key `success` set to `false` and the key `error` set to a non-empty descriptive string of at most 255 characters.
3. THE API SHALL set the `Content-Type` response header to `application/json` for all responses, including error responses.
4. THE API SHALL pair every `success: true` response with a 2xx HTTP status code and every `success: false` response with a 4xx or 5xx HTTP status code — a mismatch between the `success` field and the HTTP status class SHALL never occur.

---
