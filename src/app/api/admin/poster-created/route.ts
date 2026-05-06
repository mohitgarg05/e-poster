import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import { PosterCreatedModel } from "@/models/PosterCreated";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const recordsRaw = await PosterCreatedModel.find().sort({ createdAt: -1 }).lean();
    const records = recordsRaw.map((record) => ({
      ...record,
      _id: String(record._id),
    }));
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ message: "Failed to fetch audit records" }, { status: 401 });
  }
}
