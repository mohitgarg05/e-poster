"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { importAdminUsers } from "@/services/admin.service";
import { AdminShell } from "../../_components/admin-shell";
import { useAdminToken } from "../../_components/use-admin-token";

type UserImportForm = {
  csvText: string;
};

export default function ImportUsersPage() {
  const token = useAdminToken();
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<UserImportForm>({
    defaultValues: { csvText: "" },
  });

  async function importUsers(values: UserImportForm) {
    if (!token || !values.csvText.trim()) return;
    setError("");
    try {
      await importAdminUsers(token, values.csvText);
      router.push("/admin/users");
    } catch (err) {
      setError(toMessage(err, "Import failed"));
    }
  }

  return (
    <AdminShell activeTab="users" title="Import Users">
      <div className="mb-4">
        <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to users
        </Link>
      </div>
      <form onSubmit={form.handleSubmit(importUsers)} className="panel-card max-w-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">CSV Import</h2>
        <p className="mt-1 text-xs text-slate-500">Required columns: employeeEmail,employeeCode</p>
        <textarea
          {...form.register("csvText", { required: true })}
          placeholder={"employeeEmail,employeeCode\nemployee1@example.com,1234"}
          className="soft-input mt-3 h-48 font-mono text-xs"
        />
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="primary-btn mt-3 px-4 py-2.5 text-sm">
          Import Users
        </button>
      </form>
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
