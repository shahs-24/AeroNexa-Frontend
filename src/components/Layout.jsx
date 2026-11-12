import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Plane, LayoutDashboard, Ticket, ShieldCheck, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { role, email, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand"><span className="brand-mark"><Plane size={22} /></span><span>SkyBook<small> AIRLINE RESERVATION</small></span></NavLink>
        <div className="nav-label">MENU</div>
        <NavLink to="/" end className="nav-link"><LayoutDashboard size={18} />Dashboard</NavLink>
        <NavLink to="/flights" className="nav-link"><Plane size={18} />Find flights</NavLink>
        <NavLink to="/bookings" className="nav-link"><Ticket size={18} />My bookings</NavLink>
        {isAdmin && <><div className="nav-label">MANAGEMENT</div><NavLink to="/admin" className="nav-link"><ShieldCheck size={18} />Admin panel</NavLink></>}
        <div className="sidebar-bottom">
          <div className="user-chip"><span className="avatar"><UserRound size={18} /></span><span className="user-details"><strong>{email || "Signed in"}</strong><small>{role}</small></span></div>
          <button className="logout-button" onClick={handleLogout}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><span>Air travel, made simpler.</span><span className={`role-pill ${isAdmin ? "admin" : ""}`}>{role} ACCOUNT</span></header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}