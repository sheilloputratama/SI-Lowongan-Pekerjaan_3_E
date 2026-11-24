import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { Alert, Card, Empty, MatchDetail, PageTitle, ScoreBar, Spinner, StatusBadge, inputCls } from "../../components/ui.jsx";
import { STATUSES, fmtDate } from "../../utils.js";

export default function Applicants() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState("skor");
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [updating, setUpdating] = useState("");
  const [open, setOpen] = useState({});

  useEffect(() => { api.jobApplicants(id).then(setData).catch((e) => setMsg({ type: "error", text: e.message })); }, [id]);

  // Urut match_score tertinggi (default) atau terbaru; skor sama diurutkan yang melamar lebih dulu.
  const rows = useMemo(() => {
    if (!data) return [];
    const list = data.applicants.filter((a) => !filter || a.status === filter);
    return [...list].sort((a, b) => (sortBy === "skor" ? b.match_score - a.match_score || a.applied_at - b.applied_at : b.applied_at - a.applied_at));
  }, [data, sortBy, filter]);

  const changeStatus = async (app, status) => {
    if (status === app.status) return;
    setUpdating(app.id); setMsg({ type: "", text: "" });
    try {
      await api.updateStatus(app.id, status);
      setData((d) => ({ ...d, applicants: d.applicants.map((a) => (a.id === app.id ? { ...a, status } : a)) }));
      setMsg({ type: "success", text: `Status ${app.applicant.full_name} diubah menjadi ${status}` });
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setUpdating(""); }
  };

  if (!data) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner />;
  const { job } = data;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/company/jobs" className="text-sm text-indigo-600">← SI Lowongan Kerja saya</Link>
      <PageTitle title={`Pelamar: ${job.title}`} subtitle={`${data.applicants.length} pelamar, diurutkan berdasarkan skor kecocokan CV.`} />

      <div className="mb-4 flex flex-wrap gap-3">
        <select className={`${inputCls} w-auto`} value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Urutkan">
          <option value="skor">Skor tertinggi</option>
          <option value="terbaru">Terbaru</option>
        </select>
        <select className={`${inputCls} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter status">
          <option value="">Semua status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>

      {rows.length === 0 ? <Empty>{data.applicants.length ? "Tidak ada pelamar dengan status ini." : "Belum ada pelamar."}</Empty> : (
        <div className="space-y-4">
          {rows.map((a, i) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3">
                  {sortBy === "skor" && !filter && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{i + 1}</span>}
                  <div>
                    <p className="font-semibold">{a.applicant.full_name}</p>
                    <p className="text-xs text-slate-500">{a.applicant.email} • {a.applicant.phone || "-"} • melamar {fmtDate(a.applied_at)}</p>
                    <p className="mt-1 text-xs text-slate-500">CV: {a.cv_file_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreBar score={a.match_score} />
                  <StatusBadge status={a.status} />
                </div>
              </div>

              {a.match && (
                <div className="mt-3">
                  <button className="text-sm text-indigo-600" onClick={() => setOpen({ ...open, [a.id]: !open[a.id] })}>
                    {open[a.id] ? "Sembunyikan detail kecocokan" : "Lihat detail kecocokan"}
                  </button>
                  {open[a.id] && <div className="mt-3 rounded-lg bg-slate-50 p-3"><MatchDetail match={a.match} label="Kecocokan CV dengan SI Lowongan Kerja" /></div>}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">Ubah status:</span>
                {STATUSES.map((s) => (
                  <button key={s} disabled={updating === a.id || s === a.status} onClick={() => changeStatus(a, s)}
                    className={`rounded-lg border px-3 py-1 text-sm disabled:cursor-default ${s === a.status ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 hover:bg-slate-100 disabled:opacity-50"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



