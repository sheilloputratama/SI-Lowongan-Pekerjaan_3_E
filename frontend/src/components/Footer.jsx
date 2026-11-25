import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#dfe5ec] bg-white py-8 text-sm text-[#616161]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1976d2] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>
          </div>
          <p className="font-semibold text-[#212121]">SI Lowongan Kerja</p>
          <span className="text-slate-300">•</span>
          <p className="text-xs">Sistem Informasi Lowongan Kerja Berbasis Web & AI</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#616161]">
          <Link to="/" className="hover:text-[#1976d2] transition">Beranda</Link>
          <Link to="/jobs" className="hover:text-[#1976d2] transition">Cari Lowongan</Link>
          <Link to="/scan" className="hover:text-[#1976d2] transition">Scan Poster AI</Link>
          <span className="text-slate-300">•</span>
          <span>© 2026 Kelompok 3 E. Hak cipta dilindungi.</span>
        </div>
      </div>
    </footer>
  );
}
