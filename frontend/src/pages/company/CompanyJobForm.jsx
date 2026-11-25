import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import JobFields, { validateJob } from "../../components/JobFields.jsx";
import { Alert, Card, Field, PageTitle, Spinner, btnGhost, btnPrimary, inputCls } from "../../components/ui.jsx";
import { JOB_STATUSES } from "../../utils.js";

const BLANK = { title: "", location: "", job_type: "", category: "", contact_info: "", description: "", requirements: "", status: "aktif" };

export default function CompanyJobForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(editing ? null : BLANK);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) api.getMyJob(id).then(setForm).catch((e) => setError(e.message));
  }, [id, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateJob(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError("");
    try {
      editing ? await api.updateJob(id, form) : await api.createJob(form);
      navigate("/company/jobs");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (!form) return error ? <Alert>{error}</Alert> : <Spinner text="Memuat data lowongan..." />;

  return (
    <div className="space-y-6">
      {/* BREADCRUMB (Figma 2:88088) */}
      <nav className="flex items-center gap-2 text-xs text-[#616161]">
        <Link to="/company/jobs" className="hover:text-[#1976d2] transition flex items-center gap-1">
          <span>←</span> Kembali ke Lowongan Saya
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#212121]">
          {editing ? "Edit Lowongan" : "Pasang Lowongan Baru"}
        </span>
      </nav>

      <PageTitle
        title={editing ? `Edit Lowongan: ${form.title || ""}` : "Pasang Lowongan Pekerjaan Baru"}
        subtitle="Lengkapi rincian posisi, kriteria kualifikasi, dan keahlian yang dicari untuk mencocokkan kandidat."
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* MAIN FORM COLUMN (8 COLS) */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-6" noValidate>
              <JobFields
                form={form}
                set={set}
                errors={errors}
                extra={
                  <Field label="Status Publikasi" hint="Lowongan dengan status ditutup tidak akan tampil pada pencarian publik">
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) => set("status", e.target.value)}
                    >
                      {JOB_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s === "aktif" ? "● Aktif Ditayangkan" : "Ditutup"}
                        </option>
                      ))}
                    </select>
                  </Field>
                }
              />

              <Alert>{error}</Alert>

              <div className="pt-4 border-t border-[#dfe5ec] flex items-center justify-end gap-3">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => navigate("/company/jobs")}
                  disabled={busy}
                >
                  Batal
                </button>
                <button
                  className={`${btnPrimary} px-6 py-2.5 font-semibold text-sm`}
                  disabled={busy}
                >
                  {busy ? "Menyimpan Lowongan..." : editing ? "Simpan Perubahan" : "Publikasikan Lowongan"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* SIDEBAR PANDUAN PENULISAN (Figma 2:88088) */}
        <aside className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3 bg-[#eaf3fc]/50 border-[#1976d2]/20">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1976d2]">
              <span>💡</span> Panduan Pengisian Lowongan
            </div>
            <ul className="text-xs text-[#616161] space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1976d2]">•</span>
                <span><strong>Judul Posisi:</strong> Gunakan penamaan standar industri (misal: <em>Front-end Developer</em>, bukan <em>Dicari Ninja Koding</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1976d2]">•</span>
                <span><strong>Persyaratan Keahlian:</strong> Pisahkan kata kunci keahlian dengan tanda koma (contoh: <code>react, javascript, tailwind css, git</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#1976d2]">•</span>
                <span><strong>Pencocokan AI:</strong> Kata kunci keahlian akan langsung diekstraksi oleh algoritma AI untuk menghitung skor kecocokan CV kandidat.</span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
