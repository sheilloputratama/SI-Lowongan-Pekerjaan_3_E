export const JOB_TYPES = ["Penuh waktu", "Paruh waktu", "Kontrak", "Magang"];
export const JOB_LEVELS = ["Fresh graduate", "Junior", "Menengah", "Senior"];
export const STATUSES = ["Dikirim", "Ditinjau", "Diterima", "Ditolak"];

export const fmtDate = (v) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
export const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
export const homePath = (user) => (user?.role === "company" ? "/company/jobs" : "/");

// Aturan CV: hanya PDF atau DOCX, maksimal 5 MB.
const CV_EXT = [".pdf", ".docx"];
export function validateCv(file) {
  const name = file.name.toLowerCase();
  if (!CV_EXT.some((e) => name.endsWith(e))) return "Format CV harus PDF atau DOCX";
  if (file.size > 5 * 1024 * 1024) return "Ukuran CV maksimal 5 MB";
  return null;
}
// Poster: hanya gambar JPG/PNG/WEBP, maksimal 8 MB.
export function validatePoster(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Poster harus berupa gambar JPG, PNG, atau WEBP";
  if (file.size > 8 * 1024 * 1024) return "Ukuran gambar maksimal 8 MB";
  return null;
}
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
