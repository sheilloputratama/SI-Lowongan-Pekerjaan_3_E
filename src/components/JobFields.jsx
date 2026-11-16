import { Field, TagInput, inputCls } from "./ui.jsx";
import { JOB_LEVELS, JOB_TYPES } from "../utils.js";

// Validasi bersama untuk form lowongan (perusahaan) dan hasil scan poster.
export function validateJob(f) {
  const e = {};
  if (!f.title?.trim()) e.title = "Posisi wajib diisi";
  if (!f.location?.trim()) e.location = "Lokasi wajib diisi";
  if (!f.type) e.type = "Pilih tipe pekerjaan";
  if (!f.level) e.level = "Pilih level";
  if (!f.deadline) e.deadline = "Batas lamaran wajib diisi";
  if (!f.requirements?.length) e.requirements = "Isi minimal 1 keahlian";
  return e;
}

// Kolom form lowongan. `flag(name)` (opsional) menandai field dengan keyakinan AI rendah.
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
      <Field label="Gaji" hint={hint("salary")}>
        <input className={inputCls} value={form.salary || ""} onChange={(e) => set("salary", e.target.value)} placeholder="Contoh: Rp5.000.000 - Rp7.000.000" />
      </Field>
      <Field label="Tipe pekerjaan *" error={errors.type} hint={hint("type")}>
        <select className={inputCls + mark("type")} value={form.type || ""} onChange={(e) => set("type", e.target.value)}>
          <option value="">Pilih...</option>
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Level *" error={errors.level} hint={hint("level")}>
        <select className={inputCls + mark("level")} value={form.level || ""} onChange={(e) => set("level", e.target.value)}>
          <option value="">Pilih...</option>
          {JOB_LEVELS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Batas lamaran *" error={errors.deadline} hint={hint("deadline")}>
        <input type="date" className={inputCls + mark("deadline")} value={form.deadline || ""} onChange={(e) => set("deadline", e.target.value)} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Keahlian yang dibutuhkan *" error={errors.requirements} hint={hint("requirements") || "Ketik lalu Enter. Dipakai untuk menghitung skor kecocokan."}>
          <TagInput value={form.requirements || []} onChange={(v) => set("requirements", v)} placeholder="Contoh: react, sql" />
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
