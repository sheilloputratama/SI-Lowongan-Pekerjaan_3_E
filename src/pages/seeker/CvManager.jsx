import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/client.js";
import { Alert, Card, ConfirmDialog, Empty, PageTitle, Spinner, btnGhost, btnPrimary } from "../../components/ui.jsx";
import { fmtDate, validateCv } from "../../utils.js";

export default function CvManager() {
  const [cvs, setCvs] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(() => api.listCvs().then(setCvs).catch((e) => setMsg({ type: "error", text: e.message })), []);
  useEffect(() => { load(); }, [load]);

  const upload = async (file) => {
    if (!file) return;
    const err = validateCv(file);
    if (err) return setMsg({ type: "error", text: err });
    setUploading(true); setMsg({ type: "", text: "" });
    try {
      await api.uploadCv(file);
      setMsg({ type: "success", text: `${file.name} berhasil diunggah` });
      await load();
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await api.deleteCv(toDelete.id); setMsg({ type: "success", text: "CV dihapus" }); await load(); }
    catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setDeleting(false); setToDelete(null); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="CV Saya" subtitle="Unggah CV berformat PDF atau DOCX (maks. 2 MB). CV terbaru dipakai untuk menghitung kecocokan dengan lowongan." />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
        className={`mb-4 rounded-xl border-2 border-dashed p-8 text-center ${drag ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white"}`}
      >
        <p className="text-sm text-slate-600">Tarik file CV ke sini, atau</p>
        <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => upload(e.target.files[0])} />
        <button className={`${btnPrimary} mt-3`} disabled={uploading} onClick={() => inputRef.current.click()}>
          {uploading ? "Mengunggah dan membaca CV..." : "Pilih file"}
        </button>
      </div>

      <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>

      {!cvs ? <Spinner /> : cvs.length === 0 ? <Empty>Belum ada CV. Unggah CV pertama kamu.</Empty> : (
        <div className="space-y-3">
          {cvs.map((cv, i) => (
            <Card key={cv.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{cv.file_name}</p>
                <p className="text-xs text-slate-500">{cv.file_type.toUpperCase()} • diunggah {fmtDate(cv.uploaded_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {i === 0 && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Dipakai untuk pencocokan</span>}
                <button className={`${btnGhost} text-red-600`} onClick={() => setToDelete(cv)}>Hapus</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!toDelete} danger busy={deleting} title="Hapus CV?" confirmText="Hapus"
        message={`File "${toDelete?.file_name}" akan dihapus permanen.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
