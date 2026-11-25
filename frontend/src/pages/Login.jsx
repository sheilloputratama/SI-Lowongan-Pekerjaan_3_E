import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK } from "../api/client.js";
import { Alert, Field, btnPrimary, inputCls } from "../components/ui.jsx";
import { homePath, isEmail } from "../utils.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(form.email)) return setError("Format email tidak valid");
    if (!form.password) return setError("Password wajib diisi");
    setBusy(true);
    setError("");
    try {
      const user = await login(form);
      navigate(location.state?.from || homePath(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="grid gap-8 md:grid-cols-12 items-stretch rounded-3xl bg-white border border-[#dfe5ec] shadow-sm overflow-hidden">
        {/* Left: Branding & Manfaat HR/Seeker (Figma 2:87717) */}
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
                Platform Rekrutmen Cerdas Berbasis AI
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Menghubungkan pencari kerja potensial dengan perusahaan terpercaya melalui pencocokan kualifikasi otomatis.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold">✓</span>
                <span>Analisis kecocokan CV instan dengan skor transparan</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold">✓</span>
                <span>Pelacakan status lamaran terintegrasi realtime</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-blue-100">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold">✓</span>
                <span>Pemindaian poster lowongan kerja dengan OCR cerdas</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-[11px] text-blue-200">
            Sistem Informasi Lowongan Kerja • Kelompok 3 E
          </div>
        </div>

        {/* Right: Form Masuk */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#212121]">Masuk ke Akun Anda</h1>
            <p className="mt-1 text-xs text-[#616161]">
              Silakan masukkan email dan password yang telah terdaftar.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Field label="Alamat Email">
              <input
                type="email"
                className={inputCls}
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                className={inputCls}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            </Field>

            <Alert>{error}</Alert>

            <button className={`${btnPrimary} w-full py-2.5 text-sm font-semibold`} disabled={busy}>
              {busy ? "Memproses Masuk..." : "Masuk ke Akun"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#616161]">
            Belum memiliki akun?{" "}
            <Link to="/register" className="font-bold text-[#1976d2] hover:underline">
              Daftar Sekarang
            </Link>
          </p>

          {USE_MOCK && (
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Akun Uji Coba Demo (Mode Mock):</p>
              <p>• Pencari Kerja: <code className="bg-amber-100 px-1 py-0.5 rounded">pelamar@test.test</code> (pwd: <code className="bg-amber-100 px-1 py-0.5 rounded">password123</code>)</p>
              <p>• Perusahaan: <code className="bg-amber-100 px-1 py-0.5 rounded">hrd@nusantara.test</code> (pwd: <code className="bg-amber-100 px-1 py-0.5 rounded">password123</code>)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
