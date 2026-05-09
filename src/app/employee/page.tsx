"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Cropper, { Area, Point } from "react-easy-crop";
import { EMPLOYEE_TOKEN_KEY, getStoredToken, removeStoredToken } from "@/lib/client-auth";
import { readFileAsDataUrl } from "@/lib/image-utils";
import { createGeneratedPoster, getEmployeePosters } from "@/services/employee.service";
import { Poster } from "@/types/poster";
import "react-easy-crop/react-easy-crop.css";

type EmployeePosterForm = {
  posterId: string;
  doctorName: string;
  doctorCredentials: string;
  doctorHospital: string;
  doctorCity: string;
};

const UNIFORM_LAYOUT = {
  namePosition: { x: 415, y: 160 },
  credentialsPosition: { x: 415, y: 220 },
  hospitalPosition: { x: 415, y: 280 },
  cityPosition: { x: 415, y: 340 },
  doctorImagePosition: { x: 78, y: 105, width: 285, height: 304 },
};

const DOCTOR_FRAME_WIDTH_INCH = 2.134;
const DOCTOR_FRAME_HEIGHT_INCH = 2.03;
const DOCTOR_FRAME_ASPECT_RATIO = DOCTOR_FRAME_WIDTH_INCH / DOCTOR_FRAME_HEIGHT_INCH;
const DOCTOR_FRAME_WIDTH_SCALE = 1.1;
const DOCTOR_FRAME_HEIGHT_SCALE = 0.92;
const DOCTOR_FRAME_X_OFFSET = 4;
const DOCTOR_FRAME_Y_OFFSET = 2;


function normalizeDoctorName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^dr\.?\s*/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?\s*/i, "Dr. ");
  }
  return `Dr. ${trimmed}`;
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  sourceAspectRatioOverride?: number,
) {
  const imageAspectRatio = image.width / image.height;
  const targetAspectRatio = sourceAspectRatioOverride ?? targetWidth / targetHeight;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageAspectRatio > targetAspectRatio) {
    sourceWidth = image.height * targetAspectRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetAspectRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, targetWidth, targetHeight);
}

function createImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed loading doctor image"));
    image.src = source;
  });
}

async function getCroppedImageDataUrl(imageSrc: string, crop: Area) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );
  return canvas.toDataURL("image/png");
}

