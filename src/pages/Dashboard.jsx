import { useEffect, useState } from "react";
import { ArrowUpRight, Plane, Ticket, CheckCircle2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import Loading from "../components/Loading";

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/flights").then(r => r.data),
      api.get("/bookings/my-history").then(r => r.data)
    ]).then(([f, b]) => {
      setFlights(Array.isArray(f) ? f : f?.content || []);
      setBookings(Array.isArray(b) ? b : b?.content || []);
    }).catch(e => setError(getErrorMessage(e))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Preparing your dashboard..." />;

  return <div className="page-stack">
    <section className="welcome-banner"><div><span className="eyebrow light">YOUR NEXT ADVENTURE</span><h1>Where will you go next?</h1><p>Find your flight and keep your travel plans in one place.</p><Link className="button-light" to="/flights">Explore flights <ArrowUpRight size={17} /></Link></div><div className="banner-plane"><Plane size={90} strokeWidth={1} /></div></section>
    {error && <div className="form-error">{error}</div>}
    <div className="stat-grid"><div className="stat-card"><span className="stat-icon blue"><Plane /></span><div><small>Available flights</small><strong>{flights.length}</strong></div></div><div className="stat-card"><span className="stat-icon green"><Ticket /></span><div><small>Your bookings</small><strong>{bookings.length}</strong></div></div><div className="stat-card"><span className="stat-icon gold"><CheckCircle2 /></span><div><small>Confirmed</small><strong>{bookings.filter(b => String(b.status).toUpperCase() === "CONFIRMED").length}</strong></div></div></div>
    <section className="section-card"><div className="section-heading"><div><span className="eyebrow">QUICK ACCESS</span><h2>Manage your journey</h2></div></div><div className="quick-grid"><Link to="/flights" className="quick-card"><span className="quick-icon"><Search /></span><strong>Find a flight</strong><p>Browse flights and fares.</p><ArrowUpRight size={18} /></Link><Link to="/bookings" className="quick-card"><span className="quick-icon purple"><Ticket /></span><strong>My bookings</strong><p>View reservations and cancel when eligible.</p><ArrowUpRight size={18} /></Link></div></section>
  </div>;
}