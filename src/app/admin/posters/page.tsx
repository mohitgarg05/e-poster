"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { AdminShell } from "../_components/admin-shell";
import { useAdminToken } from "../_components/use-admin-token";
import { deactivateAdminPoster, getAdminPosters } from "@/services/admin.service";
import { Poster } from "@/types/poster";

export default function AdminPostersPage() {
  const token = useAdminToken();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    void loadPosters(token);
  }, [token]);

  async function loadPosters(currentToken: string) {
    try {
      const data = await getAdminPosters(currentToken);
      setPosters(data.posters ?? []);
    } catch (err) {
      setError(toMessage(err, "Failed loading posters"));
    }
  }

  async function deactivatePoster(posterId: string) {
    if (!token) return;
    setError("");
    try {
      await deactivateAdminPoster(token, posterId);
      await loadPosters(token);
    } catch (err) {
      setError(toMessage(err, "Failed deactivating poster"));
    }
  }

  return (
    <AdminShell activeTab="posters" title="Poster Templates">
      <div className="mb-4 flex items-center justify-end">
        <Link href="/admin/posters/new" className="primary-btn px-4 py-2 text-sm">
          Create Poster
        </Link>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="panel-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Color</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {posters.map((poster) => (
              <tr key={poster._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{poster.name}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-5 w-5 rounded-full border border-slate-300"
                      style={{ backgroundColor: poster.textColorHex }}
                      aria-label={`Color swatch ${poster.textColorHex}`}
                    />
                    <span>{poster.textColorHex}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      poster.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span aria-hidden>{poster.isActive ? "✓" : "✗"}</span>
                    <span>{poster.isActive ? "True" : "False"}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/posters/${poster._id}/edit`}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage
                  </Link>
                  {poster.isActive ? (
                    <button
                      onClick={() => deactivatePoster(poster._id)}
                      className="ml-2 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                    >
                      Deactivate
                    </button>
                  ) : null}
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
