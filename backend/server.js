const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- In‑memory DB (seed similar to mockApi) ----
let DB = null;
function seed() {
  const now = Date.now();
  const day = 86400000;
  const users = [
    { id: 'u1', role: 'company', email: 'hrd@nusantara.test', password: bcrypt.hashSync('password123', 10), full_name: 'Rina HRD', phone: '0274-000000' },
    { id: 'u2', role: 'seeker', email: 'pelamar@test.test', password: bcrypt.hashSync('password123', 10), full_name: 'Pelamar Demo', phone: '08123456789' },
    { id: 'u3', role: 'seeker', email: 'rina@test.test', password: bcrypt.hashSync('password123', 10), full_name: 'Rina Pratiwi', phone: '08111111111' },
    { id: 'u4', role: 'seeker', email: 'budi@test.test', password: bcrypt.hashSync('password123', 10), full_name: 'Budi Santoso', phone: '08222222222' },
  ];
  const companies = [{ id: 'co1', user_id: 'u1', name: 'PT Nusantara Digital Indonesia', industry: 'Teknologi Informasi', address: 'Yogyakarta', description: 'Perusahaan pengembang perangkat lunak.' }];
  const job = (id, title, location, job_type, category, requirements, description, createdAgo, extra = {}) => ({
    id,
    company_id: 'co1',
    company_name: 'PT Nusantara Digital Indonesia',
    source: 'internal',
    title,
    description,
    requirements,
    location,
    job_type,
    category,
    contact_info: 'hrd@nusantara.test',
    external_url: null,
    status: 'aktif',
    created_at: now - day * createdAgo,
    ...extra,
  });
  const jobs = [
    job('j1', 'Front-end Developer', 'Yogyakarta', 'Penuh waktu', 'Teknologi Informasi', 'react, javascript, tailwind css, git', 'Membangun antarmuka web dengan React.', 2),
    job('j2', 'Back-end Developer', 'Remote', 'Kontrak', 'Teknologi Informasi', 'node.js, sql, docker', 'Mengembangkan REST API dan database.', 5),
    job('j3', 'Magang Quality Assurance', 'Sleman', 'Magang', 'Teknologi Informasi', 'testing, sql', 'Menguji aplikasi web dan mobile.', 8),
    job('j4', 'Customer Service', 'Jakarta', 'Penuh waktu', 'Administrasi', 'komunikasi, microsoft excel', 'SI Lowongan Kerja dari situs mitra.', 3, { company_id: null, company_name: 'PT Contoh Eksternal', source: 'external', external_url: 'https://example.com/SI Lowongan Kerja/123', contact_info: '' }),
  ];
  const cv = (id, user_id, file_name, file_type, text) => ({ id, user_id, file_name, file_type, extracted_text: text, uploaded_at: now - day * 3 });
  const cvs = [
    cv('cv1', 'u2', 'CV_Pelamar_Demo.pdf', 'pdf', 'react javascript sql html css'),
    cv('cv2', 'u3', 'CV_Rina.pdf', 'pdf', 'react javascript tailwind css git'),
    cv('cv3', 'u4', 'CV_Budi.docx', 'docx', 'php mysql laravel'),
  ];
  const app = (id, user_id, cv_id, match_score, status) => ({ id, job_id: 'j1', user_id, cv_id, status, match_score, applied_at: now - day });
  const applications = [
    app('a1', 'u4', 'cv3', 0, 'Dikirim'),
    app('a2', 'u3', 'cv2', 100, 'Ditinjau'),
    app('a3', 'u2', 'cv1', 50, 'Dikirim'),
  ];
  return { users, companies, jobs, cvs, applications, poster_scans: [] };
}
function loadDB() { if (!DB) DB = seed(); }
function saveDB() { /* in‑memory, nothing to do */ }

// ---- Helper utilities ----
function norm(s) { return String(s).toLowerCase().trim(); }
function splitReq(t) { return String(t || '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean); }
function latestCv(userId) { const list = DB.cvs.filter(c => c.user_id === userId).sort((a,b)=>b.uploaded_at-a.uploaded_at); return list[0] || null; }
function matchResult(cv, job) {
  const reqs = splitReq(job.requirements);
  if (!cv || !reqs.length) return null;
  const text = norm(cv.extracted_text || '');
  const matched = reqs.filter(r => text.includes(norm(r)));
  const missing = reqs.filter(r => !text.includes(norm(r)));
  return {
    cv_id: cv.id,
    job_id: job.id,
    score: Math.round((matched.length/reqs.length)*100),
    matched_skills: matched,
    missing_skills: missing,
    summary: `${matched.length} dari ${reqs.length} syarat sesuai dengan CV.`
  };
}
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'Token diperlukan' });
  try {
    const payload = jwt.verify(auth, JWT_SECRET);
    const user = DB.users.find(u => u.id === payload.id);
    if (!user) throw new Error('User tidak ditemukan');
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
}

