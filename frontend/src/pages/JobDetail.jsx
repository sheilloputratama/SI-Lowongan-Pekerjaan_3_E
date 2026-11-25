import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, ConfirmDialog, MatchDetail, Spinner, Tags, btnPrimary, inputCls } from "../components/ui.jsx";
import { splitReq } from "../utils.js";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [cvId, setCvId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    api.getJob(id)
      .then((j) => {
        setJob(j);
        // Load similar jobs in same category
        api.searchJobs({ category: j.category })
          .then((list) => setSimilarJobs((list || []).filter((item) => item.id !== j.id).slice(0, 2)))
          .catch(() => {});
      })
      .catch((e) => setMsg({ type: "error", text: e.message }));
  }, [id]);

  useEffect(() => {
    if (user?.role !== "seeker") return;
    api.listCvs().then((list) => {
      setCvs(list);
      setCvId(list[0]?.id || "");
    }).catch(() => {});
  }, [user]);

  const submit = async () => {
    setBusy(true);
    try {
      await api.apply(id, { cv_id: cvId });
      setJob({ ...job, applied: true });
      setMsg({ type: "success", text: "Lamaran berhasil dikirim. Anda dapat memantau prosesnya di menu Lamaran Saya." });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  if (!job) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner text="Memuat detail lowongan..." />;
  const external = job.source === "external";
  const closed = job.status !== "aktif";

  return (
    <div className="space-y-6">
      {/* BREADCRUMB (Figma 2:87436) */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>🏠</span> Beranda
        </Link>
        <span>/</span>
        <Link to="/jobs" className="hover:text-[#1976d2] transition">Lowongan</Link>
        <span>/</span>
        <span className="font-semibold text-[#212121] truncate max-w-xs">{job.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* MAIN COLUMN (LEFT - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3fc] text-xl font-bold text-[#1976d2] border border-[#1976d2]/20">
                {job.company_name ? job.company_name.charAt(0).toUpperCase() : "P"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#212121]">{job.title}</h1>
                <p className="text-sm font-medium text-[#1976d2] mt-0.5">{job.company_name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#616161]">
                  <span>📍 {job.location}</span>
                  <span>•</span>
                  <span>🕒 {job.job_type}</span>
                  <span>•</span>
                  <span>📁 {job.category}</span>
                </div>
              </div>
            </div>

            {/* DESKRIPSI */}
            <div className="mt-8 border-t border-[#dfe5ec] pt-6">
              <h2 className="text-base font-bold text-[#212121]">Deskripsi Pekerjaan</h2>
              <p className="mt-2 text-sm text-[#616161] leading-relaxed whitespace-pre-line">
                {job.description || "Tidak ada deskripsi tambahan untuk lowongan ini."}
              </p>
            </div>

            {/* PERSYARATAN & KEAHLIAN */}
            <div className="mt-6 border-t border-[#dfe5ec] pt-6">
              <h2 className="text-base font-bold text-[#212121]">Persyaratan & Keahlian yang Dibutuhkan</h2>
              <p className="text-xs text-[#616161] mt-1 mb-3">
                Keahlian ini digunakan oleh sistem AI kami untuk mencocokkan kualifikasi pada berkas CV Anda.
              </p>
              <Tags items={splitReq(job.requirements)} highlight={job.match?.matched_skills || []} />
            </div>

            {job.contact_info && (
              <div className="mt-6 border-t border-[#dfe5ec] pt-6 text-xs text-[#616161]">
                <strong>Informasi Kontak Perusahaan:</strong> {job.contact_info}
              </div>
            )}
          </Card>

          {/* LOWONGAN SERUPA (Figma 2:87436) */}
          {similarJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-base text-[#212121]">Lowongan Serupa di Bidang {job.category}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {similarJobs.map((sim) => (
                  <Link key={sim.id} to={`/jobs/${sim.id}`} className="block">
                    <Card className="p-4 hover:border-[#1976d2] transition">
                      <p className="font-bold text-sm text-[#212121]">{sim.title}</p>
                      <p className="text-xs text-[#616161] mt-0.5">{sim.company_name} • {sim.location}</p>
                      <div className="mt-2">
                        <Tags items={splitReq(sim.requirements).slice(0, 3)} />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN (RIGHT - 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 space-y-5">
            <h3 className="font-bold text-base text-[#212121] border-b border-[#dfe5ec] pb-3">Ringkasan Lamaran</h3>

            {/* AI MATCH RESULT */}
            <MatchDetail match={job.match} />

            {external ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-[#616161]">
                  Lowongan ini berasal dari mitra eksternal. Lamaran diproses langsung melalui portal resmi mitra.
                </p>
                <a href={job.external_url} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} w-full text-center py-2.5`}>
                  Lamar di Situs Mitra ↗
                </a>
              </div>
            ) : !user ? (
              <div className="rounded-xl bg-[#eaf3fc] p-4 text-xs text-[#1976d2] space-y-3">
                <p className="font-medium">Silakan masuk sebagai pencari kerja untuk mengirim lamaran.</p>
                <Link to="/login" state={{ from: `/jobs/${id}` }} className={`${btnPrimary} w-full text-center py-2 text-xs block`}>
                  Masuk Sekarang
                </Link>
              </div>
            ) : user.role === "company" ? (
              <p className="text-xs text-[#616161] bg-[#f5f5f5] p-3 rounded-lg border border-[#dfe5ec]">
                Akun perusahaan tidak dapat melamar pekerjaan.
              </p>
            ) : job.applied ? (
              <Alert type="success">✓ Anda sudah mengajukan lamaran untuk posisi ini.</Alert>
            ) : closed ? (
              <Alert>Lowongan ini saat ini sudah ditutup.</Alert>
            ) : cvs.length === 0 ? (
              <div className="space-y-2">
                <Alert>Anda belum memiliki berkas CV yang diunggah.</Alert>
                <Link to="/cv" className={`${btnPrimary} w-full text-center block text-xs`}>
                  Unggah CV Dulu
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#212121]">
                  Pilih Berkas CV untuk Melamar:
                  <select
                    className={`${inputCls} mt-1`}
                    value={cvId}
                    onChange={(e) => setCvId(e.target.value)}
                  >
                    {cvs.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        {c.file_name} {i === 0 ? "(Terbaru)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={`${btnPrimary} w-full py-2.5 font-semibold text-sm`}
                  onClick={() => setConfirm(true)}
                >
                  Lamar Sekarang
                </button>
              </div>
            )}

            <Alert type={msg.type}>{msg.text}</Alert>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        busy={busy}
        title="Konfirmasi Pengajuan Lamaran"
        confirmText="Kirim Lamaran"
        message={`Lamaran Anda untuk posisi "${job.title}" di ${job.company_name} akan dikirimkan beserta berkas CV terpilih.`}
        onConfirm={submit}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
