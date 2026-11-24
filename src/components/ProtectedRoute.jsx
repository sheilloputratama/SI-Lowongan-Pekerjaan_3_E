import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./ui.jsx";
import { homePath } from "../utils.js";

// Membatasi halaman berdasarkan login dan role ("seeker" atau "company").
export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={homePath(user)} replace />;
  return children;
}