// ---- Multer config for uploads ----
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// ---- Auth routes ----
app.post('/api/auth/register', (req, res) => {
  loadDB();
  const { role, email, password, full_name, phone, company_name, industry, address } = req.body;
  const normEmail = email.trim().toLowerCase();
  if (DB.users.some(u => u.email === normEmail)) return res.status(400).json({ message: 'Email sudah terdaftar' });
  const user = { id: uuidv4(), role, email: normEmail, password: bcrypt.hashSync(password, 10), full_name, phone: phone || '' };
  DB.users.push(user);
  if (role === 'company') {
    DB.companies.push({ id: uuidv4(), user_id: user.id, name: company_name, industry: industry || '', address: address || '', description: '' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  saveDB();
  res.json({ token, user: { id: user.id, role: user.role, email: user.email, full_name: user.full_name, phone: user.phone, company: role==='company'? DB.companies.find(c=>c.user_id===user.id):null } });
});

app.post('/api/auth/login', (req, res) => {
  loadDB();
  const { email, password } = req.body;
  const normEmail = email.trim().toLowerCase();
  const u = DB.users.find(x => x.email === normEmail && bcrypt.compareSync(password, x.password));
  if (!u) return res.status(400).json({ message: 'Email atau password salah' });
  const token = jwt.sign({ id: u.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: u.id, role: u.role, email: u.email, full_name: u.full_name, phone: u.phone, company: u.role==='company'? DB.companies.find(c=>c.user_id===u.id):null } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = req.user;
  const company = user.role==='company'? DB.companies.find(c=>c.user_id===user.id):null;
  res.json({ id: user.id, role: user.role, email: user.email, full_name: user.full_name, phone: user.phone, company });
});

// ---- Profile ----
app.get('/api/profile', authMiddleware, (req, res) => {
  const u = req.user;
  if (u.role === 'company') {
    const c = DB.companies.find(c=>c.user_id===u.id);
    return res.json({ full_name: u.full_name, phone: u.phone, email: u.email, company_name: c?.name, industry: c?.industry, address: c?.address, description: c?.description });
  }
  res.json({ full_name: u.full_name, phone: u.phone, email: u.email });
});

app.put('/api/profile', authMiddleware, (req, res) => {
  const u = req.user;
  const p = req.body;
  u.full_name = p.full_name;
  u.phone = p.phone || '';
  if (u.role === 'company') {
    const c = DB.companies.find(c=>c.user_id===u.id);
    if (c) {
      c.name = p.company_name;
      c.industry = p.industry || '';
      c.address = p.address || '';
      c.description = p.description || '';
    }
  }
  saveDB();
  res.json({ message: 'Profile updated' });
});

// ---- CV ----
app.get('/api/cvs', authMiddleware, (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const list = DB.cvs.filter(c=>c.user_id===req.user.id).sort((a,b)=>b.uploaded_at-a.uploaded_at).map(({extracted_text,...c})=>c);
  res.json(list);
});

app.post('/api/cvs', authMiddleware, upload.single('file'), (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const file = req.file;
  const newCv = { id: uuidv4(), user_id: req.user.id, file_name: file.originalname, file_type: path.extname(file.originalname).toLowerCase().replace('.',''), extracted_text: 'sample cv text', uploaded_at: Date.now() };
  DB.cvs.push(newCv);
  saveDB();
  res.json({ message: 'CV uploaded' });
});

app.delete('/api/cvs/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const { id } = req.params;
  if (DB.applications.some(a=>a.cv_id===id)) return res.status(400).json({ message: 'CV ini dipakai pada lamaran dan tidak bisa dihapus' });
  DB.cvs = DB.cvs.filter(c=> !(c.id===id && c.user_id===req.user.id));
  saveDB();
  res.json({ message: 'CV dihapus' });
});

// ---- Jobs (search) ----
app.get('/api/jobs', (req, res) => {
  loadDB();
  const u = DB.users.find(x=>x.id=== (req.headers.authorization?jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET).id:null));
  const cv = u && u.role==='seeker'? latestCv(u.id): null;
  const { q='', location='', job_type='', category='', sort_by='terbaru' } = req.query;
  const s = norm(q);
  const rows = DB.jobs.filter(j=>j.status==='aktif' && j.source!=='poster')
    .filter(j=>!s || [j.title, j.company_name, j.requirements].some(t=>norm(t).includes(s)))
    .filter(j=>!location || norm(j.location).includes(norm(location)))
    .filter(j=>!job_type || j.job_type===job_type)
    .filter(j=>!category || j.category===category)
    .map(j=> ({ ...j, match_score: cv? matchResult(cv, j)?.score : null }) );
  const sorted = sort_by==='skor' && cv ? rows.sort((a,b)=>b.match_score-a.match_score) : rows.sort((a,b)=>b.created_at-a.created_at);
  res.json(sorted);
});

app.get('/api/jobs/:id', (req, res) => {
  loadDB();
  const job = DB.jobs.find(j=>j.id===req.params.id);
  if (!job) return res.status(404).json({ message: 'SI Lowongan Kerja tidak ditemukan' });
  let match = null;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const uid = jwt.verify(token, JWT_SECRET).id;
      const seeker = DB.users.find(u=>u.id===uid && u.role==='seeker');
      if (seeker) {
        const cv = latestCv(seeker.id);
        match = cv? matchResult(cv, job) : null;
      }
    } catch {}
  }
  const applied = DB.applications.some(a=>a.job_id===job.id && a.user_id=== (req.user?.id||'') );
  res.json({ ...job, match, applied });
});

