import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { UserModel } from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const usersRaw = await UserModel.find().sort({ createdAt: -1 }).lean();
    const users = usersRaw.map((user) => ({
      ...user,
      _id: String(user._id),
    }));
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
