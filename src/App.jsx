import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings";
import Admin from "./pages/Admin";

function AppRoutes() {
  const { token } = useAuth();
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="flights" element={<Flights />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}