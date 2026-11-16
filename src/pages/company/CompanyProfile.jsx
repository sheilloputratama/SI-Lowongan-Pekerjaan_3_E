import ProfileForm from "../../components/ProfileForm.jsx";

const FIELDS = [
  { name: "companyName", label: "Nama perusahaan", required: true },
  { name: "industry", label: "Bidang industri" },
  { name: "city", label: "Kota" },
  { name: "website", label: "Website" },
  { name: "phone", label: "No. telepon" },
  { name: "about", label: "Tentang perusahaan", type: "textarea" },
];

export default function CompanyProfile() {
  return <ProfileForm title="Profil Perusahaan" subtitle="Informasi ini tampil pada lowongan yang kamu pasang." fields={FIELDS} />;
}
