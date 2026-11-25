import { useState } from "react";

export const inputCls = "w-full rounded-lg border border-[#dfe5ec] bg-white px-3 py-2 text-sm text-[#212121] focus:border-[#1976d2] focus:outline-none focus:ring-2 focus:ring-[#1976d2]/20 disabled:bg-[#f5f5f5]";
export const btn = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-[#1976d2] text-white hover:bg-[#1565c0] shadow-sm`;
export const btnGhost = `${btn} border border-[#dfe5ec] bg-white text-[#212121] hover:bg-[#f5f5f5]`;
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;
export const btnAccent = `${btn} bg-[#ff9800] text-white hover:bg-[#f57c00] shadow-sm`;

export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-[#dfe5ec] bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#616161]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#212121]">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-[#616161]">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const Alert = ({ type = "error", children }) =>
  children ? (
    <div className={`rounded-lg px-3 py-2 text-sm ${type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`} role="alert">
      {children}
    </div>
  ) : null;

export const Spinner = ({ text = "Memuat..." }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#616161]">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#1976d2]" />
    {text}
  </div>
);

export const Empty = ({ children }) => (
  <div className="rounded-2xl border border-dashed border-[#dfe5ec] bg-white py-12 text-center text-sm text-[#616161]">{children}</div>
);

const statusColor = {
  Dikirim: "bg-slate-100 text-slate-700",
  Ditinjau: "bg-amber-100 text-amber-800",
  Diterima: "bg-emerald-100 text-emerald-800",
  Ditolak: "bg-red-100 text-red-800",
};
export const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[status] || statusColor.Dikirim}`}>{status}</span>
);

export function ScoreBar({ score, label = "Kecocokan" }) {
  if (score == null) return null;
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-[#ff9800]" : "bg-red-400";
  return (
    <div className="min-w-32">
      <div className="mb-1 flex justify-between text-xs text-[#616161]">
        <span>{label}</span>
        <span className="font-bold text-[#212121]">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 border border-[#dfe5ec]/60">
        <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function Tags({ items = [], highlight = [] }) {
  const hl = new Set(highlight.map((h) => h.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={`rounded-md px-2 py-0.5 text-xs font-medium ${hl.has(t.toLowerCase()) ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-[#616161]"}`}>{t}</span>
      ))}
    </div>
  );
}

export function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setText("");
  };
  return (
    <div className="rounded-lg border border-[#dfe5ec] bg-white p-2 focus-within:border-[#1976d2] focus-within:ring-2 focus-within:ring-[#1976d2]/20">
      <div className="mb-1 flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-[#eaf3fc] px-2 py-0.5 text-xs font-medium text-[#1976d2]">
            {t}
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(value.filter((v) => v !== t))} className="hover:text-red-500 font-bold">×</button>
          </span>
        ))}
      </div>
      <input
        className="w-full bg-transparent px-1 py-1 text-sm outline-none text-[#212121]"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmText = "Ya", danger, busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#dfe5ec]">
        <h2 className="text-lg font-bold text-[#212121]">{title}</h2>
        <p className="mt-2 text-sm text-[#616161]">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className={btnGhost} onClick={onCancel} disabled={busy}>Batal</button>
          <button className={danger ? btnDanger : btnPrimary} onClick={onConfirm} disabled={busy}>
            {busy ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MatchDetail({ match, label = "Kecocokan dengan CV terbaru" }) {
  if (!match) return null;
  return (
    <div className="space-y-3">
      <ScoreBar score={match.score} label={label} />
      {match.matched_skills?.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-emerald-700">Sudah sesuai (Keahlian Cocok)</p>
          <Tags items={match.matched_skills} highlight={match.matched_skills} />
        </div>
      )}
      {match.missing_skills?.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-[#ff9800]">Belum ada di CV</p>
          <div className="flex flex-wrap gap-1.5">
            {match.missing_skills.map((t) => <span key={t} className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-800">{t}</span>)}
          </div>
        </div>
      )}
      {match.summary && <p className="text-xs text-[#616161] bg-[#f5f5f5] p-2 rounded-lg border border-[#dfe5ec]">{match.summary}</p>}
    </div>
  );
}
