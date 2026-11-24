import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Empty, PageTitle, ScoreBar, Spinner, Tags, btnGhost, inputCls } from "../components/ui.jsx";
import { CATEGORIES, JOB_TYPES, splitReq } from "../utils.js";

const EMPTY = { q: "", location: "", job_type: "", category: "", sort_by: "terbaru" };

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
  const hasScore = user?.role === "seeker" && jobs?.some((j) => j.match_score != null);

  return (
    <div>
      <PageTitle title="Cari SI Lowongan Kerja" subtitle="Temukan pekerjaan yang sesuai dengan keahlianmu." />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <input className={inputCls} placeholder="Posisi, perusahaan, atau keahlian" value={filters.q} onChange={set("q")} aria-label="Kata kunci" />
          <input className={inputCls} placeholder="Lokasi" value={filters.location} onChange={set("location")} aria-label="Lokasi" />
          <select className={inputCls} value={filters.job_type} onChange={set("job_type")} aria-label="Tipe pekerjaan">
            <option value="">Semua tipe</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={inputCls} value={filters.category} onChange={set("category")} aria-label="Kategori">
            <option value="">Semua kategori</option>
            {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Urutkan:</span>
            <select className={`${inputCls} w-auto`} value={filters.sort_by} onChange={set("sort_by")} aria-label="Urutkan">
              <option value="terbaru">Terbaru</option>
              <option value="skor" disabled={user?.role !== "seeker"}>Kecocokan tertinggi</option>
            </select>
            {user?.role !== "seeker" && <span className="text-xs text-slate-400">(login sebagai pencari kerja + punya CV)</span>}
          </div>
          {isFiltered && <button className={btnGhost} onClick={() => setFilters(EMPTY)}>Reset filter</button>}
        </div>
      </Card>

      <Alert>{error}</Alert>
      {!jobs && !error ? <Spinner text="Mencari SI Lowongan Kerja..." /> : jobs && jobs.length === 0 ? (
        <Empty>Tidak ada SI Lowongan Kerja yang cocok dengan pencarianmu.</Empty>
      ) : jobs && (
        <>
          <p className="mb-3 text-sm text-slate-500">{jobs.length} SI Lowongan Kerja ditemukan</p>
          {user?.role === "seeker" && !hasScore && (
            <p className="mb-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
              Unggah CV di menu <Link to="/cv" className="font-medium underline">CV</Link> untuk melihat skor kecocokan tiap SI Lowongan Kerja.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="block">
                <Card className="h-full transition hover:border-indigo-300 hover:shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-900">{j.title}</h2>
                      <p className="text-sm text-slate-600">{j.company_name}</p>
                    </div>
                    <ScoreBar score={j.match_score} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{j.location} • {j.job_type} • {j.category}</p>
                  <div className="mt-3"><Tags items={splitReq(j.requirements)} /></div>
                  {j.source === "external" && <p className="mt-3 text-xs text-amber-700">SI Lowongan Kerja eksternal, dibuka di situs asalnya</p>}
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



