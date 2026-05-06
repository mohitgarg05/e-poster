"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getPosterCreatedAudit, type PosterCreatedAudit } from "@/services/admin.service";
import { AdminShell } from "../_components/admin-shell";
import { useAdminToken } from "../_components/use-admin-token";

export default function AuditPage() {
  const token = useAdminToken();
  const [records, setRecords] = useState<PosterCreatedAudit[]>([]);
  const [error, setError] = useState("");

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

  return (
    <AdminShell activeTab="audit" title="Created Poster Logs">
      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
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
