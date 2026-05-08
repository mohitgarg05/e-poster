import { Poster } from "@/types/poster";
import { authHeader, http } from "./http";

export type AdminUser = {
  _id: string;
  employeeEmail: string;
  employeeCode: string;
  isActive: boolean;
  createdAt: string;
};

export type PosterCreatedAudit = {
  _id: string;
  posterId: string;
  employeeEmail: string;
  doctorName: string;
  doctorCredentials: string;
  doctorHospital: string;
  doctorCity: string;
  doctorImageUrl: string;
  finalPosterUrl?: string;
  createdAt: string;
};

type CreatePosterPayload = {
  name: string;
  textColorHex: string;
  templateImageBase64: string;
  layout: Poster["layout"];
};

type UpdatePosterPayload = {
  name?: string;
  textColorHex?: string;
  isActive?: boolean;
  templateImageBase64?: string;
};

export async function adminLogin(username: string, password: string) {
  const response = await http.post<{ token: string }>("/admin/login", { username, password });
  return response.data;
}

export async function getAdminPosters(token: string) {
  const response = await http.get<{ posters: Poster[] }>("/admin/posters", {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createAdminPoster(token: string, payload: CreatePosterPayload) {
  const response = await http.post<{ poster: Poster }>("/admin/posters", payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function deactivateAdminPoster(token: string, posterId: string) {
  await http.delete(`/admin/posters/${posterId}`, {
    headers: authHeader(token),
  });
}

export async function toggleAdminPoster(token: string, posterId: string, isActive: boolean) {
  await http.patch(
    `/admin/posters/${posterId}`,
    { isActive },
    { headers: authHeader(token) },
  );
}

export async function updateAdminPoster(token: string, posterId: string, payload: UpdatePosterPayload) {
  const response = await http.patch<{ poster: Poster }>(`/admin/posters/${posterId}`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function getAdminUsers(token: string) {
  const response = await http.get<{ users: AdminUser[] }>("/admin/users", {
    headers: authHeader(token),
  });
  return response.data;
}

export async function importAdminUsers(token: string, csvText: string) {
  const response = await http.post<{ imported: number }>(
    "/admin/users/import",
    { csvText },
    { headers: authHeader(token) },
  );
  return response.data;
}

export async function toggleAdminUser(token: string, userId: string, isActive: boolean) {
  await http.patch(
    `/admin/users/${userId}`,
    { isActive },
    { headers: authHeader(token) },
  );
}

export async function getPosterCreatedAudit(token: string) {
  const response = await http.get<{ records: PosterCreatedAudit[] }>("/admin/poster-created", {
    headers: authHeader(token),
  });
  return response.data;
}
