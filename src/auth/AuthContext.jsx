import { createContext, useContext, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

function readRole(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part));
    return String(payload.role || "USER").replace(/^ROLE_/, "").toUpperCase();
  } catch {
    return "USER";
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("airline_token"));
  const [role, setRole] = useState(() => localStorage.getItem("airline_role") || "USER");
  const [email, setEmail] = useState(() => localStorage.getItem("airline_email") || "");

  async function login(credentials) {
    const response = await api.post("/auth/login", credentials);
    const newToken = response.data?.token;
    if (!newToken) throw new Error("Login response did not contain a token. Check your AuthResponse DTO.");
    const newRole = readRole(newToken);
    localStorage.setItem("airline_token", newToken);
    localStorage.setItem("airline_role", newRole);
    localStorage.setItem("airline_email", credentials.email);
    setToken(newToken);
    setRole(newRole);
    setEmail(credentials.email);
    return response.data;
  }

  function logout() {
    localStorage.removeItem("airline_token");
    localStorage.removeItem("airline_role");
    localStorage.removeItem("airline_email");
    setToken(null);
    setRole("USER");
    setEmail("");
  }

  const value = useMemo(() => ({
    token, role, email, isAdmin: role === "ADMIN", login, logout
  }), [token, role, email]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}