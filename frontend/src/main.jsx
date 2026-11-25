import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F5F5] text-[#212121]">
          <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-[#dfe5ec] shadow-sm text-center space-y-3">
            <span className="text-3xl block">⚠️</span>
            <h1 className="text-lg font-bold text-red-600">Terjadi Kendala pada Halaman</h1>
            <p className="text-xs text-[#616161]">
              {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
              className="mt-3 inline-block px-4 py-2 bg-[#1976d2] text-white text-xs font-semibold rounded-lg"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
