import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Plane, ShieldCheck, Ticket, Clock3 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../api";

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-layout">
      <section className="login-hero">
        <div className="hero-brand"><span className="brand-mark"><Plane size={25} /></span> SkyBook</div>
        <div className="hero-copy"><span className="eyebrow">YOUR JOURNEY STARTS HERE</span><h1>Explore more.<br /><em>Worry less.</em></h1><p>One simple place to find flights, manage reservations, and get ready for your next journey.</p>
          <div className="hero-features"><span><Plane size={17} /> Flight search</span><span><Ticket size={17} /> Easy bookings</span><span><ShieldCheck size={17} /> Secure access</span></div>
        </div>
        <div className="hero-footer">AIRLINE RESERVATION SYSTEM · SPRING BOOT + REACT</div>
      </section>
      <section className="login-panel"><form className="login-form" onSubmit={submit}>
        <div className="mobile-brand"><Plane /> SkyBook</div>
        <span className="eyebrow">WELCOME ABOARD</span><h2>Sign in to your account</h2><p className="muted">Use the account you registered in your backend.</p>
        {error && <div className="form-error">{error}</div>}
        <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="primary-button full-width" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <span>→</span></button>
        <div className="login-note"><ShieldCheck size={16} /> Your session is authenticated with a JWT token.</div>
      </form><footer className="login-copyright">© {new Date().getFullYear()} SkyBook · Built for your next destination</footer></section>
    </div>
  );
}