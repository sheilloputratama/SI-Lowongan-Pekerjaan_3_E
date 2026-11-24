import ProfileForm from "../../components/ProfileForm.jsx";

// Sesuai tabel companies (name, industry, address, description) + penanggung jawab dari tabel users.
const FIELDS = [
  { name: "company_name", label: "Nama perusahaan", required: true },
  { name: "industry", label: "Bidang industri" },
  { name: "address", label: "Alamat" },
  { name: "description", label: "Deskripsi perusahaan", type: "textarea" },
  { name: "full_name", label: "Nama penanggung jawab", required: true },
  { name: "phone", label: "No. telepon" },
  { name: "email", label: "Email", readOnly: true },
];

export default function CompanyProfile() {
  return <ProfileForm title="Profil Perusahaan" subtitle="Informasi ini tampil pada lowongan yang kamu pasang." fields={FIELDS} />;
}
