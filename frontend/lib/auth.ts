import { User } from '@/types';

const TOKEN_KEY = 'rfid_attendance_token';
const USER_KEY = 'rfid_attendance_user';

export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const saveUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  return !!token && !!user;
};

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};
