import { useEffect, useMemo, useState } from "react";
import {
  Search,
  PlaneTakeoff,
  PlaneLanding,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../auth/AuthContext";
import Notice from "../components/Notice";
import Loading from "../components/Loading";

import { Plane } from "lucide-react";
export default function Flights() {
  const { token } = useAuth();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");
  const [maxFare, setMaxFare] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [flightResponse, airportResponse] = await Promise.all([
        api.get("/flights"),
        api.get("/airports").catch(() => ({ data: [] })),
      ]);
      const f = flightResponse.data;
      const a = airportResponse.data;
      setFlights(Array.isArray(f) ? f : f?.content || []);
      setAirports(Array.isArray(a) ? a : a?.content || []);
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const airportName = (id) => {
    const airport = airports.find((a) => String(a.id) === String(id));
    return airport
      ? `${airport.city || airport.name} (${airport.code})`
      : `Airport #${id ?? "—"}`;
  };

  const filtered = useMemo(
    () =>
      flights.filter((f) => {
        const text =
          `${f.flightNumber || ""} ${airportName(f.departureAirportId)} ${airportName(f.arrivalAirportId)}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (!maxFare || Number(f.fare) <= Number(maxFare))
        );
      }),
    [flights, airports, query, maxFare],
  );

  async function book(event) {
    event.preventDefault();
    if (!selectedFlight || !passengerId) {
      setNotice({
        type: "error",
        text: "Select a flight and enter your existing passenger ID.",
      });
      return;
    }
    try {
      const response = await api.post("/bookings", {
        passengerId: Number(passengerId),
        flightId: Number(selectedFlight),
      });
      setNotice({
        type: "success",
        text: `Booking created. Reference: ${response.data?.bookingReference || "check My Bookings"}`,
      });
      setSelectedFlight("");
      await load();
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e) });
    }
  }

  if (loading) return <Loading label="Loading available flights..." />;

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">DISCOVER YOUR ROUTE</span>
          <h1>Find your flight</h1>
          <p className="muted">Browse available flights and fares.</p>
        </div>
        <button className="icon-button" onClick={load} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <section className="filter-bar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search flights"
            placeholder="Flight number or route"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="fare-filter">
          <label htmlFor="maxFare">Maximum fare (₹)</label>
          <input
            id="maxFare"
            type="number"
            min="0"
            placeholder="Any fare"
            value={maxFare}
            onChange={(e) => setMaxFare(e.target.value)}
          />
        </div>
        <span className="results-count">{filtered.length} flights</span>
      </section>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <PlaneTakeoff size={34} />
          <h3>No flights found</h3>
          <p>Try a different search or clear the fare filter.</p>
        </div>
      ) : (
        <div className="flight-list">
          {filtered.map((f) => (
            <article className="flight-result" key={f.id}>
              <div className="flight-main">
                <div className="airline-symbol">
                  <Plane size={21} />
                </div>
                <div>
                  <strong>{f.flightNumber || `Flight ${f.id}`}</strong>
                  <small>Flight ID: {f.id}</small>
                </div>
              </div>
              <div className="route-block">
                <div>
                  <small>DEPARTURE</small>
                  <strong>{airportName(f.departureAirportId)}</strong>
                  <span>{f.departureTime || "Time not listed"}</span>
                </div>
                <div className="route-line">
                  <span />
                  <Plane size={16} />
                  <span />
                </div>
                <div>
                  <small>ARRIVAL</small>
                  <strong>{airportName(f.arrivalAirportId)}</strong>
                  <span>{f.arrivalTime || "Time not listed"}</span>
                </div>
              </div>
              <div className="fare-block">
                <small>FARE</small>
                <strong>₹{Number(f.fare || 0).toLocaleString("en-IN")}</strong>
                <span>{f.availableSeats ?? "—"} seats</span>
              </div>
              <button
                className="primary-button book-select"
                disabled={Number(f.availableSeats) === 0}
                onClick={() => {
                  setSelectedFlight(String(f.id));
                  document
                    .getElementById("booking-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Select flight
              </button>
            </article>
          ))}
        </div>
      )}
      <section className="section-card booking-panel" id="booking-form">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RESERVE YOUR SEAT</span>
            <h2>Book a flight</h2>
            <p className="muted">
              Select a flight above and enter an existing passenger ID from your
              database.
            </p>
          </div>
        </div>
        <form className="inline-form" onSubmit={book}>
          <div className="field">
            <label htmlFor="flightId">Selected flight ID</label>
            <input
              id="flightId"
              type="number"
              min="1"
              value={selectedFlight}
              onChange={(e) => setSelectedFlight(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="passengerId">Passenger ID</label>
            <input
              id="passengerId"
              type="number"
              min="1"
              value={passengerId}
              onChange={(e) => setPassengerId(e.target.value)}
              required
            />
          </div>
          <button className="primary-button">Confirm booking</button>
        </form>
      </section>
    </div>
  );
}
