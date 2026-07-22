# Implementation Plan: School Attendance Monitoring System

## Overview

Build a Node.js + Express + TypeScript REST API for school attendance monitoring via RFID card scanning from scratch. The implementation follows the dependency order: project scaffolding → database config → TypeScript types → Sequelize models → service layer → controllers → middleware → routes → app wiring → tests.

---

## Tasks

- [x] 1. Scaffold project structure and configuration files
  - [x] 1.1 Initialize package.json and install all dependencies
    - Create `package.json` with `name`, `version`, `scripts` (`dev`, `build`, `start`, `test`)
    - Install production deps: `express`, `sequelize`, `mysql2`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`, `nodemailer`
    - Install dev deps: `typescript`, `ts-node-dev`, `@types/express`, `@types/node`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/nodemailer`, `jest`, `ts-jest`, `@types/jest`, `fast-check`
    - Use exact/pinned versions per the design dependency table
    - _Requirements: 8.1, 9.1_

  - [x] 1.2 Create tsconfig.json and Jest configuration
    - Create `tsconfig.json` with `target: "ES2020"`, `module: "commonjs"`, `strict: true`, `outDir: "./dist"`, `rootDir: "./src"`, `esModuleInterop: true`, `resolveJsonModule: true`
    - Create `jest.config.ts` (or `jest.config.js`) using `ts-jest` preset, pointing to `src/**/*.test.ts`
    - _Requirements: 10.1, 10.2_

  - [x] 1.3 Create .env file and folder structure
    - Create `.env` with variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `API_KEY`, `NODE_ENV`, `PORT`
    - Create all empty directories under `/src`: `config/`, `models/`, `controllers/`, `routes/`, `services/`, `types/`, `middleware/`
    - Create `.env.example` with the same keys but no secret values
    - _Requirements: 6.1, 6.2, 8.1_

- [x] 2. Implement database configuration
  - [x] 2.1 Create Sequelize database connection (src/config/database.ts)
    - Export a `sequelize` instance configured from `process.env` values
    - Set connection pool: `max: 10`, `min: 2`, `acquire: 30000`, `idle: 10000`
    - Set `dialect: 'mysql'`, `logging: false` in production, `console.log` in development
    - _Requirements: 8.1, 8.4, 9.1_

- [x] 3. Define TypeScript interfaces and type augmentations
  - [x] 3.1 Create shared model interfaces (src/types/models.ts)
    - Define and export: `UserAttributes`, `StudentAttributes`, `AttendanceLogAttributes`, `AttendanceLogWithStudent`, `ScanResult`, `AttendanceStats`, `RfidScanBody`, `ApiResponse<T>`, `ApiErrorResponse`
    - Ensure `AttendanceLogAttributes.status` is typed as `'IN' | 'OUT'`
    - Ensure `UserAttributes.role` is typed as `'admin' | 'staff'`
    - _Requirements: 1.2, 2.6, 5.1, 10.1, 10.2_

  - [x] 3.2 Augment Express Request type (src/types/express.d.ts)
    - Extend `Express.Request` to include `user?: { id: number; email: string; role: string }`
    - _Requirements: 6.3_

- [x] 4. Implement Sequelize models
  - [x] 4.1 Create User model (src/models/User.ts)
    - Define Sequelize model with fields: `id`, `name`, `email` (unique), `password_hash`, `role` (ENUM `'admin'|'staff'`)
    - Add `defaultScope` that excludes `password_hash` from all queries
    - _Requirements: 6.4, 9.4, 9.5_

  - [x] 4.2 Create Student model (src/models/Student.ts)
    - Define Sequelize model with fields: `id`, `rfid_tag_uid` (unique, indexed), `name`, `grade_level`, `section`, `parent_name`, `parent_email`, `parent_phone`
    - Add Sequelize validation for `parent_email` (isEmail), and `len` validators (max 255) on all string fields
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 4.3 Create AttendanceLog model (src/models/AttendanceLog.ts)
    - Define Sequelize model with fields: `id`, `student_id` (FK → Students.id, NOT NULL), `scan_time` (defaultValue: `DataTypes.NOW`), `status` (ENUM `'IN'|'OUT'`)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 4.4 Create model registry and define associations (src/models/index.ts)
    - Import all models and call `sequelize.sync()` (or export for manual sync)
    - Define associations: `Student.hasMany(AttendanceLog, { foreignKey: 'student_id', onDelete: 'RESTRICT' })` and `AttendanceLog.belongsTo(Student, { foreignKey: 'student_id' })`
    - Export all models and sequelize instance
    - _Requirements: 9.1_

