import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then((u) => setUser(u)).finally(() => setReady(true));
  }, []);

  const login = async (creds) => { const s = await api.login(creds); setUser(s.user); return s.user; };
  const register = async (payload) => { const s = await api.register(payload); setUser(s.user); return s.user; };
  const logout = () => { api.logout(); setUser(null); };
  const refreshUser = async () => setUser(await api.me());

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
