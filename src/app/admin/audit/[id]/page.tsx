"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { getAdminPosters, getPosterCreatedAudit, type PosterCreatedAudit } from "@/services/admin.service";
import { AdminShell } from "../../_components/admin-shell";
import { useAdminToken } from "../../_components/use-admin-token";

export default function AuditDetailPage() {
  const token = useAdminToken();
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<PosterCreatedAudit | null>(null);
  const [posterName, setPosterName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !params.id) return;
    void loadRecord(token, params.id);
  }, [token, params.id]);

  async function loadRecord(currentToken: string, recordId: string) {
    setError("");
    try {
      const [auditData, posterData] = await Promise.all([
        getPosterCreatedAudit(currentToken),
        getAdminPosters(currentToken),
      ]);
      const data = auditData;
      const currentRecord = data.records.find((item) => item._id === recordId) ?? null;
      setRecord(currentRecord);
      if (!currentRecord) {
        setError("Audit record not found");
        setPosterName("");
        return;
      }
      const matchingPoster = posterData.posters.find((item) => item._id === currentRecord.posterId);
      setPosterName(matchingPoster?.name ?? "Unknown template");
    } catch (err) {
      setError(toMessage(err, "Failed loading audit record"));
    }
  }

  async function downloadPoster(url: string, recordId: string) {
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download poster");
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `generated-poster-${recordId}.png`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(toMessage(err, "Failed downloading poster"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AdminShell activeTab="audit" title="Poster Log Detail">
      <div className="mb-4">
        <Link href="/admin/audit" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to logs
        </Link>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="panel-card space-y-5 p-5">
        {!record ? (
          <p className="text-sm text-slate-600">Loading record...</p>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Poster Details</h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-700">Employee:</span> {record.employeeEmail}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Poster ID:</span> {record.posterId}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Poster Name:</span> {posterName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Doctor:</span> {record.doctorName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Credentials:</span> {record.doctorCredentials}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Hospital:</span> {record.doctorHospital}
              </p>
              <p>
                <span className="font-semibold text-slate-700">City:</span> {record.doctorCity}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold text-slate-700">Created At:</span> {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Doctor Image</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.doctorImageUrl}
                  alt={`Doctor ${record.doctorName}`}
                  className="h-64 w-full rounded-lg border border-slate-200 object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Generated Poster</h3>
                {record.finalPosterUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={record.finalPosterUrl}
                      alt={`Generated poster for ${record.doctorName}`}
                      className="h-64 w-full rounded-lg border border-slate-200 object-contain"
                    />
                    <div className="flex gap-2">
                      <a
                        href={record.finalPosterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => void downloadPoster(record.finalPosterUrl!, record._id)}
                        disabled={downloading}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        {downloading ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
                    Generated poster image is not available for this record.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
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