export default function EmployeeDashboardPage() {
  const [token] = useState(() => getStoredToken(EMPLOYEE_TOKEN_KEY));
  const [posters, setPosters] = useState<Poster[]>([]);
  const [doctorImageBase64, setDoctorImageBase64] = useState("");
  const [doctorCroppedImageBase64, setDoctorCroppedImageBase64] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [finalPosterDataUrl, setFinalPosterDataUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, control, getValues, setValue } = useForm<EmployeePosterForm>({
    defaultValues: {
      posterId: "",
      doctorName: "",
      doctorCredentials: "",
      doctorHospital: "",
      doctorCity: "",
    },
  });
  const selectedPosterId = useWatch({ control, name: "posterId" });

  const selectedPoster = useMemo(
    () => posters.find((poster) => poster._id === selectedPosterId),
    [posters, selectedPosterId],
  );

  useEffect(() => {
    if (!token) {
      window.location.href = "/employee/login";
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    getEmployeePosters(token)
      .then((data) => setPosters(data.posters ?? []))
      .catch((err: Error) => setError(err.message));
  }, [token]);

  async function handleDoctorImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setDoctorImageBase64(dataUrl);
    setDoctorCroppedImageBase64("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setFinalPosterDataUrl("");
    setError("");
  }

  async function generatePosterPreview(values: EmployeePosterForm) {
    setError("");
    if (!selectedPoster || !doctorImageBase64 || !croppedAreaPixels) {
      setError("Please select a poster and doctor image");
      return;
    }
    const normalizedDoctorName = normalizeDoctorName(values.doctorName);
    if (!normalizedDoctorName) {
      setError("Please enter doctor name");
      return;
    }
    setValue("doctorName", normalizedDoctorName, { shouldDirty: true });

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1530;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Canvas is not supported");
      return;
    }

    const template = new Image();
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        template.onload = () => resolve();
        template.onerror = () => reject(new Error("Failed loading poster template"));
        template.crossOrigin = "anonymous";
        template.src = selectedPoster.templateImageUrl;
      }),
    ]);
    const croppedDoctorDataUrl = await getCroppedImageDataUrl(doctorImageBase64, croppedAreaPixels);
    setDoctorCroppedImageBase64(croppedDoctorDataUrl);
    const doctor = await createImage(croppedDoctorDataUrl);

    context.drawImage(template, 0, 0, canvas.width, canvas.height);
    const layout = UNIFORM_LAYOUT;
    const adjustedWidth = layout.doctorImagePosition.width * DOCTOR_FRAME_WIDTH_SCALE;
    const adjustedHeight = layout.doctorImagePosition.height * DOCTOR_FRAME_HEIGHT_SCALE;
    const adjustedX =
      layout.doctorImagePosition.x - (adjustedWidth - layout.doctorImagePosition.width) / 2 + DOCTOR_FRAME_X_OFFSET;
    const adjustedY =
      layout.doctorImagePosition.y + (layout.doctorImagePosition.height - adjustedHeight) / 2 + DOCTOR_FRAME_Y_OFFSET;
    drawImageCover(
      context,
      doctor,
      adjustedX,
      adjustedY,
      adjustedWidth,
      adjustedHeight,
      DOCTOR_FRAME_ASPECT_RATIO,
    );
    context.fillStyle = selectedPoster.textColorHex;
    context.font = "bold 48px Arial";
    context.fillText(normalizedDoctorName, layout.namePosition.x , layout.namePosition.y);
    context.fillStyle = "#2d2d2d";
    context.font = "40px Arial";
    context.fillText(
      values.doctorCredentials,
      layout.credentialsPosition.x,
      layout.credentialsPosition.y,
    );
    context.fillText(values.doctorHospital, layout.hospitalPosition.x, layout.hospitalPosition.y);
    context.fillText(values.doctorCity, layout.cityPosition.x, layout.cityPosition.y);
    setFinalPosterDataUrl(canvas.toDataURL("image/png"));
  }

  async function saveAndDownload() {
    if (!selectedPoster || !doctorCroppedImageBase64 || !finalPosterDataUrl || !token) {
      setError("Please generate poster first");
      return;
    }

    setSaving(true);
    try {
      const values = getValues();
      const normalizedDoctorName = normalizeDoctorName(values.doctorName);
      setValue("doctorName", normalizedDoctorName, { shouldDirty: true });
      await createGeneratedPoster(token, {
        posterId: selectedPoster._id,
        doctorName: normalizedDoctorName,
        doctorCredentials: values.doctorCredentials,
        doctorHospital: values.doctorHospital,
        doctorCity: values.doctorCity,
        doctorImageBase64: doctorCroppedImageBase64,
        finalPosterBase64: finalPosterDataUrl,
      });

      const link = document.createElement("a");
      link.href = finalPosterDataUrl;
      link.download = `poster-${Date.now()}.png`;
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Employee Workspace</p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Create Poster</h1>
        </div>
        <button
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:py-1.5"
          onClick={() => {
            removeStoredToken(EMPLOYEE_TOKEN_KEY);
            window.location.href = "/employee/login";
          }}
        >
          Logout
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit(generatePosterPreview)} className="panel-card space-y-4 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Doctor Details</h2>
          <label className="block text-sm font-medium text-slate-700">
            Poster Template
            <select
              required
              {...register("posterId", { required: true })}
              className="soft-input mt-1.5"
            >
              <option value="">Select poster template</option>
              {posters.map((poster) => (
                <option key={poster._id} value={poster._id}>
                  {poster.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Doctor Name
            <input
              required
              placeholder="e.g. Mohit Garg"
              {...register("doctorName", {
                required: true,
                onBlur: (event) => {
                  const normalized = normalizeDoctorName(event.target.value);
                  if (normalized) {
                    setValue("doctorName", normalized, { shouldDirty: true });
                  }
                },
              })}
              className="soft-input mt-1.5"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Doctor Credentials
            <input
              required
              placeholder="e.g. MBBS, MD"
              {...register("doctorCredentials", { required: true })}
              className="soft-input mt-1.5"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Hospital Name
            <input
              required
              placeholder="e.g. City Care Hospital"
              {...register("doctorHospital", { required: true })}
              className="soft-input mt-1.5"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            City
            <input
              required
              placeholder="e.g. Mumbai"
              {...register("doctorCity", { required: true })}
              className="soft-input mt-1.5"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Doctor Image
            <input
              type="file"
              required
              accept="image/*"
              onChange={handleDoctorImageChange}
              className="soft-input mt-1.5"
            />
          </label>
          {doctorImageBase64 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Adjust Crop</p>
              <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Cropper
                  image={doctorImageBase64}
                  crop={crop}
                  zoom={zoom}
                  minZoom={0.1}
                  maxZoom={4}
                  aspect={DOCTOR_FRAME_ASPECT_RATIO}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  objectFit="cover"
                  showGrid={false}
                />
              </div>
              <label className="mt-3 block text-xs font-medium text-slate-600">
                Zoom
                <input
                  type="range"
                  min={0.1}
                  max={4}
                  step={0.1}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="mt-1 w-full accent-orange-500"
                />
              </label>
            </div>
          ) : null}
          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
            Generate Preview
          </button>
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </form>
        <div className="panel-card p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Preview</h2>
          {finalPosterDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={finalPosterDataUrl} alt="Generated poster preview" className="w-full rounded-xl border border-slate-200 shadow-sm" />
              <button
                disabled={saving}
                onClick={saveAndDownload}
                className="primary-btn mt-4 w-full px-4 py-2.5 text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save & Download"}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500 sm:p-8">
              Poster preview appears here after generation.
            </div>
          )}
        </div>
      </div>
      </section>
    </main>
  );
}
