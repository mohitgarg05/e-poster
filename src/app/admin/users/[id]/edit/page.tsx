"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { getAdminUsers, toggleAdminUser, type AdminUser } from "@/services/admin.service";
import { AdminShell } from "../../../_components/admin-shell";
import { useAdminToken } from "../../../_components/use-admin-token";

export default function EditUserPage() {
  const token = useAdminToken();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !params.id) return;
    void loadUser(token, params.id);
  }, [token, params.id]);

  async function loadUser(currentToken: string, userId: string) {
    try {
      const data = await getAdminUsers(currentToken);
      const currentUser = data.users.find((item) => item._id === userId) ?? null;
      setUser(currentUser);
    } catch (err) {
      setError(toMessage(err, "Failed loading user"));
    }
  }

  async function toggleActive() {
    if (!token || !user) return;
    setError("");
    try {
      await toggleAdminUser(token, user._id, !user.isActive);
      router.push("/admin/users");
    } catch (err) {
      setError(toMessage(err, "Failed updating user status"));
    }
  }

  return (
    <AdminShell activeTab="users" title="Edit User">
      <div className="mb-4">
        <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to users
        </Link>
      </div>

      <section className="panel-card max-w-2xl space-y-4 p-6">
        {!user ? (
          <p className="text-sm text-slate-600">User not found.</p>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900">{user.employeeEmail}</h2>
            <p className="text-sm text-slate-600">Status: {user.isActive ? "Active" : "Inactive"}</p>
            <button onClick={toggleActive} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white">
              {user.isActive ? "Deactivate User" : "Activate User"}
            </button>
          </>
        )}
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
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
