# SI Lowongan Kerja

Sistem Informasi Lowongan Kerja berbasis web dengan integrasi analisis kecocokan CV dan pemindaian poster berbasis AI. Proyek dibangun dengan arsitektur terpisah antara **Frontend** dan **Backend**:

```
SI-Lowongan-Pekerjaan_3_E/
├─ frontend/          ← React 18 + Vite + Tailwind CSS (UI/UX sesuai Figma)
│   ├─ src/
│   │   ├─ api/       (client.js, mockApi.js, realApi.js)
│   │   ├─ components/ (Navbar, Footer, JobFields, ProfileForm, ProtectedRoute, ui)
│   │   ├─ context/   (AuthContext.jsx)
│   │   └─ pages/     (Home, JobSearch, JobDetail, Login, Register, seeker/*, company/*)
│   ├─ index.html
│   ├─ package.json
│   ├─ vite.config.js
│   └─ .env.example
├─ backend/           ← Node.js + Express (REST API 23 Endpoints)
│   ├─ server.js
│   ├─ package.json
│   └─ .env.example
├─ README.md
├─ .gitignore
├─ erd_7tabel .drawio
└─ usecase.puml
```

---

## Cara Menjalankan

### 1. Frontend (UI Web)

```powershell
cd frontend
copy .env.example .env        # opsional (bila kosong, otomatis memakai Mode Mock)
npm install
npm run dev                    # buka http://localhost:5173
```

> **Mode Mock vs Mode Backend Asli:**
> - Jika `VITE_API_URL` di `frontend/.env` dikosongkan, frontend berjalan mandiri dalam **Mode Mock** (data demo tersimpan di `localStorage`).
> - Jika diisi `VITE_API_URL=http://localhost:8000/api`, frontend akan otomatis memanggil REST API dari backend Express.

### 2. Backend (REST API Server)

```powershell
cd backend
copy .env.example .env
npm install
npm run dev                    # berjalan di http://localhost:8000
```

Variabel konfigurasi `.env` backend:
| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `8000` | Port server Express |
| `JWT_SECRET` | `dev_secret` | Secret key untuk enkripsi token JWT |
| `CORS_ORIGIN` | `http://localhost:5173` | Domain / origin frontend |

---

### Akun Uji Coba Demo

Tersedia akun demo siap pakai (password: `password123`):
| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Pencari Kerja** | `pelamar@test.test` | `password123` | Cari lowongan, kelola CV, lamar pekerjaan, scan poster AI, cek skor kecocokan |
| **Perusahaan** | `hrd@nusantara.test` | `password123` | Dashboard metrik HR, pasang lowongan, seleksi pelamar terurut skor, ubah status |

*Reset data demo:* Hapus key `lk_db_v2` di `localStorage` (Browser DevTools → Application → Local Storage).

---

## UI/UX & Keselarasan Desain Figma

