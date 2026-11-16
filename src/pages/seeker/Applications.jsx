import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { Alert, Card, Empty, PageTitle, ScoreBar, Spinner, StatusBadge } from "../../components/ui.jsx";
import { fmtDate } from "../../utils.js";

const STEPS = ["Dikirim", "Ditinjau", "Keputusan"];

function Timeline({ app }) {
  const final = app.status === "Diterima" || app.status === "Ditolak";
  const reached = app.status === "Dikirim" ? 0 : app.status === "Ditinjau" ? 1 : 2;
  return (
    <ol className="mt-4 flex items-center gap-2 text-xs">
      {STEPS.map((s, i) => {
        const done = i <= reached;
        const label = i === 2 && final ? app.status : s;
        const color = !done ? "bg-slate-200 text-slate-500"
          : i === 2 && app.status === "Ditolak" ? "bg-red-500 text-white"
          : i === 2 ? "bg-green-500 text-white" : "bg-indigo-600 text-white";
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 ${color}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`h-px w-6 ${i < reached ? "bg-indigo-600" : "bg-slate-300"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Applications() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api.myApplications().then(setApps).catch((e) => setError(e.message)); }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Lamaran Saya" subtitle="Pantau status setiap lamaran yang sudah kamu kirim." />
      <Alert>{error}</Alert>
      {!apps && !error ? <Spinner /> : apps && apps.length === 0 ? (
        <Empty>Belum ada lamaran. <Link to="/" className="text-indigo-600">Cari lowongan</Link></Empty>
      ) : apps && (
        <div className="space-y-4">
          {apps.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/jobs/${a.jobId}`} className="font-semibold hover:text-indigo-600">{a.jobTitle}</Link>
                  <p className="text-sm text-slate-600">{a.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">Dikirim {fmtDate(a.createdAt)} • CV: {a.cvName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <ScoreBar score={a.score} />
                  <StatusBadge status={a.status} />
                </div>
              </div>
              <Timeline app={a} />
              {a.history?.length > 1 && (
                <p className="mt-3 text-xs text-slate-400">
                  Terakhir diperbarui {fmtDate(a.history[a.history.length - 1].at)} → {a.history[a.history.length - 1].status}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