// ---- Company CRUD ----
app.get('/api/company/jobs', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  const list = DB.jobs.filter(j=>j.company_id===comp.id).sort((a,b)=>b.created_at-a.created_at).map(j=>({ ...j, applicant_count: DB.applications.filter(a=>a.job_id===j.id).length }));
  res.json(list);
});

app.get('/api/company/jobs/:id', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  const job = DB.jobs.find(j=>j.id===req.params.id && j.company_id===comp.id);
  if (!job) return res.status(404).json({ message: 'SI Lowongan Kerja tidak ditemukan' });
  res.json(job);
});

app.post('/api/company/jobs', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  const p = req.body;
  const job = { ...p, id: uuidv4(), company_id: comp.id, company_name: comp.name, source: 'internal', external_url: null, created_at: Date.now() };
  DB.jobs.push(job);
  saveDB();
  res.json(job);
});

app.put('/api/company/jobs/:id', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  const job = DB.jobs.find(j=>j.id===req.params.id && j.company_id===comp.id);
  if (!job) return res.status(404).json({ message: 'SI Lowongan Kerja tidak ditemukan' });
  Object.assign(job, req.body);
  saveDB();
  res.json(job);
});

app.delete('/api/company/jobs/:id', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  DB.jobs = DB.jobs.filter(j=> !(j.id===req.params.id && j.company_id===comp.id));
  DB.applications = DB.applications.filter(a=> a.job_id!==req.params.id);
  saveDB();
  res.json({ message: 'Job dihapus' });
});

// ---- Applications ----
app.post('/api/jobs/:id/apply', authMiddleware, (req, res) => {
  if (req.user.role!=='seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const job = DB.jobs.find(j=>j.id===req.params.id);
  if (!job) return res.status(404).json({ message: 'SI Lowongan Kerja tidak ditemukan' });
  if (job.source!=='internal' || job.status!=='aktif') return res.status(400).json({ message: 'SI Lowongan Kerja ini tidak menerima lamaran' });
  if (DB.applications.some(a=>a.job_id===job.id && a.user_id===req.user.id)) return res.status(400).json({ message: 'Kamu sudah melamar SI Lowongan Kerja ini' });
  const { cv_id } = req.body;
  const cv = DB.cvs.find(c=>c.id===cv_id && c.user_id===req.user.id);
  if (!cv) return res.status(400).json({ message: 'Pilih CV terlebih dahulu' });
  const match = matchResult(cv, job);
  DB.applications.push({ id: uuidv4(), job_id: job.id, user_id: req.user.id, cv_id, status: 'Dikirim', match_score: match?.score ?? 0, applied_at: Date.now() });
  saveDB();
  res.json({ message: 'Lamaran berhasil' });
});

app.get('/api/applications/me', authMiddleware, (req, res) => {
  if (req.user.role!=='seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const list = DB.applications.filter(a=>a.user_id===req.user.id).sort((a,b)=>b.applied_at-a.applied_at).map(a=>{
    const j = DB.jobs.find(j=>j.id===a.job_id) || {};
    return { ...a, job_title: j.title||'(DIHAPUS)', company_name: j.company_name||'-', cv_file_name: (DB.cvs.find(c=>c.id===a.cv_id)||{}).file_name||'-' };
  });
  res.json(list);
});