- [x] 5. Implement AttendanceService
  - [x] 5.1 Implement determineStatus() (src/services/attendanceService.ts)
    - Implement `determineStatus(lastLog: AttendanceLogAttributes | null): 'IN' | 'OUT'`
    - Returns `'IN'` when `lastLog` is null; returns `'OUT'` when `lastLog.status === 'IN'`; returns `'IN'` when `lastLog.status === 'OUT'`
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ]* 5.2 Write property test for determineStatus() (src/services/attendanceService.test.ts)
    - **Property 2: Status Alternation** — for any valid `lastLog` value (`null`, `{status:'IN'}`, `{status:'OUT'}`), `determineStatus` always returns exactly `'IN'` or `'OUT'`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.6**
    - Use `fast-check` `fc.constantFrom` and `fc.record` to generate all valid inputs

  - [x] 5.3 Implement processRfidScan() (src/services/attendanceService.ts)
    - Implement `processRfidScan(rfid_tag_uid: string): Promise<ScanResult>`
    - Look up student with `Student.findOne({ where: { rfid_tag_uid } })`; throw `NotFoundError` (404) if null
    - Query last log for today using `scan_time BETWEEN todayStart AND todayEnd ORDER BY scan_time DESC, id DESC LIMIT 1`
    - Call `determineStatus(lastLog)`, create new `AttendanceLog`, fire-and-forget `sendParentNotification`
    - Return `{ student, log }` as `ScanResult`
    - _Requirements: 1.1, 1.2, 1.5, 2.4, 2.5_

  - [ ]* 5.4 Write property test for processRfidScan() (src/services/attendanceService.test.ts)
    - **Property 1: RFID Scan Creates a Valid Log** — for any non-empty `rfid_tag_uid` matching a student, result has `status` strictly `'IN'|'OUT'` and `student_id` matches the student
    - **Validates: Requirements 1.1, 1.2, 2.6**
    - Use mocked Sequelize models and `fc.string({ minLength: 1 })` for uid generation

  - [ ]* 5.5 Write property test for today boundary isolation (src/services/attendanceService.test.ts)
    - **Property 3: Today Boundary Isolation** — a student with only prior-day logs is treated as having no logs today (next scan is `'IN'`)
    - **Validates: Requirements 2.4, 2.5**
    - Use `fc.date` constrained to past dates to generate prior-day log fixtures

  - [x] 5.6 Implement getTodayLogs() (src/services/attendanceService.ts)
    - Implement `getTodayLogs(): Promise<AttendanceLogWithStudent[]>`
    - Query `AttendanceLog.findAll` with `scan_time BETWEEN todayStart AND todayEnd`, `include: [Student]`, `order: [['scan_time', 'DESC']]`
    - Returns `[]` for no records — never throws for empty results
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.7 Write property test for getTodayLogs() (src/services/attendanceService.test.ts)
    - **Property 6: Today's Attendance Query Isolation** — only logs with `scan_time` in today's range are returned; each record includes the associated Student
    - **Validates: Requirements 4.1, 4.2**
    - Generate mixed-date log fixtures with `fc.date`

  - [x] 5.8 Implement getTodayStats() (src/services/attendanceService.ts)
    - Implement `getTodayStats(): Promise<AttendanceStats>`
    - Fetch all students; fetch first `'IN'` log per student for today; classify present/absent and on-time/late vs `08:00:00`
    - Ensure `presentCount + absentCount === totalStudentCount` and `onTimeCount + lateCount === presentCount`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.9 Write property test for getTodayStats() (src/services/attendanceService.test.ts)
    - **Property 7: Stats Partition Invariant** — `presentCount + absentCount === totalStudentCount` for any DB state
    - **Validates: Requirements 5.2, 5.3, 5.6**
    - **Property 8: On-time / Late Classification** — `onTimeCount + lateCount === presentCount`; on-time iff first IN ≤ 08:00
    - **Validates: Requirements 5.4, 5.5**
    - Use `fc.array` of student fixtures with random first-IN scan times

