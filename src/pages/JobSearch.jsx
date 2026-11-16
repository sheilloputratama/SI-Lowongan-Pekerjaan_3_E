import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Empty, PageTitle, ScoreBar, Spinner, Tags, btnGhost, inputCls } from "../components/ui.jsx";
import { JOB_LEVELS, JOB_TYPES, fmtDate } from "../utils.js";

const EMPTY = { q: "", location: "", type: "", level: "", sortBy: "terbaru" };

function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function JobSearch() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(EMPTY);
  const debounced = useDebounced(filters);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setJobs(null); setError("");
    api.searchJobs(debounced)
      .then((r) => !cancelled && setJobs(r))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [debounced]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(EMPTY);
  const showScore = user?.role === "seeker" && jobs?.some((j) => j.score != null);

  return (
    <div>
      <PageTitle title="Cari Lowongan" subtitle="Temukan pekerjaan yang sesuai dengan keahlianmu." />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-5">
          <input className={`${inputCls} md:col-span-2`} placeholder="Posisi, perusahaan, atau keahlian" value={filters.q} onChange={set("q")} aria-label="Kata kunci" />
          <input className={inputCls} placeholder="Lokasi" value={filters.location} onChange={set("location")} aria-label="Lokasi" />
          <select className={inputCls} value={filters.type} onChange={set("type")} aria-label="Tipe pekerjaan">
            <option value="">Semua tipe</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={inputCls} value={filters.level} onChange={set("level")} aria-label="Level">
            <option value="">Semua level</option>
            {JOB_LEVELS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Urutkan:</span>
            <select className={`${inputCls} w-auto`} value={filters.sortBy} onChange={set("sortBy")} aria-label="Urutkan">
              <option value="terbaru">Terbaru</option>
              <option value="skor" disabled={user?.role !== "seeker"}>Kecocokan tertinggi</option>
            </select>
            {user?.role !== "seeker" && <span className="text-xs text-slate-400">(login sebagai pencari kerja + punya CV aktif)</span>}
          </div>
          {isFiltered && <button className={btnGhost} onClick={() => setFilters(EMPTY)}>Reset filter</button>}
        </div>
      </Card>

      <Alert>{error}</Alert>
      {!jobs && !error ? <Spinner text="Mencari lowongan..." /> : jobs && jobs.length === 0 ? (
        <Empty>Tidak ada lowongan yang cocok dengan pencarianmu.</Empty>
      ) : jobs && (
        <>
          <p className="mb-3 text-sm text-slate-500">{jobs.length} lowongan ditemukan</p>
          {user?.role === "seeker" && !showScore && (
            <p className="mb-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
              Unggah CV di menu <Link to="/cv" className="font-medium underline">CV</Link> dan isi keahlian di profil untuk melihat skor kecocokan.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="block">
                <Card className="h-full transition hover:border-indigo-300 hover:shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-900">{j.title}</h2>
                      <p className="text-sm text-slate-600">{j.companyName}</p>
                    </div>
                    <ScoreBar score={j.score} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{j.location} • {j.type} • {j.level}</p>
                  <div className="mt-3"><Tags items={j.requirements} /></div>
                  <p className="mt-3 text-xs text-slate-400">Ditutup {fmtDate(j.deadline)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
