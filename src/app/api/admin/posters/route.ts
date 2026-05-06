import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { PosterModel } from "@/models/Poster";

const createPosterSchema = z.object({
  name: z.string().min(1),
  textColorHex: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  templateImageBase64: z.string().min(1),
  layout: z.object({
    namePosition: z.object({ x: z.number(), y: z.number() }),
    credentialsPosition: z.object({ x: z.number(), y: z.number() }),
    hospitalPosition: z.object({ x: z.number(), y: z.number() }),
    cityPosition: z.object({ x: z.number(), y: z.number() }),
    doctorImagePosition: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    const body = await request.json();
    const payload = createPosterSchema.parse(body);

    const templateImageUrl = await uploadToCloudinary(payload.templateImageBase64, "poster-templates");
    await connectToDatabase();
    const poster = await PosterModel.create({
      name: payload.name,
      templateImageUrl,
      textColorHex: payload.textColorHex,
      isActive: true,
      layout: payload.layout,
    });

    return NextResponse.json({ poster });
  } catch {
    return NextResponse.json({ message: "Failed to create poster" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const postersRaw = await PosterModel.find().sort({ createdAt: -1 }).lean();
    const posters = postersRaw.map((poster) => ({
      ...poster,
      _id: String(poster._id),
    }));
    return NextResponse.json({ posters });
  } catch {
    return NextResponse.json({ message: "Failed to list posters" }, { status: 401 });
  }
}
