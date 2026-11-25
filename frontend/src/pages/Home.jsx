import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, ScoreBar, Spinner, Tags, btnPrimary } from "../components/ui.jsx";
import { splitReq } from "../utils.js";

const POPULAR_TAGS = ["Front-end Developer", "React", "Node.js", "Remote", "UI/UX", "Quality Assurance"];

const CATEGORIES_DATA = [
  {
    title: "Teknologi Informasi",
    desc: "Frontend, Backend, DevOps, QA",
    icon: (
      <svg className="h-6 w-6 text-[#1976d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>
    ),
  },
  {
    title: "Desain & Kreatif",
    desc: "UI/UX, Grafis, Ilustrator",
    icon: (
      <svg className="h-6 w-6 text-[#ff9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7zm0-10a4 4 0 01-4-4 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-4 4H7z"/>
      </svg>
    ),
  },
  {
    title: "Produk & Manajemen",
    desc: "Product Manager, Scrum, Analis",
    icon: (
      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
    ),
  },
  {
    title: "Pemasaran & Bisnis",
    desc: "Digital Marketing, Sales, CS",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
      </svg>
    ),
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState(null);

  useEffect(() => {
    api.searchJobs({ sort_by: "terbaru" })
      .then((jobs) => setFeaturedJobs((jobs || []).slice(0, 4)))
      .catch(() => setFeaturedJobs([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO PENCARIAN (Figma 2:87104) */}
      <section className="relative rounded-3xl bg-white border border-[#dfe5ec] p-6 sm:p-10 shadow-xs overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            {/* Status / Inception Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf3fc] px-3.5 py-1 text-xs font-bold text-[#1976d2] tracking-wide">
              <span>✦</span> PLATFORM PENCARI KERJA BERBASIS AI
            </div>

            {/* H1 Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold leading-tight text-[#212121]">
              Temukan Pekerjaan Impian Anda dengan Analisis Kecocokan CV
            </h1>

            {/* Description */}
            <p className="text-base text-[#616161] leading-relaxed">
              Jelajahi ratusan lowongan kerja terpercaya dari perusahaan di Indonesia. Sistem AI kami mencocokkan kualifikasi Anda secara instan dan transparan.
            </p>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#616161] pt-1">
              <svg className="h-4 w-4 text-[#1976d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>Lowongan Resmi & Terverifikasi • Gratis untuk Pencari Kerja</span>
            </div>
          </div>

          {/* Right Professional Hero Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#1976d2]/10 via-[#eaf3fc] to-white p-6 border border-[#dfe5ec] shadow-sm relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1976d2] text-white shadow-sm">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#212121]">Smart Matching CV</p>
                  <p className="text-xs text-[#616161]">Kecocokan otomatis 0-100%</p>
                </div>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#dfe5ec]/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#212121]">Skor Kesesuaian Posisi</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">94% Cocok</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-full w-[94%] rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-xs text-[#616161] leading-relaxed">
                  "4 dari 4 keahlian syarat sesuai dengan berkas CV terbaru Anda."
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#1976d2]">
                <span>✨</span>
                <span>Didukung model pencocokan keahlian cerdas</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PENCARIAN LOWONGAN (SEARCH BAR BESAR - Figma 2:87119) */}
        <div className="mt-8 border-t border-[#dfe5ec] pt-8">
          <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-12 bg-[#F5F5F5] p-3 rounded-2xl border border-[#dfe5ec]">
            {/* Input Kata Kunci */}
            <div className="sm:col-span-5 relative flex items-center">
              <svg className="absolute left-3.5 h-5 w-5 text-[#616161]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-[#212121] outline-none border border-transparent focus:border-[#1976d2]"
                placeholder="Posisi, perusahaan, atau keahlian..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Input Lokasi */}
            <div className="sm:col-span-4 relative flex items-center">
              <svg className="absolute left-3.5 h-5 w-5 text-[#616161]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <input
                type="text"
                className="w-full rounded-xl bg-white pl-11 pr-4 py-3 text-sm text-[#212121] outline-none border border-transparent focus:border-[#1976d2]"
                placeholder="Lokasi (Yogyakarta, Remote, dll)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Tombol Cari */}
            <div className="sm:col-span-3">
              <button type="submit" className={`${btnPrimary} w-full py-3 h-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Cari Lowongan
              </button>
            </div>
          </form>

          {/* 3. PENCARIAN POPULER (Figma 2:87136) */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#616161]">Pencarian Populer:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setKeyword(tag); navigate(`/jobs?q=${encodeURIComponent(tag)}`); }}
                className="rounded-full bg-white border border-[#dfe5ec] px-3 py-1 font-medium text-[#616161] hover:border-[#1976d2] hover:text-[#1976d2] transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KATEGORI PEKERJAAN (Figma 2:87144) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#212121]">Jelajahi Berdasarkan Kategori</h2>
          <p className="text-sm text-[#616161]">Pilih industri yang sesuai dengan minat dan spesialisasi keahlian Anda</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.title}
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.title)}`)}
              className="group cursor-pointer rounded-2xl border border-[#dfe5ec] bg-white p-5 transition hover:border-[#1976d2] hover:shadow-md"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F5] group-hover:bg-[#eaf3fc] transition">
                {cat.icon}
              </div>
              <h3 className="font-bold text-[#212121] group-hover:text-[#1976d2] transition">{cat.title}</h3>
              <p className="mt-1 text-xs text-[#616161]">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LOWONGAN PILIHAN (Figma 2:87159 & 2:87165) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#212121]">Lowongan Pilihan</h2>
            <p className="text-sm text-[#616161]">Peluang karir terbaik yang baru saja dibuka dan aktif</p>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-[#1976d2] hover:underline flex items-center gap-1">
            Lihat Semua Lowongan →
          </Link>
        </div>

        {!featuredJobs ? (
          <Spinner text="Memuat lowongan pilihan..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredJobs.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="block">
                <Card className="h-full transition hover:border-[#1976d2] hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      {/* Company logo placeholder */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fc] font-bold text-[#1976d2] border border-[#1976d2]/20">
                        {j.company_name ? j.company_name.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#212121] hover:text-[#1976d2] transition">{j.title}</h3>
                        <p className="text-xs text-[#616161]">{j.company_name}</p>
                      </div>
                    </div>
                    <ScoreBar score={j.match_score} />
                  </div>

                  <p className="mt-3 text-xs text-[#616161] flex items-center gap-2">
                    <span>📍 {j.location}</span>
                    <span>•</span>
                    <span>🕒 {j.job_type}</span>
                    <span>•</span>
                    <span>📁 {j.category}</span>
                  </p>

                  <div className="mt-3">
                    <Tags items={splitReq(j.requirements)} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#dfe5ec]/60 flex items-center justify-between text-xs">
                    <span className="text-[#616161]">Status: <strong className="text-emerald-700">Aktif</strong></span>
                    <span className="font-semibold text-[#1976d2]">Lihat Detail →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 6. LENGKAPI PROFIL BANNER CTA (Figma 2:87252) */}
      <section className="rounded-2xl border border-[#1976d2]/30 bg-gradient-to-r from-[#eaf3fc] to-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-[#212121]">
              Ingin Mengetahui Seberapa Cocok CV Anda?
            </h3>
            <p className="text-sm text-[#616161] max-w-xl">
              Unggah berkas CV Anda (PDF atau DOCX) di menu CV. Sistem akan otomatis menganalisis keahlian dan menampilkan persentase kecocokan pada setiap lowongan.
            </p>
          </div>
          <Link
            to={user ? "/cv" : "/register"}
            className={`${btnPrimary} shrink-0 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md`}
          >
            <span>{user ? "Kelola CV Saya" : "Daftar & Unggah CV"}</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
