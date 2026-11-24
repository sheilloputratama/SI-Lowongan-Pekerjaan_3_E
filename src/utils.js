export const JOB_TYPES = ["Penuh waktu", "Paruh waktu", "Kontrak", "Magang"];
export const CATEGORIES = ["Teknologi Informasi", "Keuangan & Akuntansi", "Pemasaran & Penjualan", "Administrasi", "Pendidikan", "Kesehatan", "Lainnya"];
export const JOB_STATUSES = ["aktif", "ditutup"];
export const STATUSES = ["Dikirim", "Ditinjau", "Diterima", "Ditolak"]; // status lamaran

export const fmtDate = (v) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
export const homePath = (user) => (user?.role === "company" ? "/company/jobs" : "/");
export const displayName = (user) => user?.company?.name || user?.full_name || "";

// jobs.requirements bertipe text: pisahkan dengan koma, titik koma, atau baris baru.
export const splitReq = (text) => String(text || "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

// Aturan CV: hanya PDF atau DOCX, maksimal 2 MB.
const CV_EXT = [".pdf", ".docx"];
export function validateCv(file) {
  const name = file.name.toLowerCase();
  if (!CV_EXT.some((e) => name.endsWith(e))) return "Format CV harus PDF atau DOCX";
  if (file.size > 2 * 1024 * 1024) return "Ukuran CV maksimal 2 MB";
  return null;
}
// Poster: hanya gambar JPG/PNG/WEBP, maksimal 2 MB.
export function validatePoster(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Poster harus berupa gambar JPG, PNG, atau WEBP";
  if (file.size > 2 * 1024 * 1024) return "Ukuran gambar maksimal 2 MB";
  return null;
}
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);


