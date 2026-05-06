import { NextRequest } from "next/server";
import { TokenRole, verifyAuthToken } from "./auth";

function readAuthToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing auth token");
  }

  return header.replace("Bearer ", "");
}

export async function requireRole(request: NextRequest, role: TokenRole) {
  const token = readAuthToken(request);
  const payload = await verifyAuthToken(token);
  if (payload.role !== role) {
    throw new Error("Forbidden");
  }

  return payload;
}
