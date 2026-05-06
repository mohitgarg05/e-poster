import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
