import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Plane, Building2 } from "lucide-react";
import api, { getErrorMessage } from "../api";
import Notice from "../components/Notice";
import Loading from "../components/Loading";

const emptyFlight = { flightNumber: "", departureAirportId: "", arrivalAirportId: "", departureTime: "", arrivalTime: "", fare: "", availableSeats: "" };
const emptyAirport = { code: "", name: "", city: "" };

export default function Admin() {
  const [tab, setTab] = useState("flights");
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [flight, setFlight] = useState(emptyFlight);
  const [airport, setAirport] = useState(emptyAirport);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [f, a] = await Promise.all([api.get("/flights"), api.get("/airports")]);
      setFlights(Array.isArray(f.data) ? f.data : f.data?.content || []);
      setAirports(Array.isArray(a.data) ? a.data : a.data?.content || []);
    } catch (e) { setNotice({ type: "error", text: getErrorMessage(e) }); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createFlight(event) {
    event.preventDefault();
    try {
      const payload = {
        flightNumber: flight.flightNumber.trim(),
        departureAirportId: Number(flight.departureAirportId),
        arrivalAirportId: Number(flight.arrivalAirportId),
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        fare: Number(flight.fare),
        availableSeats: Number(flight.availableSeats)
      };
      await api.post("/flights", payload);
      setNotice({ type: "success", text: "Flight created." });
      setFlight(emptyFlight);
      await load();
    } catch (e) { setNotice({ type: "error", text: getErrorMessage(e) }); }
  }

  async function createAirport(event) {
    event.preventDefault();
    try {
      await api.post("/airports", { code: airport.code.trim().toUpperCase(), name: airport.name.trim(), city: airport.city.trim() });
      setNotice({ type: "success", text: "Airport created." });
      setAirport(emptyAirport);
      await load();
    } catch (e) { setNotice({ type: "error", text: getErrorMessage(e) }); }
  }

  async function deleteFlight(id) {
    if (!window.confirm(`Delete flight ${id}?`)) return;
    try { await api.delete(`/flights/${id}`); setNotice({ type: "success", text: "Flight deleted." }); await load(); }
    catch (e) { setNotice({ type: "error", text: getErrorMessage(e) }); }
  }

  async function deleteAirport(id) {
    if (!window.confirm(`Delete airport ${id}? Flights may reference it.`)) return;
    try { await api.delete(`/airports/${id}`); setNotice({ type: "success", text: "Airport deleted." }); await load(); }
    catch (e) { setNotice({ type: "error", text: getErrorMessage(e) }); }
  }

  if (loading) return <Loading label="Loading admin data..." />;

  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">ADMINISTRATION</span><h1>Management panel</h1><p className="muted">Create and manage airport and flight records.</p></div><button className="icon-button" onClick={load}><RefreshCw size={18} /></button></div>
    <Notice notice={notice} onClose={() => setNotice(null)} />
    <div className="admin-tabs"><button className={tab === "flights" ? "active" : ""} onClick={() => setTab("flights")}><Plane size={17} /> Flights</button><button className={tab === "airports" ? "active" : ""} onClick={() => setTab("airports")}><Building2 size={17} /> Airports</button></div>
    {tab === "flights" ? <>
      <section className="section-card"><div className="section-heading"><div><span className="eyebrow">NEW RECORD</span><h2>Create flight</h2></div></div>
        <form className="admin-form" onSubmit={createFlight}>
          <div className="field"><label>Flight number</label><input value={flight.flightNumber} onChange={e => setFlight({...flight, flightNumber:e.target.value})} required /></div>
          <div className="field"><label>Departure airport</label><select value={flight.departureAirportId} onChange={e => setFlight({...flight, departureAirportId:e.target.value})} required><option value="">Select airport</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} — {a.city}</option>)}</select></div>
          <div className="field"><label>Arrival airport</label><select value={flight.arrivalAirportId} onChange={e => setFlight({...flight, arrivalAirportId:e.target.value})} required><option value="">Select airport</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} — {a.city}</option>)}</select></div>
          <div className="field"><label>Departure date & time</label><input type="datetime-local" value={flight.departureTime} onChange={e => setFlight({...flight, departureTime:e.target.value})} required /></div>
          <div className="field"><label>Arrival date & time</label><input type="datetime-local" value={flight.arrivalTime} onChange={e => setFlight({...flight, arrivalTime:e.target.value})} required /></div>
          <div className="field"><label>Fare (₹)</label><input type="number" min="1" value={flight.fare} onChange={e => setFlight({...flight, fare:e.target.value})} required /></div>
          <div className="field"><label>Available seats</label><input type="number" min="1" value={flight.availableSeats} onChange={e => setFlight({...flight, availableSeats:e.target.value})} required /></div>
          <button className="primary-button"><Plus size={17} /> Create flight</button>
        </form>
      </section>
      <section className="section-card"><div className="section-heading"><h2>Flights ({flights.length})</h2></div><div className="table-wrap"><table><thead><tr><th>ID</th><th>Number</th><th>Route IDs</th><th>Departure</th><th>Fare</th><th>Seats</th><th></th></tr></thead><tbody>{flights.map(f => <tr key={f.id}><td>{f.id}</td><td>{f.flightNumber}</td><td>{f.departureAirportId} → {f.arrivalAirportId}</td><td>{f.departureTime}</td><td>₹{f.fare}</td><td>{f.availableSeats}</td><td><button className="table-danger" onClick={() => deleteFlight(f.id)} title="Delete flight"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div></section>
    </> : <>
      <section className="section-card"><div className="section-heading"><div><span className="eyebrow">NEW RECORD</span><h2>Create airport</h2></div></div>
        <form className="inline-form" onSubmit={createAirport}><div className="field"><label>Airport code</label><input maxLength="10" value={airport.code} onChange={e => setAirport({...airport, code:e.target.value})} required /></div><div className="field"><label>Airport name</label><input value={airport.name} onChange={e => setAirport({...airport, name:e.target.value})} required /></div><div className="field"><label>City</label><input value={airport.city} onChange={e => setAirport({...airport, city:e.target.value})} required /></div><button className="primary-button"><Plus size={17} /> Create airport</button></form>
      </section>
      <section className="section-card"><div className="section-heading"><h2>Airports ({airports.length})</h2></div><div className="table-wrap"><table><thead><tr><th>ID</th><th>Code</th><th>Name</th><th>City</th><th></th></tr></thead><tbody>{airports.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.code}</td><td>{a.name}</td><td>{a.city}</td><td><button className="table-danger" onClick={() => deleteAirport(a.id)} title="Delete airport"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div></section>
    </>}
  </div>;
}