import { useState } from "react";

export const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100";
export const btn = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-indigo-600 text-white hover:bg-indigo-700`;
export const btnGhost = `${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-100`;
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;

export function Card({ className = "", children }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const Alert = ({ type = "error", children }) =>
  children ? (
    <div className={`rounded-lg px-3 py-2 text-sm ${type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`} role="alert">
      {children}
    </div>
  ) : null;

export const Spinner = ({ text = "Memuat..." }) => (
  <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
    {text}
  </div>
);

export const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">{children}</div>
);

const statusColor = {
  Dikirim: "bg-slate-100 text-slate-700",
  Ditinjau: "bg-amber-100 text-amber-800",
  Diterima: "bg-green-100 text-green-800",
  Ditolak: "bg-red-100 text-red-800",
};
export const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[status] || statusColor.Dikirim}`}>{status}</span>
);

export function ScoreBar({ score, label = "Kecocokan" }) {
  if (score == null) return null;
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="min-w-32">
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function Tags({ items = [], highlight = [] }) {
  const hl = new Set(highlight.map((h) => h.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={`rounded-md px-2 py-0.5 text-xs ${hl.has(t.toLowerCase()) ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{t}</span>
      ))}
    </div>
  );
}

// Input tag: ketik lalu Enter atau koma.
export function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setText("");
  };
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
      <div className="mb-1 flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
            {t}
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(value.filter((v) => v !== t))}>×</button>
          </span>
        ))}
      </div>
      <input
        className="w-full bg-transparent px-1 py-1 text-sm outline-none"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}

// Dialog konfirmasi (dipakai untuk hapus dan konfirmasi sebelum simpan).
export function ConfirmDialog({ open, title, message, confirmText = "Ya", danger, busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btnGhost} onClick={onCancel} disabled={busy}>Batal</button>
          <button className={danger ? btnDanger : btnPrimary} onClick={onConfirm} disabled={busy}>
            {busy ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hasil pencocokan CV dan lowongan (tabel match_results): skor, keahlian cocok, keahlian kurang, ringkasan.
export function MatchDetail({ match, label = "Kecocokan dengan CV terbaru" }) {
  if (!match) return null;
  return (
    <div className="space-y-3">
      <ScoreBar score={match.score} label={label} />
      {match.matched_skills?.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-slate-500">Sudah sesuai</p>
          <Tags items={match.matched_skills} highlight={match.matched_skills} />
        </div>
      )}
      {match.missing_skills?.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-slate-500">Belum ada di CV</p>
          <div className="flex flex-wrap gap-1.5">
            {match.missing_skills.map((t) => <span key={t} className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{t}</span>)}
          </div>
        </div>
      )}
      {match.summary && <p className="text-xs text-slate-500">{match.summary}</p>}
    </div>
  );
}
