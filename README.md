# LowonganAI: Front End

Front end Sistem Lowongan Kerja Berbasis Web dengan AI (Kelompok 3, TI UMY).
Stack: React 18 + Vite + Tailwind CSS 4 + React Router.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil di dist/
```

Secara default berjalan di **mode mock** (data di localStorage), jadi bisa didemokan tanpa backend.
Akun demo (password `password123`): `pelamar@test.test` (pencari kerja), `hrd@nusantara.test` (perusahaan).
Reset data demo: hapus key `lk_db_v1` di localStorage (DevTools > Application).

## Pindah ke backend asli

1. Salin `.env.example` ke `.env`, isi `VITE_API_URL=http://localhost:8000/api`
2. Pastikan backend (AB) mengikuti kontrak di `src/api/realApi.js`. Bila path beda, cukup ubah file itu saja.

| Fungsi | Method & path | Catatan |
|---|---|---|
| register / login | `POST /auth/register`, `POST /auth/login` | balas `{ token, user: { id, role, email, name } }` |
| me | `GET /auth/me` | `role`: `seeker` atau `company` |
| profil | `GET/PUT /profile` | seeker: fullName, phone, city, headline, education, about, skills[]; company: companyName, industry, city, website, phone, about |
| CV | `GET/POST /cvs` (multipart `file`), `PATCH /cvs/:id/active`, `DELETE /cvs/:id` | PDF/DOCX maks 5 MB |
| cari lowongan | `GET /jobs?q&location&type&level&sortBy` | tiap item punya `score` (null bila belum ada CV aktif) |
| detail lowongan | `GET /jobs/:id` | + `score`, `applied` |
| CRUD lowongan | `GET/POST /company/jobs`, `GET/PUT/DELETE /company/jobs/:id` | `myJobs` menyertakan `applicantCount` |
| lamar | `POST /jobs/:id/apply` body `{ cvId, note }` | |
| lamaran saya | `GET /applications/me` | `status`, `history[{status, at}]`, `score`, `jobTitle`, `companyName`, `cvName` |
| pelamar per lowongan | `GET /company/jobs/:id/applicants` | `{ job, applicants[] }`, urut skor menurun; tiap pelamar punya `seeker{...profil, email}`, `cvName`, `score`, `status`, `note` |
| ubah status | `PATCH /applications/:id/status` body `{ status }` | `Dikirim`, `Ditinjau`, `Diterima`, `Ditolak` |
| scan poster | `POST /poster/scan` (multipart `file`) | balas `{ fields, confidence }`, belum disimpan |
| simpan hasil scan | `POST /poster/jobs` | body = fields yang sudah dikonfirmasi user |
| daftar / hapus scan | `GET /poster/jobs`, `DELETE /poster/jobs/:id` | item punya `score` |

`fields` hasil scan: title, companyName, location, type, level, deadline (YYYY-MM-DD), contact, description, requirements[].
`confidence`: angka 0..1 per field; di bawah 0.75 ditandai kuning di UI.

Skor kecocokan: di mock dihitung dari irisan keahlian profil vs syarat lowongan.
Di sistem asli skor datang dari backend (Gemini); front end hanya menampilkan.

## Pemetaan ke kartu Trello (bagian DK)

| Kartu | File |
|---|---|
| Registrasi dan login (dua role) | `pages/Register.jsx`, `pages/Login.jsx`, `context/AuthContext.jsx`, `components/ProtectedRoute.jsx` |
| Manajemen profil pencari kerja | `pages/seeker/SeekerProfile.jsx`, `components/ProfileForm.jsx` |
| Registrasi dan profil perusahaan | `pages/Register.jsx` (tab Perusahaan), `pages/company/CompanyProfile.jsx` |
| Unggah dan kelola CV (PDF/DOCX) | `pages/seeker/CvManager.jsx` |
| Pemasangan dan pengelolaan lowongan (CRUD) | `pages/company/CompanyJobs.jsx`, `CompanyJobForm.jsx`, `components/JobFields.jsx` |
| Pencarian dan filter lowongan | `pages/JobSearch.jsx`, `pages/JobDetail.jsx` |
| Pengajuan lamaran | `pages/JobDetail.jsx` |
| Pelacakan status lamaran | `pages/seeker/Applications.jsx` |
| Pengelolaan lamaran oleh perusahaan | `pages/company/Applicants.jsx` |
| Pelamar diurutkan berdasarkan skor | `pages/company/Applicants.jsx` |
| Pemindaian poster lowongan | `pages/seeker/ScanPoster.jsx` |
| Konfirmasi pengguna sebelum simpan | `pages/seeker/ScanPoster.jsx` (cek ulang + centang + dialog), `components/ui.jsx` (`ConfirmDialog`) |

Sesuai PPT: tidak ada peran admin, bukan aplikasi native, lowongan eksternal tidak di-scrape.
