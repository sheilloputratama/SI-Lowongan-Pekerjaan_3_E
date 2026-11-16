// Mode MOCK: seluruh data disimpan di localStorage supaya front end bisa jalan
// dan didemokan tanpa backend. Bentuk fungsi & datanya sama dengan realApi.js,
// jadi saat backend (AB) siap, cukup isi VITE_API_URL.
// CATATAN: password disimpan polos HANYA di mock. Jangan ditiru di backend asli.

const KEY = "lk_db_v1";
const TOKEN = "lk_token";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () => crypto.randomUUID();
const norm = (s) => String(s).toLowerCase().trim();

function seed() {
  const company = {
    id: "c1", role: "company", email: "hrd@nusantara.test", password: "password123",
    profile: { companyName: "PT Nusantara Digital Indonesia", industry: "Teknologi Informasi", city: "Yogyakarta", website: "https://nusantara.test", phone: "0274-000000", about: "Perusahaan pengembang perangkat lunak." },
  };
  const mkSeeker = (id, email, fullName, skills) => ({
    id, role: "seeker", email, password: "password123",
    profile: { fullName, phone: "08123456789", city: "Yogyakarta", headline: "Fresh graduate Teknologi Informasi", education: "S1 Teknologi Informasi, UMY", about: "", skills },
  });
  const seekers = [
    mkSeeker("s1", "pelamar@test.test", "Pelamar Demo", ["react", "javascript", "sql"]),
    mkSeeker("s2", "rina@test.test", "Rina Pratiwi", ["react", "javascript", "tailwind css", "git"]),
    mkSeeker("s3", "budi@test.test", "Budi Santoso", ["php", "mysql"]),
  ];
  const now = Date.now();
  const jobs = [
    { id: "j1", companyId: "c1", companyName: company.profile.companyName, title: "Front-end Developer", location: "Yogyakarta", type: "Penuh waktu", level: "Junior", salary: "Rp6.000.000 - Rp8.000.000", deadline: "2026-12-31", description: "Membangun antarmuka web dengan React.", requirements: ["react", "javascript", "tailwind css", "git"], status: "aktif", source: "internal", createdAt: now - 86400000 * 2 },
    { id: "j2", companyId: "c1", companyName: company.profile.companyName, title: "Back-end Developer", location: "Remote", type: "Kontrak", level: "Menengah", salary: "Negosiasi", deadline: "2026-12-15", description: "Mengembangkan REST API dan database.", requirements: ["node.js", "sql", "docker"], status: "aktif", source: "internal", createdAt: now - 86400000 * 5 },
    { id: "j3", companyId: "c1", companyName: company.profile.companyName, title: "Magang Quality Assurance", location: "Sleman", type: "Magang", level: "Fresh graduate", salary: "Uang saku", deadline: "2026-11-30", description: "Menguji aplikasi web dan mobile.", requirements: ["testing", "sql"], status: "aktif", source: "internal", createdAt: now - 86400000 * 8 },
  ];
  const cvs = [
    { id: "cv1", userId: "s1", name: "CV_Pelamar_Demo.pdf", size: 210000, uploadedAt: now - 86400000 * 3, active: true },
    { id: "cv2", userId: "s2", name: "CV_Rina.pdf", size: 180000, uploadedAt: now - 86400000 * 4, active: true },
    { id: "cv3", userId: "s3", name: "CV_Budi.docx", size: 90000, uploadedAt: now - 86400000 * 4, active: true },
  ];
  const mkApp = (id, seekerId, cvId, jobId, score, status) => ({
    id, jobId, seekerId, cvId, note: "", score, status, createdAt: now - 86400000,
    history: [{ status: "Dikirim", at: now - 86400000 }, ...(status !== "Dikirim" ? [{ status, at: now - 3600000 }] : [])],
  });
  const applications = [
    mkApp("a1", "s3", "cv3", "j1", 0, "Dikirim"),
    mkApp("a2", "s2", "cv2", "j1", 100, "Ditinjau"),
    mkApp("a3", "s1", "cv1", "j1", 50, "Dikirim"),
  ];
  return { users: [company, ...seekers], jobs, cvs, applications, scanned: [] };
}

function load() {
  let d = JSON.parse(localStorage.getItem(KEY) || "null");
  if (!d) { d = seed(); save(d); }
  return d;
}
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

const publicUser = (u) => ({ id: u.id, role: u.role, email: u.email, name: u.profile.fullName || u.profile.companyName });
const session = (u) => { localStorage.setItem(TOKEN, u.id); return { token: u.id, user: publicUser(u) }; };

function currentUser(d, role) {
  const u = d.users.find((x) => x.id === localStorage.getItem(TOKEN));
  if (!u) throw new Error("Sesi berakhir, silakan login lagi");
  if (role && u.role !== role) throw new Error("Tidak punya akses");
  return u;
}

