import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import JobFields, { validateJob } from "../../components/JobFields.jsx";
import { Alert, Card, ConfirmDialog, Empty, Field, MatchDetail, PageTitle, ScoreBar, Spinner, Tags, btnGhost, btnPrimary, inputCls } from "../../components/ui.jsx";
import { splitReq, validatePoster } from "../../utils.js";

const LOW_CONFIDENCE = 0.75;

export default function ScanPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { scan_id, fields, confidence }
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saved, setSaved] = useState(null);
  const [openId, setOpenId] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const loadSaved = useCallback(() => {
    api.listScans().then(setSaved).catch(() => setSaved([]));
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const discardPending = () => {
    if (result?.scan_id) api.deleteScan(result.scan_id).catch(() => {});
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setForm(null);
    setErrors({});
    setChecked(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const pick = (f) => {
    if (!f) return;
    const err = validatePoster(f);
    if (err) return setMsg({ type: "error", text: err });
    discardPending();
    setMsg({ type: "", text: "" });
    setResult(null);
    setForm(null);
    setChecked(false);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const scan = async () => {
    if (!file) return;
    discardPending();
    setScanning(true);
    setMsg({ type: "", text: "" });
    try {
      const r = await api.scanPoster(file);
      setResult(r);
      setForm({ ...r.fields });
      setChecked(false);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Poster gagal dibaca. Coba foto yang lebih jelas." });
    } finally {
      setScanning(false);
    }
  };

  const cancel = () => {
    discardPending();
    reset();
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flag = (k) => result && result.confidence?.[k] != null && result.confidence[k] < LOW_CONFIDENCE;
  const lowCount = result ? Object.keys(result.confidence || {}).filter(flag).length : 0;

  const askConfirm = (e) => {
    e.preventDefault();
    const errs = validateJob(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      return setMsg({ type: "error", text: "Lengkapi data yang masih kosong sebelum menyimpan." });
    }
    setMsg({ type: "", text: "" });
    setConfirm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.confirmScan(result.scan_id, form);
      setConfirm(false);
      reset();
      await loadSaved();
      setMsg({ type: "success", text: "Lowongan dari poster berhasil disimpan dan dicocokkan dengan CV terbaru Anda." });
    } catch (e) {
      setConfirm(false);
      setMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await api.deleteScan(id);
    loadSaved();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>🏠</span> Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#212121]">Scan Poster AI</span>
      </nav>

      <PageTitle
        title="Scan Poster Lowongan Kerja (AI OCR)"
        subtitle="Foto atau unggah gambar poster lowongan kerja. Sistem AI akan mengekstrak informasi posisi, kualifikasi, dan mencocokkannya dengan CV Anda."
      />

      {/* UPLOAD & SCAN CARD */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-12 items-center">
          {/* Sisi Kiri: Upload Area */}
          <div className="md:col-span-7 space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => pick(e.target.files[0])}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                drag ? "border-[#1976d2] bg-[#eaf3fc]" : "border-[#dfe5ec] bg-[#F5F5F5]"
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1976d2] shadow-xs mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>

              <p className="text-sm font-semibold text-[#212121]">
                {file ? file.name : "Tarik & Lepas Foto Poster Lowongan"}
              </p>
              <p className="mt-1 text-xs text-[#616161]">
                Format file didukung: JPG, PNG, WEBP (maks. 2 MB)
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className={`${btnPrimary} text-xs py-2 px-4`}
                  onClick={() => inputRef.current.click()}
                  disabled={scanning}
                >
                  {file ? "Ganti Gambar Lain" : "Pilih File / Kamera"}
                </button>
                {file && (
                  <button
                    type="button"
                    className={`${btnGhost} text-xs py-2 px-3 text-red-600`}
                    onClick={cancel}
                    disabled={scanning}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {file && (
              <button
                type="button"
                className={`${btnPrimary} w-full py-3 text-sm font-semibold shadow-sm flex items-center justify-center gap-2`}
                onClick={scan}
                disabled={scanning}
              >
                <span>✨</span>
                <span>{scanning ? "AI Sedang Mengekstrak Teks Poster..." : result ? "Ekstrak / Scan Ulang" : "Ekstrak Informasi dengan AI"}</span>
              </button>
            )}
          </div>

          {/* Sisi Kanan: Preview Gambar */}
          <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-[#F5F5F5] border border-[#dfe5ec] p-4 min-h-[220px]">
            {preview ? (
              <img
                src={preview}
                alt="Pratinjau Poster"
                className="max-h-64 rounded-xl object-contain shadow-xs"
              />
            ) : (
              <div className="text-center space-y-2 text-[#616161]">
                <span className="text-3xl block">🖼️</span>
                <p className="text-xs">Pratinjau gambar poster akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>

        {scanning && <Spinner text="AI sedang membaca posisi, persyaratan keahlian, dan kontak..." />}
      </Card>

      <Alert type={msg.type}>{msg.text}</Alert>

      {/* FORM REVIEW HASIL SCAN */}
      {form && (
        <Card className="p-6 sm:p-8 space-y-5 border-2 border-[#1976d2]/30 bg-white">
          <div className="border-b border-[#dfe5ec] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1976d2] text-white text-xs font-bold">1</span>
              <h2 className="text-lg font-bold text-[#212121]">Periksa Hasil Ekstraksi AI</h2>
            </div>
            <p className="mt-1 text-xs text-[#616161]">
              Data di bawah diekstrak dari gambar poster. Anda dapat mengedit dan melengkapi informasi sebelum disimpan ke daftar Anda.
              {lowCount > 0 && (
                <span className="block mt-1 font-semibold text-amber-700">
                  ⚠️ Ada {lowCount} kolom ditandai kuning dengan keyakinan AI rendah. Mohon periksa kembali.
                </span>
              )}
            </p>
          </div>

          <form onSubmit={askConfirm} noValidate className="space-y-4">
            <JobFields
              form={form}
              set={setField}
              errors={errors}
              flag={flag}
              extra={
                <Field label="Nama Perusahaan">
                  <input
                    className={inputCls}
                    placeholder="Contoh: PT Nusantara Digital"
                    value={form.company_name || ""}
                    onChange={(e) => setField("company_name", e.target.value)}
                  />
                </Field>
              }
            />

            <div className="rounded-xl bg-[#eaf3fc] p-3.5 border border-[#1976d2]/20">
              <label className="flex items-start gap-2.5 text-xs text-[#212121] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-[#1976d2]"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <span className="leading-relaxed">
                  Saya telah memeriksa data di atas dan menyatakan informasi telah sesuai dengan poster lowongan kerja.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button className={`${btnPrimary} font-semibold text-xs py-2 px-5`} disabled={!checked || saving}>
                {saving ? "Menyimpan..." : "Simpan ke Daftar Saya & Cocokkan CV"}
              </button>
              <button type="button" className={`${btnGhost} text-xs py-2 px-4`} onClick={cancel}>
                Batalkan
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* DAFTAR LOWONGAN DARI SCAN POSTER TERSIMPAN */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#212121]">Lowongan Tersimpan dari Scan Poster</h2>
        <p className="text-xs text-[#616161]">Lowongan yang pernah Anda foto dan simpan untuk analisis kecocokan CV.</p>

        {!saved ? (
          <Spinner text="Memuat riwayat poster tersimpan..." />
        ) : saved.length === 0 ? (
          <Empty>
            <div className="space-y-2 py-4">
              <p className="font-semibold text-base text-[#212121]">Belum ada lowongan yang disimpan dari poster.</p>
              <p className="text-xs text-[#616161]">Foto poster lowongan kerja di jalan atau kampus untuk mencocokkannya dengan CV Anda.</p>
            </div>
          </Empty>
        ) : (
          <div className="space-y-3">
            {saved.map((s) => (
              <Card key={s.id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-base text-[#212121]">{s.job.title}</p>
                    <p className="text-xs font-semibold text-[#1976d2]">{s.job.company_name || "Perusahaan Tidak Disebutkan"}</p>
                    <p className="text-xs text-[#616161]">
                      📍 {s.job.location} • 🕒 {s.job.job_type} • 📁 {s.job.category}
                    </p>
                    {s.job.contact_info && (
                      <p className="text-xs text-[#616161]">📞 Kontak: {s.job.contact_info}</p>
                    )}
                  </div>
                  <ScoreBar score={s.match_score} />
                </div>

                <div className="pt-2 border-t border-[#dfe5ec]/60 flex flex-wrap items-center justify-between gap-2">
                  <Tags items={splitReq(s.job.requirements)} highlight={s.match?.matched_skills || []} />
                  <div className="flex items-center gap-2">
                    {s.match && (
                      <button
                        className={`${btnGhost} text-xs py-1.5 px-3 font-semibold`}
                        onClick={() => setOpenId(openId === s.id ? "" : s.id)}
                      >
                        {openId === s.id ? "Tutup Detail" : "Detail Kecocokan"}
                      </button>
                    )}
                    <button
                      className={`${btnGhost} text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold`}
                      onClick={() => remove(s.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {openId === s.id && (
                  <div className="mt-3 rounded-xl bg-[#F5F5F5] p-4 border border-[#dfe5ec]">
                    <MatchDetail match={s.match} label="Kesesuaian dengan CV Terbaru Anda" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        busy={saving}
        title="Simpan Lowongan Kerja Ini?"
        confirmText="Ya, Simpan"
        message={`Lowongan "${form?.title}" akan disimpan ke daftar Anda dan langsung dihitung skor kecocokannya dengan berkas CV terbaru.`}
        onConfirm={save}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
