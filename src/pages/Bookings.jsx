import { useEffect, useState } from "react";
import { RefreshCw, Ticket, CalendarClock } from "lucide-react";
import api, { getErrorMessage } from "../api";
import Notice from "../components/Notice";
import Loading from "../components/Loading";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const response = await api.get("/bookings/my-history");
      const data = response.data;
      setBookings(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e) });
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setNotice({ type: "success", text: "Booking cancelled and seat availability updated." });
      await load();
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e) });
    }
  }

  if (loading) return <Loading label="Loading your bookings..." />;

  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">YOUR TRAVEL PLANS</span><h1>My bookings</h1><p className="muted">View reservation references and manage eligible bookings.</p></div><button className="icon-button" onClick={load}><RefreshCw size={18} /></button></div>
    <Notice notice={notice} onClose={() => setNotice(null)} />
    {bookings.length === 0 ? <div className="empty-state"><Ticket size={36} /><h3>No bookings yet</h3><p>When you reserve a flight, it will appear here.</p></div> :
      <div className="booking-list">{bookings.map(b => {
        const status = String(b.status || "UNKNOWN").toUpperCase();
        return <article className="booking-row" key={b.id}><div className="booking-icon"><Ticket size={22} /></div><div className="booking-info"><div className="booking-title"><strong>{b.bookingReference || `Booking #${b.id}`}</strong><span className={`status ${status.toLowerCase()}`}>{status}</span></div><p>Booking ID: {b.id} · Flight ID: {b.flightId ?? b.flight?.id ?? "—"}</p><small><CalendarClock size={14} /> {b.bookingTime ? new Date(b.bookingTime).toLocaleString() : "Booking date unavailable"}</small></div><div className="booking-actions">{status === "CONFIRMED" && <button className="danger-button" onClick={() => cancel(b.id)}>Cancel booking</button>}</div></article>;
      })}</div>}
  </div>;
}