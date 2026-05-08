"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getAdminUsers, type AdminUser } from "@/services/admin.service";
import { AdminShell } from "../_components/admin-shell";
import { useAdminToken } from "../_components/use-admin-token";

export default function AdminUsersPage() {
  const token = useAdminToken();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    void loadUsers(token);
  }, [token]);

  async function loadUsers(currentToken: string) {
    try {
      const data = await getAdminUsers(currentToken);
      setUsers(data.users ?? []);
    } catch (err) {
      setError(toMessage(err, "Failed loading users"));
    }
  }

  return (
    <AdminShell activeTab="users" title="Users">
      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="panel-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Employee Code</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{user.employeeEmail}</td>
                <td className="px-3 py-2">{user.employeeCode}</td>
                <td className="px-3 py-2">
                  <span
                    title={user.isActive ? "Active" : "Inactive"}
                    aria-label={user.isActive ? "Active user" : "Inactive user"}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                      user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "✓" : "✕"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit
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
