import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK } from "../api/client.js";
import { btnGhost, btnPrimary } from "./ui.jsx";
import { displayName } from "../utils.js";

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm ${isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-lg font-bold text-indigo-700">LowonganAI</Link>
        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {user?.role !== "company" && <NavLink end to="/" className={link}>Cari SI Lowongan Kerja</NavLink>}
          {user?.role === "seeker" && (
            <>
              <NavLink to="/scan" className={link}>Scan Poster</NavLink>
              <NavLink to="/applications" className={link}>Lamaran Saya</NavLink>
              <NavLink to="/cv" className={link}>CV</NavLink>
              <NavLink to="/profile" className={link}>Profil</NavLink>
            </>
          )}
          {user?.role === "company" && (
            <>
              <NavLink to="/company/jobs" className={link}>SI Lowongan Kerja Saya</NavLink>
              <NavLink to="/company/profile" className={link}>Profil Perusahaan</NavLink>
            </>
          )}
        </nav>
        {USE_MOCK && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Mode mock</span>}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{displayName(user)}</span>
            <button className={btnGhost} onClick={onLogout}>Keluar</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className={btnGhost}>Masuk</Link>
            <Link to="/register" className={btnPrimary}>Daftar</Link>
          </div>
        )}
      </div>
    </header>
  );
}



