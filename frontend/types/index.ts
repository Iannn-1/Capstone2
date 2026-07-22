export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface Student {
  id: string;
  rfid_tag_uid: string;
  name: string;
  grade_level: string;
  section: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'IN' | 'OUT';

export interface AttendanceLog {
  id: string;
  student_id: string;
  status: AttendanceStatus;
  scan_time: string;
  createdAt?: string;
}

export interface AttendanceLogWithStudent extends AttendanceLog {
  Student: {
    name: string;
    grade_level: string;
    section: string;
  };
}

export interface AttendanceStats {
  presentCount: number;
  absentCount: number;
  onTimeCount: number;
  lateCount: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponseType<T> = ApiResponse<T> | ApiErrorResponse;

// Login response type
export interface LoginResponse {
  token: string;
  user: User;
}

// Student form input type
export interface StudentFormInput {
  rfid_tag_uid: string;
  name: string;
  grade_level: string;
  section: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
}

// Register form input type
export interface RegisterFormInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
}

// Login form input type
export interface LoginFormInput {
  email: string;
  password: string;
}
