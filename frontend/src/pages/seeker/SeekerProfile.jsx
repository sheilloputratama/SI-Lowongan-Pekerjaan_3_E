import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Alert, Card, Field, PageTitle, Spinner, btnPrimary, inputCls } from "../../components/ui.jsx";
import { displayName } from "../../utils.js";
import CvManager from "./CvManager.jsx";
import Applications from "./Applications.jsx";

export default function SeekerProfile() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "info";

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then(setForm)
      .catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name?.trim()) {
      setErrors({ full_name: "Nama lengkap wajib diisi" });
      return;
    }
    setErrors({});
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await api.updateProfile(form);
      await refreshUser();
      setMsg({ type: "success", text: "Profil Anda berhasil diperbarui." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Profil & Berkas Saya"
        subtitle="Kelola informasi identitas, berkas CV untuk pencocokan AI, dan pantau status lamaran."
      />

      {/* RINGKASAN PROFIL BANNER (Figma 2:87585) */}
      <Card className="p-6 bg-gradient-to-r from-white via-white to-[#eaf3fc] border border-[#dfe5ec]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1976d2] text-2xl font-bold text-white shadow-sm ring-4 ring-[#eaf3fc]">
            {user ? displayName(user).charAt(0).toUpperCase() : "P"}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-[#212121]">{user ? displayName(user) : "Memuat..."}</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                ✓ Akun Pencari Kerja Aktif
              </span>
            </div>
            <p className="text-xs text-[#616161]">
              📧 {user?.email} • 📞 {user?.phone || "Belum ada nomor telepon"}
            </p>
            <p className="text-xs text-[#1976d2] pt-1">
              ✨ Keahlian Anda akan diekstraksi dan dicocokkan otomatis dari berkas CV yang diunggah.
            </p>
          </div>
        </div>
      </Card>

      {/* TAB NAVIGASI (Figma 2:87585) */}
      <div className="flex border-b border-[#dfe5ec] gap-2 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setTab("info")}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "info"
              ? "border-[#1976d2] text-[#1976d2]"
              : "border-transparent text-[#616161] hover:text-[#212121]"
          }`}
        >
          <span>👤</span> Informasi Pribadi
        </button>

        <button
          onClick={() => setTab("cv")}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "cv"
              ? "border-[#1976d2] text-[#1976d2]"
              : "border-transparent text-[#616161] hover:text-[#212121]"
          }`}
        >
          <span>📄</span> Berkas CV & Pencocokan
        </button>

        <button
          onClick={() => setTab("applications")}
          className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === "applications"
              ? "border-[#1976d2] text-[#1976d2]"
              : "border-transparent text-[#616161] hover:text-[#212121]"
          }`}
        >
          <span>📋</span> Riwayat Lamaran
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "info" && (
        <Card className="max-w-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-[#212121] mb-1">Informasi Akun Pribadi</h3>
          <p className="text-xs text-[#616161] mb-6">
            Data ini akan dicantumkan saat Anda mengajukan lamaran ke perusahaan.
          </p>

          {!form ? (
            <Spinner text="Memuat informasi profil..." />
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
              <Field label="Nama Lengkap *" error={errors.full_name}>
                <input
                  className={inputCls}
                  value={form.full_name || ""}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </Field>

              <Field label="Nomor Telepon">
                <input
                  className={inputCls}
                  placeholder="08xxxxxxxxxx"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>

              <Field label="Alamat Email (Login)" hint="Email tidak dapat diubah karena digunakan sebagai kredensial login">
                <input
                  className={`${inputCls} bg-[#f5f5f5] text-[#616161] cursor-not-allowed`}
                  value={form.email || ""}
                  disabled
                  readOnly
                />
              </Field>

              <Alert type={msg.type}>{msg.text}</Alert>

              <div className="pt-2">
                <button className={`${btnPrimary} py-2.5 px-6 font-semibold text-sm`} disabled={saving}>
                  {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </Card>
      )}

      {activeTab === "cv" && (
        <div className="max-w-3xl">
          <CvManager />
        </div>
      )}

      {activeTab === "applications" && (
        <div className="max-w-4xl">
          <Applications />
        </div>
      )}
    </div>
  );
}
