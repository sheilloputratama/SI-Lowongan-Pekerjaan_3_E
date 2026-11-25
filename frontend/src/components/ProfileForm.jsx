import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Field, PageTitle, Spinner, btnPrimary, inputCls } from "./ui.jsx";

// Form profil generik. `fields`: [{ name, label, type: "text"|"textarea"|"tags", required, hint, readOnly }]
export default function ProfileForm({ title, subtitle, fields }) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then(setForm).catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => {
      if (f.required && !String(form[f.name] ?? "").trim()) {
        errs[f.name] = `${f.label} wajib diisi`;
      }
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await api.updateProfile(form);
      await refreshUser();
      setMsg({ type: "success", text: "Informasi profil berhasil diperbarui dan disimpan." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!form) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner text="Memuat profil..." />;

  const isCompany = user?.role === "company";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>🏠</span> Beranda
        </Link>
        <span>/</span>
        {isCompany && (
          <>
            <Link to="/company/jobs" className="hover:text-[#1976d2] transition">Portal Perusahaan</Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-[#212121]">{title}</span>
      </nav>

      <PageTitle title={title} subtitle={subtitle} />

      {/* HEADER CARD IDENTITAS */}
      {isCompany && (
        <Card className="p-6 bg-gradient-to-r from-white via-white to-[#eaf3fc] border border-[#dfe5ec]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1976d2] text-xl font-bold text-white shadow-xs">
              {form.company_name ? form.company_name.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#212121]">{form.company_name || "Nama Perusahaan"}</h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  ✓ Akun HR Terverifikasi
                </span>
              </div>
              <p className="text-xs text-[#616161] mt-0.5">{form.industry || "Industri Belum Diisi"} • {form.address || "Lokasi Belum Diisi"}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-5" noValidate>
          {fields.map((f) => (
            <Field key={f.name} label={f.label + (f.required ? " *" : "")} error={errors[f.name]} hint={f.hint}>
              {f.type === "textarea" ? (
                <textarea
                  rows={4}
                  className={inputCls}
                  placeholder={`Masukkan ${f.label.toLowerCase()}...`}
                  value={form[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : (
                <input
                  className={`${inputCls} ${f.readOnly ? "bg-[#f5f5f5] text-[#616161] cursor-not-allowed" : ""}`}
                  placeholder={`Masukkan ${f.label.toLowerCase()}...`}
                  value={form[f.name] ?? ""}
                  readOnly={f.readOnly}
                  disabled={f.readOnly}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </Field>
          ))}

          <Alert type={msg.type}>{msg.text}</Alert>

          <div className="pt-3 border-t border-[#dfe5ec] flex justify-end">
            <button className={`${btnPrimary} px-6 py-2.5 font-semibold text-sm`} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
