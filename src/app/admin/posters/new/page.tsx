"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { createAdminPoster } from "@/services/admin.service";
import { readFileAsDataUrl } from "@/lib/image-utils";
import { AdminShell } from "../../_components/admin-shell";
import { useAdminToken } from "../../_components/use-admin-token";

const defaultLayout = {
  namePosition: { x: 390, y: 210 },
  credentialsPosition: { x: 390, y: 275 },
  hospitalPosition: { x: 390, y: 340 },
  cityPosition: { x: 390, y: 405 },
  doctorImagePosition: { x: 80, y: 115, width: 280, height: 280 },
};

type PosterCreateForm = {
  posterName: string;
  textColorHex: string;
};

export default function NewPosterPage() {
  const token = useAdminToken();
  const router = useRouter();
  const [templateImageBase64, setTemplateImageBase64] = useState("");
  const [templateImageName, setTemplateImageName] = useState("");
  const [error, setError] = useState("");
  const form = useForm<PosterCreateForm>({
    defaultValues: { posterName: "", textColorHex: "#f97316" },
  });

  async function handleTemplateUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setTemplateImageBase64(dataUrl);
    setTemplateImageName(file.name);
  }

  async function createPoster(values: PosterCreateForm) {
    if (!token) return;
    setError("");
    try {
      await createAdminPoster(token, {
        name: values.posterName,
        textColorHex: values.textColorHex,
        templateImageBase64,
        layout: defaultLayout,
      });
      router.push("/admin/posters");
    } catch (err) {
      setError(toMessage(err, "Failed creating poster"));
    }
  }

  return (
    <AdminShell activeTab="posters" title="Create Poster">
      <div className="mb-4">
        <Link href="/admin/posters" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to posters
        </Link>
      </div>
      <form onSubmit={form.handleSubmit(createPoster)} className="panel-card max-w-3xl space-y-5 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create Poster Template</h2>
        <div>
          <label htmlFor="posterName" className="mb-1.5 block text-sm font-medium text-slate-700">
            Template Name
          </label>
          <input
            id="posterName"
            required
            {...form.register("posterName", { required: true })}
            placeholder="e.g. Cardiology Template"
            className="soft-input"
          />
        </div>
        <div>
          <label htmlFor="textColorHex" className="mb-1.5 block text-sm font-medium text-slate-700">
            Text Color
          </label>
          <input
            id="textColorHex"
            type="color"
            {...form.register("textColorHex", { required: true })}
            className="h-12 w-24 rounded-lg border border-slate-300 bg-white p-1"
          />
        </div>
        <div>
          <label htmlFor="templateImage" className="mb-1.5 block text-sm font-medium text-slate-700">
            Template Image
          </label>
          <input
            id="templateImage"
            type="file"
            required
            accept="image/*"
            onChange={handleTemplateUpload}
            className="soft-input"
          />
          <p className="mt-2 text-xs text-slate-500">PNG/JPG recommended. This image is used as the base poster design.</p>
        </div>

        {templateImageBase64 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700">Selected image</p>
            <p className="mb-3 mt-1 text-xs text-slate-500">{templateImageName}</p>
            <img
              src={templateImageBase64}
              alt="Uploaded template preview"
              className="max-h-72 w-full rounded-lg border border-slate-200 object-contain"
            />
          </div>
        ) : null}

        <p className="text-xs text-slate-500">Default layout is tuned for the sample template design.</p>
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button className="primary-btn px-4 py-2.5 text-sm">Create Poster</button>
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