- [x] 6. Checkpoint — service layer
  - Ensure all tests pass for `determineStatus`, `processRfidScan`, `getTodayLogs`, and `getTodayStats`. Ask the user if questions arise.

- [x] 7. Implement NotificationService
  - [x] 7.1 Implement sendParentNotification() (src/services/notificationService.ts)
    - Implement `sendParentNotification(student: StudentAttributes, log: AttendanceLogAttributes): Promise<void>`
    - Format message including `student.name`, `log.status`, `log.scan_time` (as `HH:MM AM/PM`), `student.parent_name`, `student.parent_email`, `student.parent_phone`
    - In `NODE_ENV === 'development'`, output with `console.log`
    - Wrap all logic in try/catch; catch logs to `console.error` without re-throwing
    - Include commented-out Nodemailer boilerplate for future email integration
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 7.2 Write property test for sendParentNotification() (src/services/notificationService.test.ts)
    - **Property 4: Non-blocking Notification Resilience** — internal errors thrown inside `sendParentNotification` are caught and never re-thrown
    - **Validates: Requirements 3.3, 8.3**
    - **Property 5: Notification Message Completeness** — formatted message includes student name, status, time, and parent contact
    - **Validates: Requirements 3.1**
    - Use `fc.record` to generate arbitrary valid `StudentAttributes` and `AttendanceLogAttributes`

- [x] 8. Implement authentication and authorization middleware
  - [x] 8.1 Implement JWT auth middleware (src/middleware/authMiddleware.ts)
    - Validate `Authorization: Bearer <token>` header; verify JWT with `JWT_SECRET`
    - On valid token: attach `{ id, email, role }` to `req.user`; call `next()`
    - On missing/invalid/expired token: return `401 { success: false, error: "Unauthorized" }`
    - _Requirements: 6.1, 6.3_

  - [x] 8.2 Implement API key middleware (src/middleware/apiKeyMiddleware.ts)
    - Validate `X-API-Key` header against `process.env.API_KEY`
    - On valid key: call `next()`
    - On missing/invalid key: return `401 { success: false, error: "Unauthorized" }` without creating any side-effects
    - _Requirements: 6.2_

  - [x] 8.3 Implement global error handler middleware (src/middleware/errorHandler.ts)
    - Express error handler `(err, req, res, next)` with `@types/express` signature
    - Log full stack trace server-side with `console.error`
    - Map `NotFoundError` → 404, database unavailability errors → 503 (`{ success: false, error: "Service temporarily unavailable" }`), all others → 500 (`{ success: false, error: "Internal server error" }`)
    - Never expose connection details, credentials, or stack traces in the response body
    - _Requirements: 8.1, 8.2, 10.2, 10.3, 10.4_

- [x] 9. Implement controllers
  - [x] 9.1 Implement RfidController (src/controllers/rfidController.ts)
    - Implement `scan(req, res, next): Promise<void>`
    - Validate `rfid_tag_uid`: if missing, empty, or whitespace-only, return `400 { success: false, error: "rfid_tag_uid is required" }`
    - Call `AttendanceService.processRfidScan(rfid_tag_uid)`, return `201 { success: true, data: { student, log } }`
    - Forward unexpected errors to `next(err)` for the global error handler
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.4_

  - [x] 9.2 Implement DashboardController (src/controllers/dashboardController.ts)
    - Implement `getTodayAttendance(req, res, next)`: call `AttendanceService.getTodayLogs()`, return `200 { success: true, data: logs }`
    - Implement `getStats(req, res, next)`: call `AttendanceService.getTodayStats()`, return `200 { success: true, data: stats }`
    - Forward database unavailability errors to `next(err)` which the error handler maps to 503
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 10.1, 10.4_