app.get('/api/company/jobs/:id/applicants', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const comp = DB.companies.find(c=>c.user_id===req.user.id);
  const job = DB.jobs.find(j=>j.id===req.params.id && j.company_id===comp.id);
  if (!job) return res.status(404).json({ message: 'SI Lowongan Kerja tidak ditemukan' });
  const applicants = DB.applications.filter(a=>a.job_id===job.id).map(a=>{
    const s = DB.users.find(u=>u.id===a.user_id);
    const cv = DB.cvs.find(c=>c.id===a.cv_id);
    return { ...a, cv_file_name: cv?.file_name||'-', applicant: { full_name: s.full_name, email: s.email, phone: s.phone }, match: matchResult(cv, job) };
  });
  res.json({ job, applicants });
});

app.patch('/api/applications/:id/status', authMiddleware, (req, res) => {
  if (req.user.role!=='company') return res.status(403).json({ message: 'Akses ditolak' });
  const { status } = req.body;
  const appIdx = DB.applications.findIndex(a=>a.id===req.params.id);
  if (appIdx===-1) return res.status(404).json({ message: 'Lamaran tidak ditemukan' });
  DB.applications[appIdx].status = status;
  saveDB();
  res.json({ message: 'Status diupdate' });
});

// ---- Poster Scan ----
app.post('/api/poster/scan', authMiddleware, upload.single('file'), (req, res) => {
  if (req.user.role!=='seeker') return res.status(403).json({ message: 'Akses ditolak' });
  // Simulasi ekstraksi, menghasilkan field dummy
  const scan = {
    id: uuidv4(),
    user_id: req.user.id,
    file_path: req.file.path,
    fields: {
      title: 'Contoh Lowongan',
      company_name: 'PT Contoh',
      location: 'Jakarta',
      job_type: 'Penuh waktu',
      category: 'Teknologi Informasi',
      contact_info: 'hr@example.com',
      description: 'Deskripsi contoh',
      requirements: 'react, node.js',
    },
    confidence: Object.fromEntries(Object.keys({title:1,company_name:1,location:1,job_type:1,category:1,contact_info:1,description:1,requirements:1}).map(k=>[k,0.9])),
    status: 'pending',
    created_at: Date.now()
  };
  DB.poster_scans.push(scan);
  saveDB();
  res.json({ scan_id: scan.id, fields: scan.fields, confidence: scan.confidence });
});

app.post('/api/poster/scans/:id/confirm', authMiddleware, (req, res) => {
  if (req.user.role!=='seeker') return res.status(403).json({ message: 'Akses ditolak' });
  const scan = DB.poster_scans.find(s=>s.id===req.params.id && s.user_id===req.user.id);
  if (!scan) return res.status(404).json({ message: 'Scan tidak ditemukan' });
  const fields = req.body;
  // Buat job dari poster
  const newJob = {
    id: uuidv4(),
    company_id: null,
    company_name: fields.company_name || 'External',
    source: 'poster',
    title: fields.title,
    description: fields.description,
    requirements: fields.requirements,
    location: fields.location,
    job_type: fields.job_type,
    category: fields.category,
    contact_info: fields.contact_info,
    external_url: null,
    status: 'aktif',
    created_at: Date.now()
  };
  DB.jobs.push(newJob);
  scan.status = 'confirmed';
  scan.job_id = newJob.id;
  saveDB();
  res.json({ message: 'Poster confirmed', job_id: newJob.id });
});

app.get('/api/poster/scans', authMiddleware, (req, res) => {
  const list = DB.poster_scans.filter(s=>s.user_id===req.user.id);
  res.json(list);
});

app.delete('/api/poster/scans/:id', authMiddleware, (req, res) => {
  const idx = DB.poster_scans.findIndex(s=>s.id===req.params.id && s.user_id===req.user.id);
  if (idx===-1) return res.status(404).json({ message: 'Scan tidak ditemukan' });
  const scan = DB.poster_scans[idx];
  if (scan.job_id) {
    DB.jobs = DB.jobs.filter(j=>j.id!==scan.job_id);
  }
  DB.poster_scans.splice(idx,1);
  saveDB();
  res.json({ message: 'Scan dihapus' });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
