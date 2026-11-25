import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { Alert, Card, Empty, MatchDetail, ScoreBar, Spinner, StatusBadge, inputCls } from "../../components/ui.jsx";
import { STATUSES, fmtDate } from "../../utils.js";

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState("skor");
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [updating, setUpdating] = useState("");
  const [open, setOpen] = useState({});

  useEffect(() => {
    api.jobApplicants(id)
      .then(setData)
      .catch((e) => setMsg({ type: "error", text: e.message }));
  }, [id]);

  const rows = useMemo(() => {
    if (!data) return [];
    const list = data.applicants.filter((a) => !filter || a.status === filter);
    return [...list].sort((a, b) =>
      sortBy === "skor" ? b.match_score - a.match_score || a.applied_at - b.applied_at : b.applied_at - a.applied_at
    );
  }, [data, sortBy, filter]);

  const changeStatus = async (app, status) => {
    if (status === app.status) return;
    setUpdating(app.id);
    setMsg({ type: "", text: "" });
    try {
      await api.updateStatus(app.id, status);
      setData((d) => ({
        ...d,
        applicants: d.applicants.map((a) => (a.id === app.id ? { ...a, status } : a)),
      }));
      setMsg({ type: "success", text: `Status kandidat ${app.applicant.full_name} berhasil diubah menjadi "${status}".` });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setUpdating("");
    }
  };

  if (!data) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner text="Memuat daftar pelamar kandidat..." />;
  const { job } = data;

  const countByStatus = (st) => (data.applicants ? data.applicants.filter((a) => a.status === st).length : 0);

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/company/jobs" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>←</span> Kembali ke Lowongan Saya
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#212121]">Daftar Pelamar</span>
      </nav>

      {/* HEADER POSISI */}
      <div className="rounded-2xl bg-white border border-[#dfe5ec] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-[#eaf3fc] px-3 py-0.5 text-xs font-bold text-[#1976d2] mb-1">
            {job.category} • {job.job_type}
          </span>
          <h1 className="text-2xl font-bold text-[#212121]">Pelamar: {job.title}</h1>
          <p className="text-xs text-[#616161] mt-1">
            📍 {job.location} • Total <strong>{data.applicants.length}</strong> berkas pelamar masuk
          </p>
        </div>

        <Link to={`/jobs/${job.id}`} className="text-xs font-semibold text-[#1976d2] hover:underline self-start sm:self-center">
          Pratinjau Halaman Lowongan ↗
        </Link>
      </div>

      {/* FILTER STATUS PILLS (Figma 2:88229) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#dfe5ec]">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "" ? "bg-[#1976d2] text-white shadow-xs" : "bg-slate-100 text-[#616161] hover:text-[#212121]"
            }`}
          >
            Semua ({data.applicants.length})
          </button>
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filter === st ? "bg-[#1976d2] text-white shadow-xs" : "bg-slate-100 text-[#616161] hover:text-[#212121]"
              }`}
            >
              {st} ({countByStatus(st)})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#616161] font-semibold">Urutkan:</span>
          <select
            className={`${inputCls} w-auto text-xs py-1 px-2.5`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="skor">Skor Kecocokan Tertinggi</option>
            <option value="terbaru">Terbaru Melamar</option>
          </select>
        </div>
      </div>

      <Alert type={msg.type}>{msg.text}</Alert>

      {/* DAFTAR PELAMAR */}
      {rows.length === 0 ? (
        <Empty>
          <div className="space-y-2 py-4">
            <p className="font-bold text-base text-[#212121]">
              {data.applicants.length ? `Tidak ada pelamar dengan status "${filter}".` : "Belum ada pelamar untuk lowongan ini."}
            </p>
            {filter && (
              <button className={`${btnGhost} text-xs mt-2`} onClick={() => setFilter("")}>
                Tampilkan Semua Status
              </button>
            )}
          </div>
        </Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((a, i) => (
            <Card key={a.id} className="p-5 space-y-4 transition hover:border-[#1976d2]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Ranking badge */}
                  {sortBy === "skor" && !filter && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf3fc] text-xs font-bold text-[#1976d2] border border-[#1976d2]/20">
                      #{i + 1}
                    </span>
                  )}

                  <div className="space-y-1">
                    <p className="font-bold text-base text-[#212121]">{a.applicant.full_name}</p>
                    <p className="text-xs text-[#616161] flex flex-wrap items-center gap-2">
                      <span>📧 {a.applicant.email}</span>
                      <span>•</span>
                      <span>📞 {a.applicant.phone || "Tidak ada telepon"}</span>
                      <span>•</span>
                      <span>📅 Melamar {fmtDate(a.applied_at)}</span>
                    </p>
                    <p className="text-xs font-medium text-[#1976d2] flex items-center gap-1 pt-1">
                      <span>📄 Berkas CV:</span>
                      <strong className="underline">{a.cv_file_name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:self-start">
                  <ScoreBar score={a.match_score} />
                  <StatusBadge status={a.status} />
                </div>
              </div>

              {/* DETAIL KECOCOKAN AI COLLAPSIBLE */}
              {a.match && (
                <div className="border-t border-[#dfe5ec]/60 pt-3">
                  <button
                    className="text-xs font-bold text-[#1976d2] hover:underline flex items-center gap-1"
                    onClick={() => setOpen({ ...open, [a.id]: !open[a.id] })}
                  >
                    <span>{open[a.id] ? "▼ Sembunyikan" : "▶ Lihat"} Detail Analisis Kecocokan CV</span>
                  </button>
                  {open[a.id] && (
                    <div className="mt-3 rounded-xl bg-[#F5F5F5] p-4 border border-[#dfe5ec]">
                      <MatchDetail match={a.match} label="Kesesuaian Syarat Posisi" />
                    </div>
                  )}
                </div>
              )}

              {/* ACTION: UBAH STATUS */}
              <div className="border-t border-[#dfe5ec]/60 pt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#616161]">Ubah Status Keputusan:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={updating === a.id || s === a.status}
                      onClick={() => changeStatus(a, s)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-default ${
                        s === a.status
                          ? "border-[#1976d2] bg-[#1976d2] text-white shadow-xs"
                          : "border-[#dfe5ec] bg-white text-[#212121] hover:bg-[#F5F5F5] disabled:opacity-40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