- [x] 10. Implement routes
  - [x] 10.1 Create RFID route (src/routes/rfid.ts)
    - Define `POST /scan` with `apiKeyMiddleware` → `rfidController.scan`
    - Export as Express `Router`
    - _Requirements: 1.1, 6.2_

  - [x] 10.2 Create dashboard route (src/routes/dashboard.ts)
    - Define `GET /attendance` with `authMiddleware` → `dashboardController.getTodayAttendance`
    - Define `GET /stats` with `authMiddleware` → `dashboardController.getStats`
    - Export as Express `Router`
    - _Requirements: 4.1, 5.1, 6.1_

  - [x] 10.3 Create root router (src/routes/index.ts)
    - Mount `/api/v1/rfid` → rfid router and `/api/v1/dashboard` → dashboard router
    - Export as Express `Router`
    - _Requirements: 10.1, 10.2_

- [x] 11. Wire Express app and server entry point
  - [x] 11.1 Create Express app (src/app.ts)
    - Initialize Express app; apply `cors()`, `express.json()` middleware
    - Mount the root router from `src/routes/index.ts`
    - Register `errorHandler` as the last middleware
    - Set `Content-Type: application/json` for all responses via a global middleware
    - _Requirements: 8.2, 10.3_

  - [x] 11.2 Create server entry point (src/server.ts)
    - Import `app` and `sequelize`
    - Authenticate database connection (retry up to 3 times) then call `app.listen(PORT)`
    - Log startup success or failure; exit process on unrecoverable DB failure
    - _Requirements: 8.4_

- [x] 12. Checkpoint — full wiring
  - Run `npm run build` and confirm TypeScript compiles with zero errors. Ask the user if questions arise.

- [x] 13. Write unit and integration tests
  - [x] 13.1 Write unit tests for determineStatus() (src/services/attendanceService.test.ts)
    - Test `determineStatus(null)` → `'IN'`
    - Test `determineStatus({ status: 'IN' })` → `'OUT'`
    - Test `determineStatus({ status: 'OUT' })` → `'IN'`
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ]* 13.2 Write unit tests for processRfidScan() with mocked models
    - Test unknown `rfid_tag_uid` throws `NotFoundError` and no log is created
    - Test known uid creates log with correct `student_id` and valid `status`
    - Test notification is called fire-and-forget (does not delay response)
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ]* 13.3 Write unit tests for sendParentNotification()
    - Test formatted log output contains student name, status, formatted time, parent fields
    - Test internal error is caught and does not propagate
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 13.4 Write integration tests for RFID scan endpoint
    - Seed student → `POST /api/v1/rfid/scan` → assert 201 response shape, log in DB, status toggles on second scan
    - `POST` without valid API key → assert 401
    - `POST` with unknown uid → assert 404
    - `POST` with missing `rfid_tag_uid` → assert 400
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.2_

  - [ ]* 13.5 Write integration tests for dashboard endpoints
    - `GET /api/v1/dashboard/attendance` without JWT → assert 401
    - `GET /api/v1/dashboard/attendance` with valid JWT and seeded logs → assert 200 and correct log shape
    - `GET /api/v1/dashboard/stats` with valid JWT → assert 200, `presentCount + absentCount === totalStudentCount`
    - _Requirements: 4.1, 4.3, 5.1, 5.6, 6.1_

- [x] 14. Final checkpoint — all tests pass
  - Run `npm test` and confirm all unit and property-based tests pass. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Property-based tests use `fast-check` and each maps to a named property in `design.md`
- Each task references specific requirements for traceability
- Checkpoints at tasks 6, 12, and 14 ensure incremental build validation
- The `.env` file must be populated with real DB credentials before running integration tests
- `src/models/index.ts` is the single import point for all Sequelize models throughout the codebase

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["4.4"] },
    { "id": 4, "tasks": ["5.1", "5.3", "5.6", "5.8"] },
    { "id": 5, "tasks": ["5.2", "5.4", "5.5", "5.7", "5.9", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["9.1", "9.2"] },
    { "id": 8, "tasks": ["10.1", "10.2"] },
    { "id": 9, "tasks": ["10.3"] },
    { "id": 10, "tasks": ["11.1"] },
    { "id": 11, "tasks": ["11.2"] },
    { "id": 12, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 13, "tasks": ["13.4", "13.5"] }
  ]
}
```
