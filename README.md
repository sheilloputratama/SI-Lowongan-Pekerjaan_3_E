# LowonganAI: Front End

Front end Sistem Lowongan Kerja Berbasis Web dengan AI (Kelompok 3, TI UMY).
Stack: React 18 + Vite + Tailwind CSS 4 + React Router. Data dan nama field mengikuti ERD kelompok
(users, companies, jobs, cvs, applications, match_results, poster_scans), memakai snake_case.

## Menjalankan

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil di dist/
```

Default berjalan di **mode mock** (data di localStorage). Akun demo (password `password123`):
`pelamar@test.test` (pencari kerja), `hrd@nusantara.test` (perusahaan).
Reset data demo: hapus key `lk_db_v2` di localStorage (DevTools > Application).

## Pindah ke backend asli

1. Salin `.env.example` ke `.env`, isi `VITE_API_URL=http://localhost:8000/api`
2. Backend (AB) mengikuti kontrak di bawah. Bila path beda, ubah `src/api/realApi.js` saja.

Semua JSON memakai snake_case sesuai kolom ERD. Kolom `matched_skills` / `missing_skills` bertipe text di DB,
tapi di API dikirim sebagai **array string**. `jobs.requirements` tetap **text** (dipisah koma / baris baru).

| Fungsi | Method & path | Body / balasan |
|---|---|---|
| register | `POST /auth/register` | seeker: `{role, full_name, phone, email, password}`; company: + `company_name, industry, address` |
| login | `POST /auth/login` | balas `{ token, user }` |
| me | `GET /auth/me` | `{ id, role, email, full_name, phone, company: {id, name, ...} \| null }` |
| profil | `GET/PUT /profile` | seeker: `{full_name, phone, email}`; company: + `company_name, industry, address, description` (companies.name dikirim sebagai `company_name`) |
| CV | `GET/POST /cvs` (multipart `file`), `DELETE /cvs/:id` | item: `{id, file_name, file_type, uploaded_at}`; terbaru dulu; CV terbaru dipakai untuk pencocokan |
| cari lowongan | `GET /jobs?q&location&job_type&category&sort_by` | item jobs + `company_name`, `match_score` (null bila belum punya CV); `sort_by=skor` untuk kecocokan tertinggi |
| detail lowongan | `GET /jobs/:id` | jobs + `company_name`, `applied`, `match: {score, matched_skills[], missing_skills[], summary} \| null` |
| CRUD lowongan | `GET/POST /company/jobs`, `GET/PUT/DELETE /company/jobs/:id` | field: title, description, requirements, location, job_type, category, contact_info, status (`aktif`/`ditutup`); daftar menyertakan `applicant_count` |
| lamar | `POST /jobs/:id/apply` | `{ cv_id }`; hanya `source=internal` dan `status=aktif` |
| lamaran saya | `GET /applications/me` | `{id, job_id, cv_id, status, match_score, applied_at, job_title, company_name, cv_file_name}` |
| pelamar per lowongan | `GET /company/jobs/:id/applicants` | `{ job, applicants[] }` urut `match_score` menurun; tiap item: `{id, status, match_score, applied_at, cv_file_name, applicant:{full_name,email,phone}, match:{...}}` |
| ubah status | `PATCH /applications/:id/status` | `{ status }`: `Dikirim`, `Ditinjau`, `Diterima`, `Ditolak` |
| scan poster | `POST /poster/scan` (multipart `file`) | buat `poster_scans` status `pending`, balas `{ scan_id, fields, confidence }` |
| konfirmasi scan | `POST /poster/scans/:id/confirm` | body = fields yang sudah diperiksa user; buat `jobs` (`source=poster`), isi `poster_scans.job_id`, status `confirmed`, hitung `match_results` |
| daftar / hapus scan | `GET /poster/scans`, `DELETE /poster/scans/:id` | item: `{id, status, scanned_at, job, match, match_score}`; hapus scan juga hapus job-nya |

`fields` hasil scan: title, company_name, location, job_type, category, contact_info, description, requirements (text).
`confidence`: angka 0..1 per field; di bawah 0.75 ditandai kuning di UI.

Batas file (cek di front end, backend sebaiknya sama): CV (PDF/DOCX) maks 2 MB, poster (JPG/PNG/WEBP) maks 2 MB.

## Hal yang perlu disepakati dengan AB (ERD vs kebutuhan UI)

1. **Nama perusahaan untuk lowongan eksternal dan poster.** `jobs` hanya punya `company_id`, padahal lowongan eksternal/poster tidak punya perusahaan terdaftar. Usul: tambah `jobs.company_name`, atau API mengisinya dari `poster_scans.extracted_data`.
2. **Nilai `users.role`.** Front end memakai `seeker` dan `company`.
3. **CV mana yang dipakai pencocokan.** ERD tidak punya penanda CV aktif, jadi front end memakai CV dengan `uploaded_at` terbaru.
4. **Nama file CV.** `cvs` hanya punya `file_path`; API perlu mengirim `file_name` (bisa diambil dari path).
5. **Lowongan poster** tidak muncul di pencarian umum, hanya di halaman Scan Poster milik pemindainya. Ubah bila maunya publik.
6. **Kolom yang tidak ada di ERD dan sengaja dihapus dari UI:** gaji, level, batas lamaran, catatan lamaran, riwayat status, keahlian di profil, kota/website perusahaan.
7. **Tabel `match_results`** dibaca lewat objek `match` di detail lowongan dan daftar pelamar. Siapa yang mengisinya (saat upload CV, saat melamar, atau saat dibuka) perlu diputuskan backend.

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

Sesuai PPT: tidak ada peran admin, bukan aplikasi native, lowongan eksternal tidak di-scrape (hanya diarahkan ke situs asal).
