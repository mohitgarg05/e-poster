"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { EMPLOYEE_TOKEN_KEY, setStoredToken } from "@/lib/client-auth";
import { employeeLogin } from "@/services/employee.service";

type EmployeeLoginForm = {
  employeeEmail: string;
  employeeCode: string;
};

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<EmployeeLoginForm>();

  async function onSubmit(values: EmployeeLoginForm) {
    setError("");
    setLoading(true);
    try {
      const data = await employeeLogin(values.employeeEmail, values.employeeCode);
      setStoredToken(EMPLOYEE_TOKEN_KEY, data.token);
      router.push("/employee");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="panel-card p-7">
          <p className="text-xs font-semibold tracking-wide text-orange-600">EMPLOYEE ACCESS</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your employee email and employee code.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
              <input
                type="email"
                required
                {...register("employeeEmail", { required: true })}
                className="soft-input"
                placeholder="employee@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Code</label>
              <input
                type="password"
                required
                {...register("employeeCode", { required: true })}
                className="soft-input"
                placeholder="Employee code"
              />
            </div>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={loading} className="primary-btn w-full px-4 py-2.5 text-sm disabled:opacity-60">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
