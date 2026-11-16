import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import JobFields, { validateJob } from "../../components/JobFields.jsx";
import { Alert, Card, PageTitle, Spinner, btnGhost, btnPrimary } from "../../components/ui.jsx";

const BLANK = { title: "", location: "", type: "", level: "", salary: "", deadline: "", description: "", requirements: [] };

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
    setBusy(true); setError("");
    try {
      editing ? await api.updateJob(id, form) : await api.createJob(form);
      navigate("/company/jobs");
    } catch (err) { setError(err.message); setBusy(false); }
  };

  if (!form) return error ? <Alert>{error}</Alert> : <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={editing ? "Edit Lowongan" : "Pasang Lowongan"} />
      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <JobFields form={form} set={set} errors={errors} />
          <Alert>{error}</Alert>
          <div className="flex gap-2">
            <button className={btnPrimary} disabled={busy}>{busy ? "Menyimpan..." : editing ? "Simpan perubahan" : "Pasang lowongan"}</button>
            <button type="button" className={btnGhost} onClick={() => navigate("/company/jobs")}>Batal</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
