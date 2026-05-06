import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { signAuthToken } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const expectedUsername = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    console.log(expectedUsername, passwordHash , password);
    if (!expectedUsername || !passwordHash) {
      return NextResponse.json({ message: "Admin credentials not configured" }, { status: 500 });
    }

    const ok = username === expectedUsername && (await bcrypt.compare(password, passwordHash));
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAuthToken({ sub: "admin", role: "admin", email: expectedUsername });
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
