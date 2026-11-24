import { Field, inputCls } from "./ui.jsx";
import { CATEGORIES, JOB_TYPES } from "../utils.js";

// Validasi bersama untuk form lowongan (perusahaan) dan hasil scan poster.
export function validateJob(f) {
  const e = {};
  if (!f.title?.trim()) e.title = "Posisi wajib diisi";
  if (!f.location?.trim()) e.location = "Lokasi wajib diisi";
  if (!f.job_type) e.job_type = "Pilih tipe pekerjaan";
  if (!f.category) e.category = "Pilih kategori";
  if (!f.requirements?.trim()) e.requirements = "Isi persyaratan/keahlian";
  return e;
}

// Kolom form lowongan sesuai tabel jobs. `flag(name)` (opsional) menandai field
// dengan keyakinan AI rendah. `extra` = field tambahan (mis. status, perusahaan).
export default function JobFields({ form, set, errors = {}, flag = () => false, extra }) {
  const mark = (name) => (flag(name) ? " ring-2 ring-amber-300 border-amber-400" : "");
  const hint = (name) => (flag(name) ? "AI kurang yakin, mohon periksa" : undefined);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Field label="Posisi *" error={errors.title} hint={hint("title")}>
          <input className={inputCls + mark("title")} value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
        </Field>
      </div>
      {extra}
      <Field label="Lokasi *" error={errors.location} hint={hint("location")}>
        <input className={inputCls + mark("location")} value={form.location || ""} onChange={(e) => set("location", e.target.value)} />
      </Field>
      <Field label="Tipe pekerjaan *" error={errors.job_type} hint={hint("job_type")}>
        <select className={inputCls + mark("job_type")} value={form.job_type || ""} onChange={(e) => set("job_type", e.target.value)}>
          <option value="">Pilih...</option>
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Kategori *" error={errors.category} hint={hint("category")}>
        <select className={inputCls + mark("category")} value={form.category || ""} onChange={(e) => set("category", e.target.value)}>
          <option value="">Pilih...</option>
          {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Kontak" hint={hint("contact_info") || "Email atau nomor telepon untuk pelamar"}>
        <input className={inputCls + mark("contact_info")} value={form.contact_info || ""} onChange={(e) => set("contact_info", e.target.value)} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Persyaratan / keahlian *" error={errors.requirements} hint={hint("requirements") || "Pisahkan dengan koma atau baris baru. Dipakai untuk menghitung skor kecocokan."}>
          <textarea rows={3} className={inputCls + mark("requirements")} value={form.requirements || ""} onChange={(e) => set("requirements", e.target.value)} placeholder="react, javascript, sql" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Deskripsi">
          <textarea rows={5} className={inputCls} value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
