import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/db";
import { PosterModel } from "@/models/Poster";
import { uploadToCloudinary } from "@/lib/cloudinary";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  textColorHex: z.string().regex(/^#[a-fA-F0-9]{6}$/).optional(),
  isActive: z.boolean().optional(),
  templateImageBase64: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const body = await request.json();
    const payload = patchSchema.parse(body);
    const { id } = await context.params;
    const updatePayload: {
      name?: string;
      textColorHex?: string;
      isActive?: boolean;
      templateImageUrl?: string;
    } = {
      name: payload.name,
      textColorHex: payload.textColorHex,
      isActive: payload.isActive,
    };

    if (payload.templateImageBase64) {
      updatePayload.templateImageUrl = await uploadToCloudinary(payload.templateImageBase64, "poster-templates");
    }

    const poster = await PosterModel.findByIdAndUpdate(id, updatePayload, { new: true }).lean();
    return NextResponse.json({ poster });
  } catch {
    return NextResponse.json({ message: "Failed to update poster" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(request, "admin");
    await connectToDatabase();
    const { id } = await context.params;
    await PosterModel.findByIdAndUpdate(id, { isActive: false });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to deactivate poster" }, { status: 400 });
  }
}
