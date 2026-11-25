import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Empty, ScoreBar, Spinner, Tags, btnPrimary, inputCls } from "../components/ui.jsx";
import { CATEGORIES, JOB_TYPES, splitReq } from "../utils.js";

export default function JobSearch() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    job_type: searchParams.get("job_type") || "",
    category: searchParams.get("category") || "",
    sort_by: searchParams.get("sort_by") || "terbaru",
  });

  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setFilters({
      q: searchParams.get("q") || "",
      location: searchParams.get("location") || "",
      job_type: searchParams.get("job_type") || "",
      category: searchParams.get("category") || "",
      sort_by: searchParams.get("sort_by") || "terbaru",
    });
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setJobs(null);
    setError("");

    api.searchJobs(filters)
      .then((r) => !cancelled && setJobs(r))
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [filters]);

  const updateFilter = (k, v) => {
    const next = { ...filters, [k]: v };
    setFilters(next);
    const p = new URLSearchParams();
    Object.entries(next).forEach(([key, val]) => {
      if (val) p.set(key, val);
    });
    setSearchParams(p);
  };

  const resetFilters = () => {
    const empty = { q: "", location: "", job_type: "", category: "", sort_by: "terbaru" };
    setFilters(empty);
    setSearchParams(new URLSearchParams());
  };

  const isFiltered = Boolean(filters.q || filters.location || filters.job_type || filters.category || filters.sort_by !== "terbaru");
  const hasScore = user?.role === "seeker" && jobs?.some((j) => j.match_score != null);

  return (
    <div className="space-y-6">
      {/* BREADCRUMB (Figma 2:87263) */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>🏠</span> Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#212121]">Pencarian Lowongan</span>
      </nav>

      {/* TOP SEARCH BAR */}
      <div className="rounded-2xl bg-white border border-[#dfe5ec] p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6 relative flex items-center">
            <svg className="absolute left-3.5 h-5 w-5 text-[#616161]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              className="w-full rounded-xl bg-[#F5F5F5] pl-11 pr-4 py-2.5 text-sm text-[#212121] outline-none border border-transparent focus:border-[#1976d2] focus:bg-white"
              placeholder="Cari posisi, keahlian, atau nama perusahaan..."
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
            />
          </div>

          <div className="sm:col-span-4 relative flex items-center">
            <svg className="absolute left-3.5 h-5 w-5 text-[#616161]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              type="text"
              className="w-full rounded-xl bg-[#F5F5F5] pl-11 pr-4 py-2.5 text-sm text-[#212121] outline-none border border-transparent focus:border-[#1976d2] focus:bg-white"
              placeholder="Kota atau Remote..."
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => {}}
              className={`${btnPrimary} w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5`}
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: SIDEBAR FILTER (LEFT) + RESULTS (RIGHT) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* SIDEBAR FILTER (3 COLS) */}
        <aside className="lg:col-span-3 space-y-4">
          <Card className="p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#dfe5ec] pb-3">
              <h3 className="font-bold text-sm text-[#212121] flex items-center gap-2">
                <span>⚡</span> Filter Lowongan
              </h3>
              {isFiltered && (
                <button onClick={resetFilters} className="text-xs text-[#1976d2] font-semibold hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Urutan */}
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-2">Urutkan Hasil</label>
              <select
                className={`${inputCls} text-xs py-2`}
                value={filters.sort_by}
                onChange={(e) => updateFilter("sort_by", e.target.value)}
              >
                <option value="terbaru">Terbaru Dipasang</option>
                <option value="skor" disabled={user?.role !== "seeker"}>Kecocokan CV Tertinggi</option>
              </select>
              {user?.role !== "seeker" && (
                <p className="mt-1 text-[10px] text-[#616161]">Filter skor memerlukan akun pencari kerja</p>
              )}
            </div>

            {/* Tipe Pekerjaan */}
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-2">Tipe Pekerjaan</label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#616161] hover:text-[#212121]">
                  <input
                    type="radio"
                    name="job_type"
                    checked={!filters.job_type}
                    onChange={() => updateFilter("job_type", "")}
                    className="text-[#1976d2]"
                  />
                  <span>Semua Tipe</span>
                </label>
                {JOB_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-[#616161] hover:text-[#212121]">
                    <input
                      type="radio"
                      name="job_type"
                      checked={filters.job_type === t}
                      onChange={() => updateFilter("job_type", t)}
                      className="text-[#1976d2]"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kategori Bidang */}
            <div>
              <label className="block text-xs font-bold text-[#212121] mb-2">Kategori Bidang</label>
              <select
                className={`${inputCls} text-xs py-2`}
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Card>
        </aside>

        {/* RESULTS COLUMN (9 COLS) */}
        <section className="lg:col-span-9 space-y-4">
          <Alert>{error}</Alert>

          {!jobs && !error ? (
            <Spinner text="Mencari lowongan pekerjaan..." />
          ) : jobs && jobs.length === 0 ? (
            <Empty>
              <div className="space-y-2 py-4">
                <p className="font-bold text-base text-[#212121]">Tidak ada lowongan yang sesuai kriteria.</p>
                <p className="text-xs text-[#616161]">Cobalah mengubah filter kata kunci atau reset filter Anda.</p>
                {isFiltered && (
                  <button className={`${btnPrimary} mt-3 text-xs`} onClick={resetFilters}>
                    Tampilkan Semua Lowongan
                  </button>
                )}
              </div>
            </Empty>
          ) : jobs && (
            <>
              <div className="flex items-center justify-between text-xs text-[#616161] px-1">
                <span>Ditemukan <strong>{jobs.length}</strong> lowongan kerja aktif</span>
                {isFiltered && <span className="text-[#1976d2] font-semibold">Filter Aktif Diterapkan</span>}
              </div>

              {user?.role === "seeker" && !hasScore && (
                <div className="rounded-xl bg-[#eaf3fc] border border-[#1976d2]/20 p-3.5 text-xs text-[#1976d2] flex items-center justify-between gap-2">
                  <span>💡 Unggah berkas CV Anda untuk mengaktifkan skor kecocokan otomatis pada setiap lowongan.</span>
                  <Link to="/cv" className="font-bold underline hover:text-[#1565c0] shrink-0">Unggah CV →</Link>
                </div>
              )}

              <div className="space-y-3">
                {jobs.map((j) => (
                  <Link key={j.id} to={`/jobs/${j.id}`} className="block group">
                    <Card className="p-5 transition hover:border-[#1976d2] hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Logo Avatar */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fc] font-bold text-[#1976d2] border border-[#1976d2]/20 text-base">
                            {j.company_name ? j.company_name.charAt(0).toUpperCase() : "P"}
                          </div>

                          <div className="space-y-1">
                            <h2 className="font-bold text-base text-[#212121] group-hover:text-[#1976d2] transition leading-snug">
                              {j.title}
                            </h2>
                            <p className="text-xs font-semibold text-[#1976d2]">{j.company_name}</p>
                            <p className="text-xs text-[#616161] flex flex-wrap items-center gap-2 pt-0.5">
                              <span>📍 {j.location}</span>
                              <span>•</span>
                              <span>🕒 {j.job_type}</span>
                              <span>•</span>
                              <span>📁 {j.category}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match score bar */}
                        <div className="sm:self-start">
                          <ScoreBar score={j.match_score} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#dfe5ec]/60 flex flex-wrap items-center justify-between gap-3">
                        <Tags items={splitReq(j.requirements)} />
                        <span className="text-xs font-semibold text-[#1976d2] group-hover:underline flex items-center gap-1">
                          Lihat Detail Lowongan <span>→</span>
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
