// Mode REAL: memanggil backend lewat REST. Kontrak endpoint ini perlu
// disepakati dengan AB (back-end). Ubah path di sini kalau berbeda.

const BASE = import.meta.env.VITE_API_URL;
const TOKEN = "lk_token";

async function http(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem(TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan pada server");
  return data;
}
const qs = (o = {}) => new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();
const fileForm = (file) => { const f = new FormData(); f.append("file", file); return f; };
const saveSession = (s) => { localStorage.setItem(TOKEN, s.token); return s; };

export const realApi = {
  register: async (p) => saveSession(await http("/auth/register", { method: "POST", body: p })),
  login: async (p) => saveSession(await http("/auth/login", { method: "POST", body: p })),
  me: () => http("/auth/me").catch(() => null),
  logout: () => localStorage.removeItem(TOKEN),
  getProfile: () => http("/profile"),
  updateProfile: (p) => http("/profile", { method: "PUT", body: p }),

  listCvs: () => http("/cvs"),
  uploadCv: (file) => http("/cvs", { method: "POST", form: fileForm(file) }),
  deleteCv: (id) => http(`/cvs/${id}`, { method: "DELETE" }),

  searchJobs: (f) => http(`/jobs?${qs(f)}`),
  getJob: (id) => http(`/jobs/${id}`),

  myJobs: () => http("/company/jobs"),
  getMyJob: (id) => http(`/company/jobs/${id}`),
  createJob: (p) => http("/company/jobs", { method: "POST", body: p }),
  updateJob: (id, p) => http(`/company/jobs/${id}`, { method: "PUT", body: p }),
  deleteJob: (id) => http(`/company/jobs/${id}`, { method: "DELETE" }),

  apply: (jobId, p) => http(`/jobs/${jobId}/apply`, { method: "POST", body: p }), // { cv_id }
  myApplications: () => http("/applications/me"),
  jobApplicants: (jobId) => http(`/company/jobs/${jobId}/applicants`), // { job, applicants } sudah urut skor
  updateStatus: (appId, status) => http(`/applications/${appId}/status`, { method: "PATCH", body: { status } }),

  scanPoster: (file) => http("/poster/scan", { method: "POST", form: fileForm(file) }), // { scan_id, fields, confidence }; poster_scans.status = pending
  confirmScan: (scanId, fields) => http(`/poster/scans/${scanId}/confirm`, { method: "POST", body: fields }), // buat jobs (source=poster), status = confirmed
  listScans: () => http("/poster/scans"),
  deleteScan: (id) => http(`/poster/scans/${id}`, { method: "DELETE" }),
};
