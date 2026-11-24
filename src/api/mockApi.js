// Mode MOCK: data disimpan di localStorage supaya front end bisa jalan tanpa backend.
// Struktur data mengikuti ERD (users, companies, jobs, cvs, applications,
// match_results, poster_scans) dan nama field memakai snake_case seperti kolom ERD.
// Bentuk fungsi dan datanya sama dengan realApi.js.
// CATATAN: password disimpan polos HANYA di mock. extracted_text CV di mock adalah
// teks contoh; di sistem asli diekstrak dari PDF/DOCX dan dinilai AI (Gemini).

const KEY = "lk_db_v2";
const TOKEN = "lk_token";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () => crypto.randomUUID();
const norm = (s) => String(s).toLowerCase().trim();
const splitReq = (t) => String(t || "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
const SAMPLE_CV_TEXT = "react javascript node.js sql git html css";

function seed() {
  const now = Date.now();
  const day = 86400000;
  const users = [
    { id: "u1", role: "company", email: "hrd@nusantara.test", password: "password123", full_name: "Rina HRD", phone: "0274-000000" },
    { id: "u2", role: "seeker", email: "pelamar@test.test", password: "password123", full_name: "Pelamar Demo", phone: "08123456789" },
    { id: "u3", role: "seeker", email: "rina@test.test", password: "password123", full_name: "Rina Pratiwi", phone: "08111111111" },
    { id: "u4", role: "seeker", email: "budi@test.test", password: "password123", full_name: "Budi Santoso", phone: "08222222222" },
  ];
  const companies = [{ id: "co1", user_id: "u1", name: "PT Nusantara Digital Indonesia", industry: "Teknologi Informasi", address: "Yogyakarta", description: "Perusahaan pengembang perangkat lunak." }];
  const job = (id, title, location, job_type, category, requirements, description, createdAgo, extra = {}) => ({
    id, company_id: "co1", company_name: "PT Nusantara Digital Indonesia", source: "internal", title, description, requirements,
    location, job_type, category, contact_info: "hrd@nusantara.test", external_url: null, status: "aktif", created_at: now - day * createdAgo, ...extra,
  });
  const jobs = [
    job("j1", "Front-end Developer", "Yogyakarta", "Penuh waktu", "Teknologi Informasi", "react, javascript, tailwind css, git", "Membangun antarmuka web dengan React.", 2),
    job("j2", "Back-end Developer", "Remote", "Kontrak", "Teknologi Informasi", "node.js, sql, docker", "Mengembangkan REST API dan database.", 5),
    job("j3", "Magang Quality Assurance", "Sleman", "Magang", "Teknologi Informasi", "testing, sql", "Menguji aplikasi web dan mobile.", 8),
    job("j4", "Customer Service", "Jakarta", "Penuh waktu", "Administrasi", "komunikasi, microsoft excel", "Lowongan dari situs mitra.", 3,
      { company_id: null, company_name: "PT Contoh Eksternal", source: "external", external_url: "https://example.com/lowongan/123", contact_info: "" }),
  ];
  const cv = (id, user_id, file_name, file_type, text) => ({ id, user_id, file_name, file_type, extracted_text: text, uploaded_at: now - day * 3 });
  const cvs = [
    cv("cv1", "u2", "CV_Pelamar_Demo.pdf", "pdf", "react javascript sql html css"),
    cv("cv2", "u3", "CV_Rina.pdf", "pdf", "react javascript tailwind css git"),
    cv("cv3", "u4", "CV_Budi.docx", "docx", "php mysql laravel"),
  ];
  const app = (id, user_id, cv_id, match_score, status) => ({ id, job_id: "j1", user_id, cv_id, status, match_score, applied_at: now - day });
  const applications = [app("a1", "u4", "cv3", 0, "Dikirim"), app("a2", "u3", "cv2", 100, "Ditinjau"), app("a3", "u2", "cv1", 50, "Dikirim")];
  return { users, companies, jobs, cvs, applications, poster_scans: [] };
}

function load() {
  let d = JSON.parse(localStorage.getItem(KEY) || "null");
  if (!d) { d = seed(); save(d); }
  return d;
}
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const companyOf = (d, u) => d.companies.find((c) => c.user_id === u.id) || null;
const publicUser = (d, u) => ({ id: u.id, role: u.role, email: u.email, full_name: u.full_name, phone: u.phone, company: companyOf(d, u) });
const session = (d, u) => { localStorage.setItem(TOKEN, u.id); return { token: u.id, user: publicUser(d, u) }; };

function currentUser(d, role) {
  const u = d.users.find((x) => x.id === localStorage.getItem(TOKEN));
  if (!u) throw new Error("Sesi berakhir, silakan login lagi");
  if (role && u.role !== role) throw new Error("Tidak punya akses");
  return u;
}
const optionalUser = (d) => d.users.find((x) => x.id === localStorage.getItem(TOKEN)) || null;

const sortBy = (arr, f) => [...arr].sort((a, b) => f(b) - f(a));
// CV terbaru dipakai untuk pencocokan (ERD tidak punya penanda CV aktif).
const latestCv = (d, userId) => sortBy(d.cvs.filter((c) => c.user_id === userId), (c) => c.uploaded_at)[0] || null;

// Setara tabel match_results: cocokkan extracted_text CV dengan requirements lowongan.
function matchResult(cv, job) {
  const reqs = splitReq(job.requirements);
  if (!cv || !reqs.length) return null;
  const text = norm(cv.extracted_text || "");
  const matched = reqs.filter((r) => text.includes(norm(r)));
  const missing = reqs.filter((r) => !text.includes(norm(r)));
  return { cv_id: cv.id, job_id: job.id, score: Math.round((matched.length / reqs.length) * 100), matched_skills: matched, missing_skills: missing, summary: `${matched.length} dari ${reqs.length} syarat sesuai dengan CV.` };
}

const jobView = (job, match) => ({ ...job, match_score: match ? match.score : null });

export const mockApi = {
  // ---- Auth & profil ----
  async register(p) {
    await delay(); const d = load();
    const email = p.email.trim().toLowerCase();
    if (d.users.some((u) => u.email === email)) throw new Error("Email sudah terdaftar");
    const user = { id: uid(), role: p.role, email, password: p.password, full_name: p.full_name, phone: p.phone || "" };
    d.users.push(user);
    if (p.role === "company") d.companies.push({ id: uid(), user_id: user.id, name: p.company_name, industry: p.industry || "", address: p.address || "", description: "" });
    save(d); return session(d, user);
  },
  async login({ email, password }) {
    await delay(); const d = load();
    const u = d.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
    if (!u) throw new Error("Email atau password salah");
    return session(d, u);
  },
  async me() { const d = load(); const u = optionalUser(d); return u ? publicUser(d, u) : null; },
  logout() { localStorage.removeItem(TOKEN); },
  async getProfile() {
    await delay(100); const d = load(); const u = currentUser(d);
    const base = { full_name: u.full_name, phone: u.phone, email: u.email };
    const c = companyOf(d, u);
    return c ? { ...base, company_name: c.name, industry: c.industry, address: c.address, description: c.description } : base;
  },
  async updateProfile(p) {
    await delay(); const d = load(); const u = currentUser(d);
    u.full_name = p.full_name; u.phone = p.phone || "";
    const c = companyOf(d, u);
    if (c) Object.assign(c, { name: p.company_name, industry: p.industry || "", address: p.address || "", description: p.description || "" });
    save(d); return publicUser(d, u);
  },

  // ---- CV (tabel cvs) ----
  async listCvs() { await delay(100); const d = load(); const u = currentUser(d, "seeker"); return sortBy(d.cvs.filter((c) => c.user_id === u.id), (c) => c.uploaded_at).map(({ extracted_text, ...c }) => c); },
  async uploadCv(file) {
    await delay(600); const d = load(); const u = currentUser(d, "seeker");
    d.cvs.push({ id: uid(), user_id: u.id, file_name: file.name, file_type: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx", extracted_text: SAMPLE_CV_TEXT, uploaded_at: Date.now() });
    save(d);
  },
  async deleteCv(id) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    if (d.applications.some((a) => a.cv_id === id)) throw new Error("CV ini dipakai pada lamaran dan tidak bisa dihapus");
    d.cvs = d.cvs.filter((c) => !(c.id === id && c.user_id === u.id)); save(d);
  },

  // ---- Lowongan (pencari kerja) ----
  async searchJobs({ q = "", location = "", job_type = "", category = "", sort_by = "terbaru" } = {}) {
    await delay(); const d = load(); const u = optionalUser(d);
    const cv = u?.role === "seeker" ? latestCv(d, u.id) : null;
    const s = norm(q);
    const rows = d.jobs.filter((j) => j.status === "aktif" && j.source !== "poster")
      .filter((j) => !s || [j.title, j.company_name, j.requirements].some((t) => norm(t).includes(s)))
      .filter((j) => !location || norm(j.location).includes(norm(location)))
      .filter((j) => !job_type || j.job_type === job_type)
      .filter((j) => !category || j.category === category)
      .map((j) => jobView(j, matchResult(cv, j)));
    return sort_by === "skor" && cv ? sortBy(rows, (j) => j.match_score) : sortBy(rows, (j) => j.created_at);
  },
  async getJob(id) {
    await delay(150); const d = load();
    const j = d.jobs.find((x) => x.id === id); if (!j) throw new Error("Lowongan tidak ditemukan");
    const u = optionalUser(d); const seeker = u?.role === "seeker" ? u : null;
    const match = seeker ? matchResult(latestCv(d, seeker.id), j) : null;
    return { ...j, match, applied: !!seeker && d.applications.some((a) => a.job_id === id && a.user_id === seeker.id) };
  },

  // ---- Lowongan (perusahaan, CRUD) ----
  async myJobs() {
    await delay(150); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    return sortBy(d.jobs.filter((j) => j.company_id === c.id), (j) => j.created_at).map((j) => ({ ...j, applicant_count: d.applications.filter((a) => a.job_id === j.id).length }));
  },
  async getMyJob(id) {
    await delay(100); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    const j = d.jobs.find((x) => x.id === id && x.company_id === c.id); if (!j) throw new Error("Lowongan tidak ditemukan");
    return j;
  },
  async createJob(p) {
    await delay(); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    const job = { ...p, id: uid(), company_id: c.id, company_name: c.name, source: "internal", external_url: null, created_at: Date.now() };
    d.jobs.push(job); save(d); return job;
  },
  async updateJob(id, p) {
    await delay(); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    const j = d.jobs.find((x) => x.id === id && x.company_id === c.id); if (!j) throw new Error("Lowongan tidak ditemukan");
    Object.assign(j, p); save(d); return j;
  },
  async deleteJob(id) {
    await delay(); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    d.jobs = d.jobs.filter((j) => !(j.id === id && j.company_id === c.id));
    d.applications = d.applications.filter((a) => a.job_id !== id); save(d);
  },

  // ---- Lamaran (tabel applications) ----
  async apply(jobId, { cv_id }) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    const job = d.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Lowongan tidak ditemukan");
    if (job.source !== "internal" || job.status !== "aktif") throw new Error("Lowongan ini tidak menerima lamaran");
    if (d.applications.some((a) => a.job_id === jobId && a.user_id === u.id)) throw new Error("Kamu sudah melamar lowongan ini");
    const cv = d.cvs.find((c) => c.id === cv_id && c.user_id === u.id);
    if (!cv) throw new Error("Pilih CV terlebih dahulu");
    d.applications.push({ id: uid(), job_id: jobId, user_id: u.id, cv_id, status: "Dikirim", match_score: matchResult(cv, job)?.score ?? 0, applied_at: Date.now() });
    save(d);
  },
  async myApplications() {
    await delay(150); const d = load(); const u = currentUser(d, "seeker");
    return sortBy(d.applications.filter((a) => a.user_id === u.id), (a) => a.applied_at).map((a) => {
      const j = d.jobs.find((x) => x.id === a.job_id);
      return { ...a, job_title: j?.title || "(lowongan dihapus)", company_name: j?.company_name || "-", cv_file_name: d.cvs.find((c) => c.id === a.cv_id)?.file_name || "-" };
    });
  },
  async jobApplicants(jobId) {
    await delay(150); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    const job = d.jobs.find((j) => j.id === jobId && j.company_id === c.id); if (!job) throw new Error("Lowongan tidak ditemukan");
    const applicants = d.applications.filter((a) => a.job_id === jobId).map((a) => {
      const s = d.users.find((x) => x.id === a.user_id); const cv = d.cvs.find((x) => x.id === a.cv_id);
      return { ...a, cv_file_name: cv?.file_name || "-", applicant: { full_name: s.full_name, email: s.email, phone: s.phone }, match: matchResult(cv, job) };
    });
    return { job, applicants: sortBy(applicants, (a) => a.match_score) };
  },
  async updateStatus(appId, status) {
    await delay(150); const d = load(); const u = currentUser(d, "company"); const c = companyOf(d, u);
    const a = d.applications.find((x) => x.id === appId);
    if (!a || !d.jobs.some((j) => j.id === a.job_id && j.company_id === c.id)) throw new Error("Lamaran tidak ditemukan");
    a.status = status; save(d);
  },

  // ---- Pemindaian poster (tabel poster_scans) ----
  // Langkah 1: scan. Membuat poster_scans berstatus "pending"; belum jadi lowongan.
  async scanPoster(file) {
    await delay(1600); const d = load(); const u = currentUser(d, "seeker");
    // Mock: hasil contoh. Backend asli mengirim gambar ke Gemini; bentuk balasan sama.
    const fields = {
      title: "Staff IT Support", company_name: "CV Maju Bersama", location: "Sleman, DIY", job_type: "Penuh waktu", category: "Teknologi Informasi",
      contact_info: "hrd@majubersama.test / 0812-3456-7890", description: `Dibaca dari poster: ${file.name}`, requirements: "sql, troubleshooting, jaringan",
    };
    const scan = { id: uid(), user_id: u.id, job_id: null, image_path: file.name, extracted_data: fields, status: "pending", scanned_at: Date.now() };
    d.poster_scans.push(scan); save(d);
    return { scan_id: scan.id, fields, confidence: { title: 0.97, company_name: 0.92, location: 0.9, job_type: 0.85, category: 0.6, contact_info: 0.55, requirements: 0.7 } };
  },
  // Langkah 2: setelah pengguna memeriksa dan mengonfirmasi, baru dibuat lowongan (jobs.source = "poster").
  async confirmScan(scanId, fields) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    const scan = d.poster_scans.find((s) => s.id === scanId && s.user_id === u.id && s.status === "pending");
    if (!scan) throw new Error("Hasil scan tidak ditemukan atau sudah disimpan");
    const job = { ...fields, id: uid(), company_id: null, source: "poster", external_url: null, status: "aktif", created_at: Date.now() };
    d.jobs.push(job);
    scan.job_id = job.id; scan.status = "confirmed"; scan.extracted_data = fields; save(d);
  },
  async listScans() {
    await delay(100); const d = load(); const u = currentUser(d, "seeker"); const cv = latestCv(d, u.id);
    return sortBy(d.poster_scans.filter((s) => s.user_id === u.id && s.status === "confirmed"), (s) => s.scanned_at).map((s) => {
      const job = d.jobs.find((j) => j.id === s.job_id); const match = job ? matchResult(cv, job) : null;
      return { id: s.id, status: s.status, scanned_at: s.scanned_at, job, match, match_score: match ? match.score : null };
    });
  },
  async deleteScan(id) {
    await delay(100); const d = load(); const u = currentUser(d, "seeker");
    const s = d.poster_scans.find((x) => x.id === id && x.user_id === u.id);
    if (s?.job_id) d.jobs = d.jobs.filter((j) => j.id !== s.job_id);
    d.poster_scans = d.poster_scans.filter((x) => x.id !== id); save(d);
  },
};