Antarmuka web dirancang dan diselaraskan **1:1 persis dengan desain High-fi di Figma**:
- **Tautan Figma:** [SI Lowongan Kerja UI/UX Design](https://www.figma.com/design/mJMwt3PbMuUrjygS9WEo4e/Untitled)
- **Design Tokens Resmi:**
  - **Warna Utama (Primary):** Biru `#1976D2` (Material Blue)
  - **Warna Aksen (Secondary):** Oranye `#FF9800`
  - **Latar Belakang:** Abu-abu halus `#F5F5F5`
  - **Warna Teks:** `#212121` (teks utama) & `#616161` (teks sekunder)
  - **Border Radius:** Kontrol `8px` (`rounded-lg`), Kartu `16px` (`rounded-2xl`)
  - **Tipografi:** Font `Inter` (Google Fonts)

---

## Pemetaan Halaman ke Kartu Trello (DK)

| Modul / Kartu Trello | Halaman / Komponen | Deskripsi Fitur |
|---|---|---|
| **Beranda Utama** | `pages/Home.jsx` | Hero banner AI, search bar besar, tag pencarian populer, 4 kartu kategori pekerjaan berikon, lowongan pilihan, dan banner CTA kelola CV. |
| **Registrasi & Login (2 Role)** | `pages/Login.jsx`, `pages/Register.jsx` | Split layout branding biru + form autentikasi untuk Pencari Kerja & Perusahaan. |
| **Pencarian & Filter Lowongan** | `pages/JobSearch.jsx` | Layout 2-kolom: Sidebar filter (tipe, kategori, urutkan) + daftar kartu lowongan dengan avatar perusahaan & skor kecocokan. |
| **Detail Lowongan & Lamar** | `pages/JobDetail.jsx` | Breadcrumb, info perusahaan, highlight keahlian cocok vs kurang, sidebar lamaran, modal konfirmasi, dan rekomendasi lowongan serupa. |
| **Profil Pencari Kerja** | `pages/seeker/SeekerProfile.jsx` | Banner profil avatar, 3 tab: *Informasi Pribadi*, *Berkas CV*, dan *Riwayat Lamaran*. |
| **Kelola Berkas CV** | `pages/seeker/CvManager.jsx` | Upload PDF/DOCX (maks. 2 MB) drag & drop, status CV aktif untuk matching AI, dan hapus berkas. |
| **Pelacakan Status Lamaran** | `pages/seeker/Applications.jsx` | Riwayat lamaran dengan timeline visual status (*Dikirim → Ditinjau → Keputusan*). |
| **Pemindaian Poster (AI OCR)** | `pages/seeker/ScanPoster.jsx` | Upload/kamera poster lowongan, ekstraksi AI dengan penanda keyakinan (<75%), dan kalkulasi kecocokan CV. |
| **Dashboard & Kelola Lowongan HR** | `pages/company/CompanyJobs.jsx` | 4 Stat Cards (*Lowongan Aktif, Total Pelamar, Matching AI, Status Terverifikasi*), tabel lowongan, edit & hapus. |
| **Form Pasang/Edit Lowongan** | `pages/company/CompanyJobForm.jsx` | Form terstruktur 3 langkah (*Info Posisi, Lokasi & Syarat AI, Status*) + panduan pengisian di samping. |
| **Seleksi & Peringkat Pelamar** | `pages/company/Applicants.jsx` | Filter status pills (*Semua, Dikirim, Ditinjau, Diterima, Ditolak*), urut skor kecocokan tertinggi, dan aksi ubah status. |
| **Profil Perusahaan** | `pages/company/CompanyProfile.jsx` | Kelola identitas perusahaan, industri, alamat, dan narasi profil. |
| **Navigasi & Header** | `components/Navbar.jsx` | Menu bersih tanpa teks profil; klik foto avatar langsung menuju halaman profil akun pengguna. |
| **Footer Aplikasi** | `components/Footer.jsx` | Identitas hak cipta dan navigasi cepat di bawah halaman. |

---

## Kontrak Endpoint REST API Backend

Semua endpoint berawalan `/api` dan menggunakan format JSON *snake_case* sesuai ERD:

| Fungsi | Method & Path | Body / Respon |
|---|---|---|
| Register Akun | `POST /api/auth/register` | Seeker: `{role, full_name, phone, email, password}`; Company: + `{company_name, industry, address}` |
| Login Akun | `POST /api/auth/login` | Balas `{ token, user }` |
| Cek Sesi (Me) | `GET /api/auth/me` | `{ id, role, email, full_name, phone, company }` |
| Profil User | `GET/PUT /api/profile` | Profil pribadi / data perusahaan |
| Berkas CV | `GET/POST /api/cvs`, `DELETE /api/cvs/:id` | Upload multipart `file`, CV terbaru dipakai untuk kalkulasi AI |
| Cari Lowongan | `GET /api/jobs?q&location&job_type&category&sort_by` | Daftar lowongan aktif + `match_score` |
| Detail Lowongan | `GET /api/jobs/:id` | Detail posisi + `match` (matched & missing skills) |
| CRUD Lowongan HR | `GET/POST /api/company/jobs`, `GET/PUT/DELETE /api/company/jobs/:id` | Khusus role perusahaan; daftar menyertakan `applicant_count` |
| Lamar Pekerjaan | `POST /api/jobs/:id/apply` | `{ cv_id }` |
| Lamaran Saya | `GET /api/applications/me` | Daftar lamaran seeker beserta status dan skor |
| Pelamar per Lowongan | `GET /api/company/jobs/:id/applicants` | Urut skor kecocokan tertinggi menurun |
| Ubah Status Pelamar | `PATCH /api/applications/:id/status` | `{ status }`: `Dikirim`, `Ditinjau`, `Diterima`, `Ditolak` |
| Scan Poster AI | `POST /api/poster/scan` | Upload gambar poster (multipart), balas `{ scan_id, fields, confidence }` |
| Konfirmasi Scan | `POST /api/poster/scans/:id/confirm` | Simpan lowongan dari poster ke daftar user |
| Daftar / Hapus Scan | `GET /api/poster/scans`, `DELETE /api/poster/scans/:id` | Kelola riwayat poster tersimpan |
