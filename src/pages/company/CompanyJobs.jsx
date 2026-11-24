import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { Alert, Card, ConfirmDialog, Empty, PageTitle, Spinner, Tags, btnGhost, btnPrimary } from "../../components/ui.jsx";
import { splitReq } from "../../utils.js";

export default function CompanyJobs() {
  const [jobs, setJobs] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => api.myJobs().then(setJobs).catch((e) => setMsg({ type: "error", text: e.message })), []);
  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    setDeleting(true);
    try { await api.deleteJob(toDelete.id); setMsg({ type: "success", text: "Lowongan dihapus" }); await load(); }
    catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setDeleting(false); setToDelete(null); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Lowongan Saya" subtitle="Pasang dan kelola lowongan perusahaanmu."
        action={<Link to="/company/jobs/new" className={btnPrimary}>+ Pasang lowongan</Link>} />
      <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>
      {!jobs ? <Spinner /> : jobs.length === 0 ? <Empty>Belum ada lowongan. Pasang lowongan pertamamu.</Empty> : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <Card key={j.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{j.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${j.status === "aktif" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}>{j.status}</span></h2>
                  <p className="text-xs text-slate-500">{j.location} • {j.job_type} • {j.category}</p>
                </div>
                <Link to={`/company/jobs/${j.id}/applicants`} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {j.applicant_count} pelamar
                </Link>
              </div>
              <div className="mt-3"><Tags items={splitReq(j.requirements)} /></div>
              <div className="mt-4 flex gap-2">
                <Link to={`/company/jobs/${j.id}/applicants`} className={btnPrimary}>Lihat pelamar</Link>
                <Link to={`/company/jobs/${j.id}/edit`} className={btnGhost}>Edit</Link>
                <button className={`${btnGhost} text-red-600`} onClick={() => setToDelete(j)}>Hapus</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!toDelete} danger busy={deleting} title="Hapus lowongan?" confirmText="Hapus"
        message={`"${toDelete?.title}" beserta ${toDelete?.applicant_count ?? 0} lamaran di dalamnya akan dihapus permanen.`}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
