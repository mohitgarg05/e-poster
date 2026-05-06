import { Poster } from "@/types/poster";
import { authHeader, http } from "./http";

type GeneratePayload = {
  posterId: string;
  doctorName: string;
  doctorCredentials: string;
  doctorHospital: string;
  doctorCity: string;
  doctorImageBase64: string;
  finalPosterBase64?: string;
};

export async function employeeLogin(employeeEmail: string, employeeCode: string) {
  const response = await http.post<{ token: string }>("/employee/login", {
    employeeEmail,
    employeeCode,
  });
  return response.data;
}

export async function getEmployeePosters(token: string) {
  const response = await http.get<{ posters: Poster[] }>("/posters", {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createGeneratedPoster(token: string, payload: GeneratePayload) {
  const response = await http.post("/generate", payload, {
    headers: authHeader(token),
  });
  return response.data;
}
