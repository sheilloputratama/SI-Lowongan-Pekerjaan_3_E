import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, ConfirmDialog, ScoreBar, Spinner, Tags, btnPrimary, inputCls } from "../components/ui.jsx";
import { fmtDate } from "../utils.js";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [cvId, setCvId] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getJob(id).then(setJob).catch((e) => setMsg({ type: "error", text: e.message }));
  }, [id]);

  useEffect(() => {
    if (user?.role !== "seeker") return;
    api.listCvs().then((list) => { setCvs(list); setCvId(list.find((c) => c.active)?.id || list[0]?.id || ""); }).catch(() => {});
  }, [user]);

  const submit = async () => {
    setBusy(true);
    try {
      await api.apply(id, { cvId, note });
      setJob({ ...job, applied: true });
      setMsg({ type: "success", text: "Lamaran berhasil dikirim. Pantau statusnya di menu Lamaran Saya." });
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setBusy(false); setConfirm(false); }
  };

  if (!job) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner />;
  const expired = new Date(job.deadline) < new Date(new Date().toDateString());

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Link to="/" className="text-sm text-indigo-600">← Kembali ke pencarian</Link>
        <Card className="mt-3">
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="text-slate-600">{job.companyName}</p>
          <p className="mt-2 text-sm text-slate-500">{job.location} • {job.type} • {job.level}{job.salary ? ` • ${job.salary}` : ""}</p>
          <h2 className="mt-5 font-medium">Deskripsi</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{job.description}</p>
          <h2 className="mt-5 font-medium">Keahlian yang dibutuhkan</h2>
          <div className="mt-2"><Tags items={job.requirements} /></div>
          <p className="mt-5 text-xs text-slate-400">Batas lamaran: {fmtDate(job.deadline)}</p>
        </Card>
      </div>

      <div>
        <Card className="space-y-4">
          <ScoreBar score={job.score} label="Kecocokan dengan CV aktif" />
          {!user && <p className="text-sm text-slate-600"><Link to="/login" state={{ from: `/jobs/${id}` }} className="font-medium text-indigo-600">Masuk</Link> sebagai pencari kerja untuk melamar.</p>}
          {user?.role === "company" && <p className="text-sm text-slate-500">Akun perusahaan tidak bisa melamar.</p>}
          {user?.role === "seeker" && (
            job.applied ? <Alert type="success">Kamu sudah melamar lowongan ini.</Alert>
            : expired ? <Alert>Lowongan ini sudah ditutup.</Alert>
            : cvs.length === 0 ? <p className="text-sm text-slate-600">Kamu belum punya CV. <Link to="/cv" className="font-medium text-indigo-600">Unggah CV</Link> dulu.</p>
            : (
              <>
                <label className="block text-sm font-medium">Pilih CV
                  <select className={`${inputCls} mt-1`} value={cvId} onChange={(e) => setCvId(e.target.value)}>
                    {cvs.map((c) => <option key={c.id} value={c.id}>{c.name}{c.active ? " (aktif)" : ""}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium">Catatan (opsional)
                  <textarea rows={3} className={`${inputCls} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
                </label>
                <button className={`${btnPrimary} w-full`} onClick={() => setConfirm(true)}>Lamar sekarang</button>
              </>
            )
          )}
          <Alert type={msg.type}>{msg.text}</Alert>
        </Card>
      </div>

      <ConfirmDialog open={confirm} busy={busy} title="Kirim lamaran?" confirmText="Kirim"
        message={`Lamaran untuk "${job.title}" akan dikirim ke ${job.companyName} dengan CV yang dipilih.`}
        onConfirm={submit} onCancel={() => setConfirm(false)} />
    </div>
  );
}
