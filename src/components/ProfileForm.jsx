import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Field, PageTitle, Spinner, btnPrimary, inputCls } from "./ui.jsx";

// Form profil generik. `fields`: [{ name, label, type: "text"|"textarea"|"tags", required, hint }]
export default function ProfileForm({ title, subtitle, fields }) {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then(setForm).catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => { if (f.required && !String(form[f.name] ?? "").trim()) errs[f.name] = `${f.label} wajib diisi`; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      await api.updateProfile(form);
      await refreshUser();
      setMsg({ type: "success", text: "Profil berhasil disimpan" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally { setSaving(false); }
  };

  if (!form) return msg.text ? <Alert>{msg.text}</Alert> : <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title={title} subtitle={subtitle} />
      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {fields.map((f) => (
            <Field key={f.name} label={f.label + (f.required ? " *" : "")} error={errors[f.name]} hint={f.hint}>
              {f.type === "textarea" ? (
                <textarea rows={4} className={inputCls} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <input className={inputCls} value={form[f.name] ?? ""} readOnly={f.readOnly} disabled={f.readOnly} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </Field>
          ))}
          <Alert type={msg.type}>{msg.text}</Alert>
          <button className={btnPrimary} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </form>
      </Card>
    </div>
  );
}
