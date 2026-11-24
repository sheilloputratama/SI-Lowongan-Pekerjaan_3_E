import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/client.js";
import JobFields, { validateJob } from "../../components/JobFields.jsx";
import { Alert, Card, ConfirmDialog, Empty, Field, MatchDetail, PageTitle, ScoreBar, Spinner, Tags, btnGhost, btnPrimary, inputCls } from "../../components/ui.jsx";
import { splitReq, validatePoster } from "../../utils.js";

const LOW_CONFIDENCE = 0.75;

export default function ScanPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { scan_id, fields, confidence }  (poster_scans.status = pending)
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saved, setSaved] = useState(null);
  const [openId, setOpenId] = useState("");
  const inputRef = useRef(null);

  const loadSaved = useCallback(() => api.listScans().then(setSaved).catch(() => setSaved([])), []);
  useEffect(() => { loadSaved(); }, [loadSaved]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Buang hasil scan yang belum dikonfirmasi (scan pending) agar tidak menumpuk di server.
  const discardPending = () => { if (result?.scan_id) api.deleteScan(result.scan_id).catch(() => {}); };

  const reset = () => {
    setFile(null); setPreview(""); setResult(null); setForm(null);
    setErrors({}); setChecked(false); if (inputRef.current) inputRef.current.value = "";
  };

  const pick = (f) => {
    if (!f) return;
    const err = validatePoster(f);
    if (err) return setMsg({ type: "error", text: err });
    discardPending();
    setMsg({ type: "", text: "" }); setResult(null); setForm(null); setChecked(false);
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const scan = async () => {
    discardPending();
    setScanning(true); setMsg({ type: "", text: "" });
    try {
      const r = await api.scanPoster(file);
      setResult(r); setForm({ ...r.fields }); setChecked(false);
    } catch (e) { setMsg({ type: "error", text: e.message || "Poster gagal dibaca. Coba foto yang lebih jelas." }); }
    finally { setScanning(false); }
  };

  const cancel = () => { discardPending(); reset(); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flag = (k) => result && result.confidence?.[k] != null && result.confidence[k] < LOW_CONFIDENCE;
  const lowCount = result ? Object.keys(result.confidence || {}).filter(flag).length : 0;

  const askConfirm = (e) => {
    e.preventDefault();
    const errs = validateJob(form);
    setErrors(errs);
    if (Object.keys(errs).length) return setMsg({ type: "error", text: "Lengkapi data yang masih kosong sebelum menyimpan." });
    setMsg({ type: "", text: "" }); setConfirm(true);
  };

  // Konfirmasi: poster_scans pending -> confirmed, dan SI Lowongan Kerja (jobs, source=poster) baru dibuat di sini.
  const save = async () => {
    setSaving(true);
    try {
      await api.confirmScan(result.scan_id, form);
      setConfirm(false); reset(); await loadSaved();
      setMsg({ type: "success", text: "SI Lowongan Kerja dari poster disimpan dan dicocokkan dengan CV terbaru kamu." });
    } catch (e) { setConfirm(false); setMsg({ type: "error", text: e.message }); }
    finally { setSaving(false); }
  };

  const remove = async (id) => { await api.deleteScan(id); loadSaved(); };

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Scan Poster SI Lowongan Kerja" subtitle="Foto atau unggah poster, AI membaca isinya, kamu periksa, lalu dicocokkan dengan CV." />

      <Card className="mb-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            {/* capture="environment" membuka kamera belakang di HP */}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(e) => pick(e.target.files[0])} />
            <div className="flex flex-wrap gap-2">
              <button className={btnPrimary} onClick={() => inputRef.current.click()} disabled={scanning}>{file ? "Ganti gambar" : "Foto / pilih gambar"}</button>
              {file && <button className={btnGhost} onClick={cancel} disabled={scanning}>Hapus</button>}
            </div>
            <p className="mt-2 text-xs text-slate-500">JPG, PNG, atau WEBP, maks. 2 MB. Pastikan teks poster terbaca jelas.</p>
            {file && (
              <button className={`${btnPrimary} mt-4 w-full`} onClick={scan} disabled={scanning}>
                {scanning ? "AI sedang membaca poster..." : result ? "Scan ulang" : "Scan dengan AI"}
              </button>
            )}
          </div>
          <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {preview ? <img src={preview} alt="Poster SI Lowongan Kerja" className="max-h-72 object-contain" /> : <span className="text-sm text-slate-400">Pratinjau poster</span>}
          </div>
        </div>
        {scanning && <Spinner text="Mengekstrak posisi, syarat, dan kontak..." />}
      </Card>

      <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>

      {form && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold">Periksa hasil pembacaan AI</h2>
          <p className="mb-4 text-sm text-slate-500">
            Data di bawah belum disimpan. Perbaiki bila ada yang salah.
            {lowCount > 0 && <span className="text-amber-700"> {lowCount} kolom ditandai kuning karena AI kurang yakin.</span>}
          </p>
          <form onSubmit={askConfirm} noValidate className="space-y-4">
            <JobFields form={form} set={set} errors={errors} flag={flag}
              extra={
                <Field label="Perusahaan">
                  <input className={inputCls} value={form.company_name || ""} onChange={(e) => set("company_name", e.target.value)} />
                </Field>
              } />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              Saya sudah memeriksa dan data di atas sesuai dengan poster.
            </label>
            <div className="flex gap-2">
              <button className={btnPrimary} disabled={!checked}>Simpan SI Lowongan Kerja</button>
              <button type="button" className={btnGhost} onClick={cancel}>Batalkan</button>
            </div>
          </form>
        </Card>
      )}

      <h2 className="mb-3 text-lg font-semibold">SI Lowongan Kerja dari poster</h2>
      {!saved ? <Spinner /> : saved.length === 0 ? <Empty>Belum ada SI Lowongan Kerja yang disimpan dari poster.</Empty> : (
        <div className="space-y-3">
          {saved.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.job.title}</p>
                  <p className="text-sm text-slate-600">{s.job.company_name || "Perusahaan tidak disebutkan"} • {s.job.location}</p>
                  <p className="text-xs text-slate-500">{s.job.job_type} • {s.job.category}</p>
                  {s.job.contact_info && <p className="mt-1 text-xs text-slate-500">Kontak: {s.job.contact_info}</p>}
                </div>
                <ScoreBar score={s.match_score} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Tags items={splitReq(s.job.requirements)} highlight={s.match?.matched_skills || []} />
                <div className="flex shrink-0 gap-2">
                  {s.match && <button className={btnGhost} onClick={() => setOpenId(openId === s.id ? "" : s.id)}>{openId === s.id ? "Tutup" : "Detail"}</button>}
                  <button className={`${btnGhost} text-red-600`} onClick={() => remove(s.id)}>Hapus</button>
                </div>
              </div>
              {openId === s.id && <div className="mt-3 rounded-lg bg-slate-50 p-3"><MatchDetail match={s.match} /></div>}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirm} busy={saving} title="Simpan SI Lowongan Kerja ini?" confirmText="Ya, simpan"
        message={`"${form?.title}" akan disimpan ke daftarmu dan dicocokkan dengan CV terbaru.`}
        onConfirm={save} onCancel={() => setConfirm(false)} />
    </div>
  );
}



