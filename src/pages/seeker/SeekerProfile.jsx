import ProfileForm from "../../components/ProfileForm.jsx";

// Sesuai tabel users: full_name, phone, email (email tidak bisa diubah).
// Keahlian tidak diisi manual: dibaca AI dari CV yang diunggah.
const FIELDS = [
  { name: "full_name", label: "Nama lengkap", required: true },
  { name: "phone", label: "No. telepon" },
  { name: "email", label: "Email", readOnly: true, hint: "Email dipakai untuk login dan tidak bisa diubah" },
];

export default function SeekerProfile() {
  return <ProfileForm title="Profil Saya" subtitle="Keahlianmu dibaca otomatis dari CV yang kamu unggah di menu CV." fields={FIELDS} />;
}
