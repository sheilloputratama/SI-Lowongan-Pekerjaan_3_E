import { Link, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { homePath } from "./utils.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import JobSearch from "./pages/JobSearch.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import SeekerProfile from "./pages/seeker/SeekerProfile.jsx";
import CvManager from "./pages/seeker/CvManager.jsx";
import Applications from "./pages/seeker/Applications.jsx";
import ScanPoster from "./pages/seeker/ScanPoster.jsx";
import CompanyProfile from "./pages/company/CompanyProfile.jsx";
import CompanyJobs from "./pages/company/CompanyJobs.jsx";
import CompanyJobForm from "./pages/company/CompanyJobForm.jsx";
import Applicants from "./pages/company/Applicants.jsx";

// Halaman login/daftar tidak perlu diakses lagi kalau sudah masuk.
function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (ready && user) return <Navigate to={homePath(user)} replace />;
  return children;
}

const seeker = (el) => <ProtectedRoute role="seeker">{el}</ProtectedRoute>;
const company = (el) => <ProtectedRoute role="company">{el}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<JobSearch />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

          <Route path="/profile" element={seeker(<SeekerProfile />)} />
          <Route path="/cv" element={seeker(<CvManager />)} />
          <Route path="/applications" element={seeker(<Applications />)} />
          <Route path="/scan" element={seeker(<ScanPoster />)} />

          <Route path="/company/profile" element={company(<CompanyProfile />)} />
          <Route path="/company/jobs" element={company(<CompanyJobs />)} />
          <Route path="/company/jobs/new" element={company(<CompanyJobForm />)} />
          <Route path="/company/jobs/:id/edit" element={company(<CompanyJobForm />)} />
          <Route path="/company/jobs/:id/applicants" element={company(<Applicants />)} />

          <Route path="*" element={<p className="py-20 text-center text-slate-500">Halaman tidak ditemukan. <Link to="/" className="text-indigo-600">Ke beranda</Link></p>} />
        </Routes>
      </main>
    </>
  );
}


