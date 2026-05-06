import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { PosterCreatedModel } from "@/models/PosterCreated";

const generateSchema = z.object({
  posterId: z.string().min(1),
  doctorName: z.string().min(1),
  doctorCredentials: z.string().min(1),
  doctorHospital: z.string().min(1),
  doctorCity: z.string().min(1),
  doctorImageBase64: z.string().min(1),
  finalPosterBase64: z.string().optional(),
});

function normalizeDoctorName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^dr\.?\s*/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?\s*/i, "Dr. ");
  }
  return `Dr. ${trimmed}`;
}

export async function POST(request: NextRequest) {
  try {
    const employee = await requireRole(request, "employee");
    const body = await request.json();
    const payload = generateSchema.parse(body);
    const normalizedDoctorName = normalizeDoctorName(payload.doctorName);
    if (!normalizedDoctorName) {
      return NextResponse.json({ message: "Doctor name is required" }, { status: 400 });
    }

    const doctorImageUrl = await uploadToCloudinary(payload.doctorImageBase64, "doctor-images");
    const finalPosterUrl = payload.finalPosterBase64
      ? await uploadToCloudinary(payload.finalPosterBase64, "generated-posters")
      : undefined;

    await connectToDatabase();
    const record = await PosterCreatedModel.create({
      posterId: payload.posterId,
      employeeId: employee.sub,
      employeeEmail: employee.email,
      doctorName: normalizedDoctorName,
      doctorCredentials: payload.doctorCredentials,
      doctorHospital: payload.doctorHospital,
      doctorCity: payload.doctorCity,
      doctorImageUrl,
      finalPosterUrl,
    });

    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ message: "Failed to save generated poster" }, { status: 400 });
  }
}