// Skor kecocokan sederhana (keahlian CV vs syarat lowongan). Di sistem asli,
// skor dihitung AI (Gemini) di backend; front end hanya menampilkan.
function matchScore(seeker, requirements) {
  const need = (requirements || []).map(norm);
  if (!need.length || !seeker) return 0;
  const have = new Set((seeker.profile.skills || []).map(norm));
  return Math.round((need.filter((n) => have.has(n)).length / need.length) * 100);
}
const hasActiveCv = (d, userId) => d.cvs.some((c) => c.userId === userId && c.active);
const sort = (arr, f = (x) => x.createdAt) => [...arr].sort((a, b) => f(b) - f(a));

export const mockApi = {
  // ---- Auth & profil ----
  async register(p) {
    await delay(); const d = load();
    const email = p.email.trim().toLowerCase();
    if (d.users.some((u) => u.email === email)) throw new Error("Email sudah terdaftar");
    const profile = p.role === "seeker"
      ? { fullName: p.fullName, phone: p.phone || "", city: "", headline: "", education: "", about: "", skills: [] }
      : { companyName: p.companyName, industry: p.industry || "", city: p.city || "", website: "", phone: "", about: "" };
    const user = { id: uid(), role: p.role, email, password: p.password, profile };
    d.users.push(user); save(d); return session(user);
  },
  async login({ email, password }) {
    await delay(); const d = load();
    const u = d.users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
    if (!u) throw new Error("Email atau password salah");
    return session(u);
  },
  async me() {
    const d = load(); const u = d.users.find((x) => x.id === localStorage.getItem(TOKEN));
    return u ? publicUser(u) : null;
  },
  logout() { localStorage.removeItem(TOKEN); },
  async getProfile() { await delay(100); return currentUser(load()).profile; },
  async updateProfile(profile) {
    await delay(); const d = load(); const u = currentUser(d);
    u.profile = { ...u.profile, ...profile }; save(d); return publicUser(u);
  },

  // ---- CV ----
  async listCvs() { await delay(100); const d = load(); const u = currentUser(d, "seeker"); return sort(d.cvs.filter((c) => c.userId === u.id), (c) => c.uploadedAt); },
  async uploadCv(file) {
    await delay(600); const d = load(); const u = currentUser(d, "seeker");
    const first = !hasActiveCv(d, u.id);
    d.cvs.push({ id: uid(), userId: u.id, name: file.name, size: file.size, uploadedAt: Date.now(), active: first });
    save(d);
  },
  async setActiveCv(id) {
    await delay(100); const d = load(); const u = currentUser(d, "seeker");
    d.cvs.forEach((c) => { if (c.userId === u.id) c.active = c.id === id; }); save(d);
  },
  async deleteCv(id) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    if (d.applications.some((a) => a.cvId === id)) throw new Error("CV ini dipakai pada lamaran dan tidak bisa dihapus");
    d.cvs = d.cvs.filter((c) => !(c.id === id && c.userId === u.id));
    const mine = d.cvs.filter((c) => c.userId === u.id);
    if (mine.length && !mine.some((c) => c.active)) mine[0].active = true;
    save(d);
  },

  // ---- Lowongan (pencari kerja) ----
  async searchJobs({ q = "", location = "", type = "", level = "", sortBy = "terbaru" } = {}) {
    await delay(); const d = load();
    const u = d.users.find((x) => x.id === localStorage.getItem(TOKEN));
    const seeker = u?.role === "seeker" ? u : null;
    const canScore = seeker && hasActiveCv(d, seeker.id);
    const s = norm(q);
    let rows = d.jobs.filter((j) => j.status === "aktif")
      .filter((j) => !s || [j.title, j.companyName, ...j.requirements].some((t) => norm(t).includes(s)))
      .filter((j) => !location || norm(j.location).includes(norm(location)))
      .filter((j) => !type || j.type === type)
      .filter((j) => !level || j.level === level)
      .map((j) => ({ ...j, score: canScore ? matchScore(seeker, j.requirements) : null }));
    return sortBy === "skor" && canScore ? sort(rows, (j) => j.score) : sort(rows);
  },
  async getJob(id) {
    await delay(150); const d = load();
    const j = d.jobs.find((x) => x.id === id); if (!j) throw new Error("Lowongan tidak ditemukan");
    const u = d.users.find((x) => x.id === localStorage.getItem(TOKEN));
    const seeker = u?.role === "seeker" ? u : null;
    return {
      ...j,
      score: seeker && hasActiveCv(d, seeker.id) ? matchScore(seeker, j.requirements) : null,
      applied: !!seeker && d.applications.some((a) => a.jobId === id && a.seekerId === seeker.id),
    };
  },

  // ---- Lowongan (perusahaan, CRUD) ----
  async myJobs() {
    await delay(150); const d = load(); const u = currentUser(d, "company");
    return sort(d.jobs.filter((j) => j.companyId === u.id)).map((j) => ({ ...j, applicantCount: d.applications.filter((a) => a.jobId === j.id).length }));
  },
  async getMyJob(id) {
    await delay(100); const d = load(); const u = currentUser(d, "company");
    const j = d.jobs.find((x) => x.id === id && x.companyId === u.id); if (!j) throw new Error("Lowongan tidak ditemukan");
    return j;
  },
  async createJob(p) {
    await delay(); const d = load(); const u = currentUser(d, "company");
    const job = { ...p, id: uid(), companyId: u.id, companyName: u.profile.companyName, status: "aktif", source: "internal", createdAt: Date.now() };
    d.jobs.push(job); save(d); return job;
  },
  async updateJob(id, p) {
    await delay(); const d = load(); const u = currentUser(d, "company");
    const j = d.jobs.find((x) => x.id === id && x.companyId === u.id); if (!j) throw new Error("Lowongan tidak ditemukan");
    Object.assign(j, p); save(d); return j;
  },
  async deleteJob(id) {
    await delay(); const d = load(); const u = currentUser(d, "company");
    d.jobs = d.jobs.filter((j) => !(j.id === id && j.companyId === u.id));
    d.applications = d.applications.filter((a) => a.jobId !== id); save(d);
  },

  // ---- Lamaran ----
  async apply(jobId, { cvId, note }) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    const job = d.jobs.find((j) => j.id === jobId); if (!job) throw new Error("Lowongan tidak ditemukan");
    if (d.applications.some((a) => a.jobId === jobId && a.seekerId === u.id)) throw new Error("Kamu sudah melamar lowongan ini");
    if (!d.cvs.some((c) => c.id === cvId && c.userId === u.id)) throw new Error("Pilih CV terlebih dahulu");
    const now = Date.now();
    d.applications.push({ id: uid(), jobId, seekerId: u.id, cvId, note: note || "", score: matchScore(u, job.requirements), status: "Dikirim", createdAt: now, history: [{ status: "Dikirim", at: now }] });
    save(d);
  },
  async myApplications() {
    await delay(150); const d = load(); const u = currentUser(d, "seeker");
    return sort(d.applications.filter((a) => a.seekerId === u.id)).map((a) => {
      const j = d.jobs.find((x) => x.id === a.jobId);
      return { ...a, jobTitle: j?.title || "(lowongan dihapus)", companyName: j?.companyName || "-", cvName: d.cvs.find((c) => c.id === a.cvId)?.name || "-" };
    });
  },
  async jobApplicants(jobId) {
    await delay(150); const d = load(); const u = currentUser(d, "company");
    const job = d.jobs.find((j) => j.id === jobId && j.companyId === u.id); if (!job) throw new Error("Lowongan tidak ditemukan");
    const applicants = d.applications.filter((a) => a.jobId === jobId).map((a) => {
      const s = d.users.find((x) => x.id === a.seekerId);
      return { ...a, seeker: { ...s.profile, email: s.email }, cvName: d.cvs.find((c) => c.id === a.cvId)?.name || "-" };
    });
    return { job, applicants: sort(applicants, (a) => a.score) };
  },
  async updateStatus(appId, status) {
    await delay(150); const d = load(); const u = currentUser(d, "company");
    const a = d.applications.find((x) => x.id === appId);
    const job = a && d.jobs.find((j) => j.id === a.jobId && j.companyId === u.id);
    if (!job) throw new Error("Lamaran tidak ditemukan");
    a.status = status; a.history.push({ status, at: Date.now() }); save(d);
  },

  // ---- Pemindaian poster ----
  async scanPoster(file) {
    await delay(1600); // simulasi AI membaca gambar
    // Mock: hasil contoh. Backend asli mengirim gambar ke Gemini lalu mengembalikan
    // { fields, confidence } dengan bentuk yang sama.
    return {
      fields: {
        title: "Staff IT Support", companyName: "CV Maju Bersama", location: "Sleman, DIY", type: "Penuh waktu",
        level: "Fresh graduate", deadline: "2026-12-20", contact: "hrd@majubersama.test / 0812-3456-7890",
        description: `Dibaca dari poster: ${file.name}`, requirements: ["sql", "troubleshooting", "jaringan"],
      },
      confidence: { title: 0.97, companyName: 0.92, location: 0.9, type: 0.85, level: 0.6, deadline: 0.55, contact: 0.8, requirements: 0.7 },
    };
  },
  async saveScannedJob(data) {
    await delay(); const d = load(); const u = currentUser(d, "seeker");
    d.scanned.push({ ...data, id: uid(), userId: u.id, source: "poster", createdAt: Date.now() }); save(d);
  },
  async listScannedJobs() {
    await delay(100); const d = load(); const u = currentUser(d, "seeker");
    const canScore = hasActiveCv(d, u.id);
    return sort(d.scanned.filter((s) => s.userId === u.id)).map((s) => ({ ...s, score: canScore ? matchScore(u, s.requirements) : null }));
  },
  async deleteScannedJob(id) {
    await delay(100); const d = load(); const u = currentUser(d, "seeker");
    d.scanned = d.scanned.filter((s) => !(s.id === id && s.userId === u.id)); save(d);
  },
};
