"use client";

export const ADMIN_TOKEN_KEY = "adminToken";
export const EMPLOYEE_TOKEN_KEY = "employeeToken";

export function getStoredToken(key: string) {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(key) ?? "";
}

export function setStoredToken(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function removeStoredToken(key: string) {
  localStorage.removeItem(key);
}
