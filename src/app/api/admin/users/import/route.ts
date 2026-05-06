import { parse } from "csv-parse/sync";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { UserModel } from "@/models/User";

type CsvRow = {
  employeeEmail: string;
  employeeCode: string;
};

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, "admin");
    const body = await request.json();
    const csvText = String(body.csvText ?? "");
    if (!csvText.trim()) {
      return NextResponse.json({ message: "CSV is required" }, { status: 400 });
    }

    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    await connectToDatabase();
    let imported = 0;

    for (const row of rows) {
      if (!row.employeeEmail || !row.employeeCode) {
        continue;
      }

      const employeeEmail = row.employeeEmail.toLowerCase();
      const employeeCode = row.employeeCode;

      await UserModel.findOneAndUpdate(
        { employeeEmail },
        {
          employeeEmail,
          employeeCode,
          isActive: true,
        },
        { upsert: true, new: true },
      );
      imported += 1;
    }

    return NextResponse.json({ imported });
  } catch {
    return NextResponse.json({ message: "Failed to import users" }, { status: 400 });
  }
}
