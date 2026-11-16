import ProfileForm from "../../components/ProfileForm.jsx";

const FIELDS = [
  { name: "fullName", label: "Nama lengkap", required: true },
  { name: "phone", label: "No. telepon" },
  { name: "city", label: "Kota domisili" },
  { name: "headline", label: "Headline", hint: "Contoh: Fresh graduate Teknologi Informasi" },
  { name: "education", label: "Pendidikan" },
  { name: "about", label: "Tentang saya", type: "textarea" },
  { name: "skills", label: "Keahlian", type: "tags", hint: "Dipakai untuk menghitung kecocokan dengan lowongan" },
];

export default function SeekerProfile() {
  return <ProfileForm title="Profil Saya" subtitle="Lengkapi profil agar perusahaan mengenal kamu." fields={FIELDS} />;
}
