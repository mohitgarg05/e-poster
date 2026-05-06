import { SignJWT, jwtVerify } from "jose";

export type TokenRole = "admin" | "employee";

export type TokenPayload = {
  sub: string;
  role: TokenRole;
  email: string;
};

function getJwtKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtKey());
}

export async function verifyAuthToken(token: string) {
  const verified = await jwtVerify(token, getJwtKey());
  return verified.payload as unknown as TokenPayload;
}
