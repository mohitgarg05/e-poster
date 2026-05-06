"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { ADMIN_TOKEN_KEY, getStoredToken, setStoredToken } from "@/lib/client-auth";
import { adminLogin } from "@/services/admin.service";

type AdminLoginForm = {
  username: string;
  password: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(() => getStoredToken(ADMIN_TOKEN_KEY));
  const [error, setError] = useState("");
  const loginForm = useForm<AdminLoginForm>({
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (token) {
      router.replace("/admin/posters");
    }
  }, [token, router]);

  function toMessage(errorValue: unknown, fallback: string) {
    if (errorValue instanceof AxiosError) {
      const message = (errorValue.response?.data as { message?: string })?.message;
      return message ?? fallback;
    }
    return errorValue instanceof Error ? errorValue.message : fallback;
  }

  async function handleAdminLogin(values: AdminLoginForm) {
    setError("");
    try {
      const data = await adminLogin(values.username, values.password);
      setStoredToken(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      router.replace("/admin/posters");
    } catch (err) {
      setError(toMessage(err, "Login failed"));
    }
  }

  return (
    <main className="app-shell">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="panel-card p-7">
          <p className="text-xs font-semibold tracking-wide text-orange-600">ADMIN ACCESS</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-600">Manage posters, users, and creation logs from one place.</p>
          <form onSubmit={loginForm.handleSubmit(handleAdminLogin)} className="mt-6 space-y-4">
            <input
              required
              {...loginForm.register("username", { required: true })}
              placeholder="Admin username"
              className="soft-input"
            />
            <input
              type="password"
              required
              {...loginForm.register("password", { required: true })}
              placeholder="Password"
              className="soft-input"
            />
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button className="primary-btn w-full px-4 py-2.5 text-sm">Login</button>
          </form>
        </div>
      </section>
    </main>
  );
}
