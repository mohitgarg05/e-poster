import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import { PosterModel } from "@/models/Poster";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, "employee");
    await connectToDatabase();
    const postersRaw = await PosterModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const posters = postersRaw.map((poster) => ({
      ...poster,
      _id: String(poster._id),
    }));
    return NextResponse.json({ posters });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
