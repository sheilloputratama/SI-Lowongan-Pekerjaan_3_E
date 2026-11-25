import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Field, btnPrimary, inputCls } from "../components/ui.jsx";
import { homePath, isEmail } from "../utils.js";

const ROLES = [
  { id: "seeker", label: "Pencari Kerja" },
  { id: "company", label: "Perusahaan" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("seeker");
  const [form, setForm] = useState({ full_name: "", company_name: "", industry: "", address: "", phone: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = role === "seeker" ? "Nama lengkap wajib diisi" : "Nama penanggung jawab wajib diisi";
    if (role === "company" && !form.company_name.trim()) e.company_name = "Nama perusahaan wajib diisi";
    if (!isEmail(form.email)) e.email = "Format email tidak valid";
    if (form.password.length < 8) e.password = "Password minimal 8 karakter";
    if (form.confirm !== form.password) e.confirm = "Konfirmasi password tidak sama";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true); setError("");
    try {
      const payload = role === "seeker"
        ? { role, full_name: form.full_name, phone: form.phone, email: form.email, password: form.password }
        : { role, full_name: form.full_name, phone: form.phone, email: form.email, password: form.password, company_name: form.company_name, industry: form.industry, address: form.address };
      const user = await register(payload);
      navigate(homePath(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="grid gap-8 md:grid-cols-12 items-stretch rounded-3xl bg-white border border-[#dfe5ec] shadow-sm overflow-hidden">
        {/* Left: Branding */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#1976d2] to-[#1565c0] p-8 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1976d2]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  <rect width="20" height="14" x="2" y="6" rx="2"/>
                </svg>
              </div>
              <span className="text-lg font-bold">SI Lowongan Kerja</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold leading-tight">
                Bergabung Bersama Kami
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Pilih peran Anda dan mulai temukan karir terbaik atau pasang lowongan untuk ribuan talenta di Indonesia.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/20 space-y-2 text-xs">
              <p className="font-bold">Keuntungan Akun Baru:</p>
              <p>• Akses pencocokan skor CV cerdas</p>
              <p>• Notifikasi status pelamar realtime</p>
              <p>• Pemasangan lowongan tanpa batas biaya</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-[11px] text-blue-200">
            Sistem Informasi Lowongan Kerja • Kelompok 3 E
          </div>
        </div>

        {/* Right: Form Register */}
        <div className="md:col-span-7 p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-[#212121] mb-2">Buat Akun Baru</h1>
          <p className="text-xs text-[#616161] mb-5">Pilih tipe akun Anda untuk melanjutkan proses pendaftaran.</p>

          {/* Role switcher tabs */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#F5F5F5] p-1 border border-[#dfe5ec]" role="tablist">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={role === r.id}
                onClick={() => { setRole(r.id); setErrors({}); }}
                className={`rounded-lg py-2 text-xs font-bold transition ${
                  role === r.id
                    ? "bg-white text-[#1976d2] shadow-xs border border-[#dfe5ec]"
                    : "text-[#616161] hover:text-[#212121]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {role === "seeker" ? (
              <>
                <Field label="Nama Lengkap *" error={errors.full_name}>
                  <input className={inputCls} placeholder="Nama lengkap Anda" value={form.full_name} onChange={set("full_name")} />
                </Field>
                <Field label="Nomor Telepon">
                  <input className={inputCls} placeholder="08xxxxxxxxxx" value={form.phone} onChange={set("phone")} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Nama Perusahaan *" error={errors.company_name}>
                  <input className={inputCls} placeholder="PT Contoh Nama Perusahaan" value={form.company_name} onChange={set("company_name")} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Bidang Industri">
                    <input className={inputCls} placeholder="Teknologi, Finansial..." value={form.industry} onChange={set("industry")} />
                  </Field>
                  <Field label="Lokasi / Alamat">
                    <input className={inputCls} placeholder="Kota domisili" value={form.address} onChange={set("address")} />
                  </Field>
                </div>
                <Field label="Nama Penanggung Jawab (HR) *" error={errors.full_name}>
                  <input className={inputCls} placeholder="Nama lengkap HRD" value={form.full_name} onChange={set("full_name")} />
                </Field>
                <Field label="Nomor Telepon">
                  <input className={inputCls} placeholder="Nomor telepon kantor / HR" value={form.phone} onChange={set("phone")} />
                </Field>
              </>
            )}

            <Field label="Alamat Email *" error={errors.email}>
              <input type="email" className={inputCls} placeholder="email@domain.com" value={form.email} onChange={set("email")} autoComplete="email" />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Password *" error={errors.password} hint="Min. 8 karakter">
                <input type="password" className={inputCls} value={form.password} onChange={set("password")} autoComplete="new-password" />
              </Field>
              <Field label="Ulangi Password *" error={errors.confirm}>
                <input type="password" className={inputCls} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
              </Field>
            </div>

            <Alert>{error}</Alert>

            <button className={`${btnPrimary} w-full py-2.5 font-semibold text-sm`} disabled={busy}>
              {busy ? "Mendaftarkan Akun..." : "Daftar Akun"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#616161]">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="font-bold text-[#1976d2] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
