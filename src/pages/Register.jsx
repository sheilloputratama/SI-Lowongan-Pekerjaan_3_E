import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Card, Field, btnPrimary, inputCls } from "../components/ui.jsx";
import { homePath, isEmail } from "../utils.js";

const ROLES = [
  { id: "seeker", label: "Pencari Kerja" },
  { id: "company", label: "Perusahaan" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("seeker");
  const [form, setForm] = useState({ full_name: "", company_name: "", industry: "", address: "", phone: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = role === "seeker" ? "Nama lengkap wajib diisi" : "Nama penanggung jawab wajib diisi";
    if (role === "company" && !form.company_name.trim()) e.company_name = "Nama perusahaan wajib diisi";
    if (!isEmail(form.email)) e.email = "Format email tidak valid";
    if (form.password.length < 8) e.password = "Password minimal 8 karakter";
    if (form.confirm !== form.password) e.confirm = "Konfirmasi password tidak sama";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true); setError("");
    try {
      const { confirm, ...rest } = form;
      const payload = role === "seeker"
        ? { role, full_name: rest.full_name, phone: rest.phone, email: rest.email, password: rest.password }
        : { role, full_name: rest.full_name, phone: rest.phone, email: rest.email, password: rest.password, company_name: rest.company_name, industry: rest.industry, address: rest.address };
      const user = await register(payload);
      navigate(homePath(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-semibold">Buat Akun</h1>
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-200 p-1" role="tablist">
        {ROLES.map((r) => (
          <button key={r.id} type="button" role="tab" aria-selected={role === r.id}
            onClick={() => { setRole(r.id); setErrors({}); }}
            className={`rounded-md py-2 text-sm font-medium ${role === r.id ? "bg-white text-indigo-700 shadow" : "text-slate-600"}`}>
            {r.label}
          </button>
        ))}
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {role === "seeker" ? (
            <>
              <Field label="Nama lengkap *" error={errors.full_name}><input className={inputCls} value={form.full_name} onChange={set("full_name")} /></Field>
              <Field label="No. telepon"><input className={inputCls} value={form.phone} onChange={set("phone")} /></Field>
            </>
          ) : (
            <>
              <Field label="Nama perusahaan *" error={errors.company_name}><input className={inputCls} value={form.company_name} onChange={set("company_name")} /></Field>
              <Field label="Bidang industri"><input className={inputCls} value={form.industry} onChange={set("industry")} /></Field>
              <Field label="Alamat"><input className={inputCls} value={form.address} onChange={set("address")} /></Field>
              <Field label="Nama penanggung jawab *" error={errors.full_name}><input className={inputCls} value={form.full_name} onChange={set("full_name")} /></Field>
              <Field label="No. telepon"><input className={inputCls} value={form.phone} onChange={set("phone")} /></Field>
            </>
          )}
          <Field label="Email *" error={errors.email}><input type="email" className={inputCls} value={form.email} onChange={set("email")} autoComplete="email" /></Field>
          <Field label="Password *" error={errors.password} hint="Minimal 8 karakter"><input type="password" className={inputCls} value={form.password} onChange={set("password")} autoComplete="new-password" /></Field>
          <Field label="Ulangi password *" error={errors.confirm}><input type="password" className={inputCls} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></Field>
          <Alert>{error}</Alert>
          <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Mendaftar..." : "Daftar"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun? <Link to="/login" className="font-medium text-indigo-600">Masuk</Link>
        </p>
      </Card>
    </div>
  );
}
