"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { getPosterCreatedAudit, type PosterCreatedAudit } from "@/services/admin.service";
import { AdminShell } from "../_components/admin-shell";
import { useAdminToken } from "../_components/use-admin-token";

export default function AuditPage() {
  const token = useAdminToken();
  const [records, setRecords] = useState<PosterCreatedAudit[]>([]);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");

  const employeePosterCounts = useMemo(() => {
    const counts = new Map<string, { email: string; total: number }>();

    for (const record of records) {
      const email = record.employeeEmail?.trim();
      if (!email) continue;

      const key = email.toLowerCase();
      const current = counts.get(key);
      if (current) {
        current.total += 1;
      } else {
        counts.set(key, { email, total: 1 });
      }
    }

    return Array.from(counts.values()).sort((a, b) => a.email.localeCompare(b.email));
  }, [records]);

  useEffect(() => {
    if (!token) return;
    void loadRecords(token);
  }, [token]);

  async function loadRecords(currentToken: string) {
    try {
      const data = await getPosterCreatedAudit(currentToken);
      setRecords(data.records ?? []);
    } catch (err) {
      setError(toMessage(err, "Failed loading audit logs"));
    }
  }

  function exportEmployeePosterCounts() {
    setExportError("");

    if (employeePosterCounts.length === 0) {
      setExportError("No records available to export.");
      return;
    }

    const csvLines = [
      "Employee Email,Number of Posters",
      ...employeePosterCounts.map((item) => `${escapeCsvCell(item.email)},${item.total}`),
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee-poster-counts.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell activeTab="audit" title="Created Poster Logs">
      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {exportError ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</p> : null}
      <div className="mb-4">
        <button
          type="button"
          onClick={exportEmployeePosterCounts}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Export Employee Counts
        </button>
      </div>
      <section className="panel-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Doctor Name</th>
              <th className="px-3 py-2 text-left">Credentials</th>
              <th className="px-3 py-2 text-left">Hospital</th>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-left">Created At</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{item.employeeEmail}</td>
                <td className="px-3 py-2">{item.doctorName}</td>
                <td className="px-3 py-2">{item.doctorCredentials}</td>
                <td className="px-3 py-2">{item.doctorHospital}</td>
                <td className="px-3 py-2">{item.doctorCity}</td>
                <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/audit/${item._id}`}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}

function toMessage(errorValue: unknown, fallback: string) {
  if (errorValue instanceof AxiosError) {
    const message = (errorValue.response?.data as { message?: string })?.message;
    return message ?? fallback;
  }
  return errorValue instanceof Error ? errorValue.message : fallback;
}

function escapeCsvCell(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
