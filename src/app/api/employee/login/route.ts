import { NextResponse } from "next/server";
import { z } from "zod";
import { signAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

const loginSchema = z.object({
  employeeEmail: z.string().email(),
  employeeCode: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeEmail, employeeCode } = loginSchema.parse(body);

    await connectToDatabase();
    const user = await UserModel.findOne({ employeeEmail: employeeEmail.toLowerCase() });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const ok = employeeCode === user.employeeCode;
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAuthToken({
      sub: String(user._id),
      role: "employee",
      email: user.employeeEmail,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
