import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { UserModel } from "@/models/User";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const body = await request.json();
    const { id } = await context.params;
    const user = await UserModel.findByIdAndUpdate(
      id,
      { isActive: Boolean(body.isActive) },
      { new: true },
    ).lean();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "Failed to update user" }, { status: 400 });
  }
}
