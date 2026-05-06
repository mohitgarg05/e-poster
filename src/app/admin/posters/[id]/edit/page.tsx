"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { getAdminPosters, updateAdminPoster } from "@/services/admin.service";
import { Poster } from "@/types/poster";
import { AdminShell } from "../../../_components/admin-shell";
import { useAdminToken } from "../../../_components/use-admin-token";
import { readFileAsDataUrl } from "@/lib/image-utils";

type PosterEditForm = {
  name: string;
  textColorHex: string;
  isActive: boolean;
};

export default function EditPosterPage() {
  const token = useAdminToken();
  const params = useParams<{ id: string }>();
  const [poster, setPoster] = useState<Poster | null>(null);
  const [templateImageBase64, setTemplateImageBase64] = useState("");
  const [templateImageName, setTemplateImageName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<PosterEditForm>({
    defaultValues: {
      name: "",
      textColorHex: "#f97316",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!token || !params.id) return;
    void loadPoster(token, params.id);
  }, [token, params.id]);

  async function loadPoster(currentToken: string, posterId: string) {
    try {
      const data = await getAdminPosters(currentToken);
      const currentPoster = data.posters.find((item) => item._id === posterId) ?? null;
      setPoster(currentPoster);
      if (currentPoster) {
        form.reset({
          name: currentPoster.name,
          textColorHex: currentPoster.textColorHex,
          isActive: currentPoster.isActive,
        });
      }
    } catch (err) {
      setError(toMessage(err, "Failed loading poster"));
    }
  }

  async function handleTemplateUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setTemplateImageBase64(dataUrl);
    setTemplateImageName(file.name);
  }

  async function saveChanges(values: PosterEditForm) {
    if (!token || !poster) return;
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateAdminPoster(token, poster._id, {
        name: values.name,
        textColorHex: values.textColorHex,
        isActive: values.isActive,
        templateImageBase64: templateImageBase64 || undefined,
      });
      setSuccess("Poster updated successfully.");
      await loadPoster(token, poster._id);
      setTemplateImageBase64("");
      setTemplateImageName("");
    } catch (err) {
      setError(toMessage(err, "Failed updating poster"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminShell activeTab="posters" title="Manage Poster">
      <div className="mb-4">
        <Link href="/admin/posters" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Back to posters
        </Link>
      </div>

      <section className="panel-card max-w-5xl space-y-5 p-6">
        {!poster ? (
          <p className="text-sm text-slate-600">Poster not found.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={form.handleSubmit(saveChanges)} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Poster Details</h2>

              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Template Name
                </label>
                <input id="name" {...form.register("name", { required: true })} className="soft-input" />
              </div>

              <div>
                <label htmlFor="textColorHex" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="textColorHex"
                    type="color"
                    {...form.register("textColorHex", { required: true })}
                    className="h-12 w-24 rounded-lg border border-slate-300 bg-white p-1"
                  />
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700">
                    {form.watch("textColorHex")}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" {...form.register("isActive")} className="h-4 w-4 accent-emerald-600" />
                  Active
                </label>
              </div>

              <div>
                <label htmlFor="templateImage" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Replace Template Image (optional)
                </label>
                <input
                  id="templateImage"
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateUpload}
                  className="soft-input"
                />
                {templateImageName ? <p className="mt-1 text-xs text-slate-500">Selected: {templateImageName}</p> : null}
              </div>

              {success ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

              <div className="flex items-center gap-2">
                <button disabled={isSaving} className="primary-btn px-4 py-2.5 text-sm disabled:opacity-70">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white"
                  onClick={() => {
                    form.setValue("isActive", false);
                    void form.handleSubmit(saveChanges)();
                  }}
                >
                  Mark Inactive
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900">Poster Preview</h3>
              <p className="text-xs text-slate-500">Current or newly selected template image.</p>
              <img
                src={templateImageBase64 || poster.templateImageUrl}
                alt={`${poster.name} template`}
                className="max-h-[600px] w-full rounded-lg border border-slate-200 bg-white object-contain"
              />
            </div>
          </div>
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
