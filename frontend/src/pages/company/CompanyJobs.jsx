import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { Alert, Card, ConfirmDialog, Empty, PageTitle, Spinner, Tags, btnGhost, btnPrimary } from "../../components/ui.jsx";
import { splitReq } from "../../utils.js";

export default function CompanyJobs() {
  const [jobs, setJobs] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api.myJobs()
      .then(setJobs)
      .catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    setDeleting(true);
    try {
      await api.deleteJob(toDelete.id);
      setMsg({ type: "success", text: `Lowongan "${toDelete.title}" berhasil dihapus.` });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  // Hitung metrik statistik rekrutmen untuk 4 cards (Figma 2:87777)
  const totalJobs = jobs ? jobs.length : 0;
  const activeJobs = jobs ? jobs.filter((j) => j.status === "aktif").length : 0;
  const totalApplicants = jobs ? jobs.reduce((acc, j) => acc + (j.applicant_count || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>🏠</span> Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#212121]">Portal Perusahaan</span>
      </nav>

      <PageTitle
        title="Dashboard Rekrutmen & Lowongan"
        subtitle="Pantau kinerja pemasangan lowongan kerja dan proses seleksi kandidat pelamar."
        action={
          <Link to="/company/jobs/new" className={`${btnPrimary} flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl`}>
            <span>+</span> Pasang Lowongan Baru
          </Link>
        }
      />

      {/* 4 STATISTIK REKRUTMEN (Figma 2:87777) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-[#1976d2]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fc] text-[#1976d2]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#616161]">Lowongan Aktif</p>
            <p className="text-2xl font-bold text-[#212121]">{activeJobs}</p>
            <p className="text-[10px] text-emerald-600 font-medium">dari {totalJobs} total dibuat</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-[#ff9800]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#ff9800]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#616161]">Total Pelamar Masuk</p>
            <p className="text-2xl font-bold text-[#212121]">{totalApplicants}</p>
            <p className="text-[10px] text-[#616161] font-medium">Seluruh berkas terdaftar</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-600">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#616161]">Matching AI CV</p>
            <p className="text-2xl font-bold text-[#212121]">Otomatis</p>
            <p className="text-[10px] text-emerald-600 font-medium">Peringkat skor kecocokan</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-indigo-600">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#616161]">Status Perusahaan</p>
            <p className="text-base font-bold text-[#212121] truncate max-w-[140px]">Terverifikasi</p>
            <p className="text-[10px] text-[#1976d2] font-semibold">Portal HR Aktif</p>
          </div>
        </Card>
      </div>

      <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>

      {/* DAFTAR LOWONGAN PERUSAHAAN (Figma 2:87948) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#212121]">Daftar Lowongan yang Anda Pasang</h2>
          <span className="text-xs text-[#616161]">{totalJobs} Lowongan Terdaftar</span>
        </div>

        {!jobs ? (
          <Spinner text="Memuat daftar lowongan perusahaan..." />
        ) : jobs.length === 0 ? (
          <Empty>
            <div className="space-y-3 py-6">
              <p className="font-bold text-base text-[#212121]">Perusahaan Anda belum memasang lowongan pekerjaan.</p>
              <p className="text-xs text-[#616161] max-w-md mx-auto">
                Pasang lowongan pertama Anda sekarang untuk mulai menerima berkas lamaran dari para pencari kerja terbaik.
              </p>
              <Link to="/company/jobs/new" className={`${btnPrimary} inline-flex items-center gap-2 text-xs font-semibold py-2.5 px-5`}>
                <span>+</span> Pasang Lowongan Pertama
              </Link>
            </div>
          </Empty>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <Card key={j.id} className="p-5 transition hover:border-[#1976d2] hover:shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-base text-[#212121]">{j.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        j.status === "aktif"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {j.status === "aktif" ? "● Aktif Ditayangkan" : "Ditutup"}
                      </span>
                    </div>
                    <p className="text-xs text-[#616161]">
                      📍 {j.location} • 🕒 {j.job_type} • 📁 {j.category}
                    </p>
                  </div>

                  <Link
                    to={`/company/jobs/${j.id}/applicants`}
                    className="self-start inline-flex items-center gap-1.5 rounded-full bg-[#eaf3fc] px-4 py-1.5 text-xs font-bold text-[#1976d2] hover:bg-[#1976d2] hover:text-white transition"
                  >
                    <span>👥</span>
                    <span>{j.applicant_count || 0} Pelamar Masuk</span>
                  </Link>
                </div>

                <div className="mt-3">
                  <Tags items={splitReq(j.requirements)} />
                </div>

                <div className="mt-4 pt-3 border-t border-[#dfe5ec]/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link to={`/company/jobs/${j.id}/applicants`} className={`${btnPrimary} text-xs py-1.5 px-4 font-semibold`}>
                      Lihat & Seleksi Pelamar
                    </Link>
                    <Link to={`/company/jobs/${j.id}/edit`} className={`${btnGhost} text-xs py-1.5 px-3 font-semibold`}>
                      Edit Info
                    </Link>
                  </div>
                  <button
                    className={`${btnGhost} text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold`}
                    onClick={() => setToDelete(j)}
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        busy={deleting}
        title="Hapus Lowongan Pekerjaan?"
        confirmText="Hapus Permanen"
        message={`Lowongan "${toDelete?.title}" beserta seluruh ${toDelete?.applicant_count ?? 0} data lamaran di dalamnya akan dihapus permanen.`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
