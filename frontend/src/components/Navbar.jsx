import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK } from "../api/client.js";
import { btnGhost, btnPrimary } from "./ui.jsx";
import { displayName } from "../utils.js";

const link = ({ isActive }) =>
  `rounded-lg px-3.5 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-[#eaf3fc] text-[#1976d2] font-semibold"
      : "text-[#616161] hover:text-[#212121] hover:bg-slate-100/80"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const profilePath = user?.role === "company" ? "/company/profile" : "/profile";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfe5ec] bg-white/95 backdrop-blur-xs shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand Logo with Briefcase Icon */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1976d2] text-white shadow-xs group-hover:bg-[#1565c0] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1976d2]">SI Lowongan Kerja</span>
        </Link>

        {/* Center Navigation Links (Menu Profil SUDAH DIHAPUS dari sini) */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink end to="/" className={link}>Beranda</NavLink>
          {user?.role !== "company" && <NavLink to="/jobs" className={link}>Cari Lowongan</NavLink>}
          {user?.role === "seeker" && (
            <>
              <NavLink to="/scan" className={link}>Scan Poster</NavLink>
              <NavLink to="/applications" className={link}>Lamaran Saya</NavLink>
              <NavLink to="/cv" className={link}>CV</NavLink>
            </>
          )}
          {user?.role === "company" && (
            <>
              <NavLink to="/company/jobs" className={link}>Lowongan Saya</NavLink>
            </>
          )}
        </nav>

        {/* Right side: Mock badge, Notification bell & User Profile Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {USE_MOCK && (
            <span className="hidden sm:inline-block rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Mode Mock
            </span>
          )}

          {user ? (
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* Notification icon */}
              <button
                type="button"
                aria-label="Notifikasi"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[#616161] hover:bg-slate-100 hover:text-[#212121] transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* FOTO PROFIL (AVATAR) - KLIK UNTUK MENUJU PAGE PROFIL */}
              <Link
                to={profilePath}
                title="Buka Halaman Profil"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1976d2] text-sm font-bold text-white shadow-xs ring-2 ring-transparent group-hover:ring-[#1976d2]/30 transition">
                  {displayName(user).charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs pr-1">
                  <p className="font-semibold text-[#212121] leading-tight group-hover:text-[#1976d2] transition">
                    {displayName(user)}
                  </p>
                  <p className="text-[11px] text-[#616161] capitalize">
                    {user.role === "company" ? "Perusahaan" : "Pencari Kerja"}
                  </p>
                </div>
              </Link>

              {/* Dropdown Chevron toggle for quick actions */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu akun"
                className="p-1 rounded-md text-[#616161] hover:text-[#212121] hover:bg-slate-100 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Account Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[#dfe5ec] bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1">
                  <div className="border-b border-[#dfe5ec] px-3 py-2.5 mb-1">
                    <p className="text-xs font-bold text-[#212121] truncate">{displayName(user)}</p>
                    <p className="text-[11px] text-[#616161] truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-[#eaf3fc] px-2 py-0.5 text-[10px] font-semibold text-[#1976d2]">
                      {user.role === "company" ? "Akun Perusahaan" : "Akun Pencari Kerja"}
                    </span>
                  </div>

                  <Link
                    to={profilePath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#212121] hover:bg-[#eaf3fc] hover:text-[#1976d2] transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Buka Halaman Profil
                  </Link>

                  {user.role === "seeker" && (
                    <Link
                      to="/cv"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#212121] hover:bg-[#eaf3fc] hover:text-[#1976d2] transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Kelola Berkas CV
                    </Link>
                  )}

                  <div className="border-t border-[#dfe5ec] my-1 pt-1">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar dari Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className={btnGhost}>Masuk</Link>
              <Link to="/register" className={btnPrimary}>Daftar</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Links Strip (hanya tampil di layar kecil < md) */}
      <div className="flex md:hidden overflow-x-auto border-t border-[#dfe5ec] px-4 py-2 gap-1 bg-[#f5f5f5]/60 text-xs">
        <NavLink end to="/" className={link}>Beranda</NavLink>
        {user?.role !== "company" && <NavLink to="/jobs" className={link}>Cari Lowongan</NavLink>}
        {user?.role === "seeker" && (
          <>
            <NavLink to="/scan" className={link}>Scan Poster</NavLink>
            <NavLink to="/applications" className={link}>Lamaran Saya</NavLink>
            <NavLink to="/cv" className={link}>CV</NavLink>
          </>
        )}
        {user?.role === "company" && (
          <NavLink to="/company/jobs" className={link}>Lowongan Saya</NavLink>
        )}
      </div>
    </header>
  );
}
