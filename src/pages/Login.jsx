import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USE_MOCK } from "../api/client.js";
import { Alert, Card, Field, btnPrimary, inputCls } from "../components/ui.jsx";
import { homePath, isEmail } from "../utils.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(form.email)) return setError("Format email tidak valid");
    if (!form.password) return setError("Password wajib diisi");
    setBusy(true); setError("");
    try {
      const user = await login(form);
      navigate(location.state?.from || homePath(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-semibold">Masuk</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
          </Field>
          <Alert>{error}</Alert>
          <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Masuk..." : "Masuk"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun? <Link to="/register" className="font-medium text-indigo-600">Daftar</Link>
        </p>
      </Card>
      {USE_MOCK && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-medium">Akun demo (mode mock, password: password123)</p>
          <p>Pencari kerja: pelamar@test.test</p>
          <p>Perusahaan: hrd@nusantara.test</p>
        </div>
      )}
    </div>
  );
}
