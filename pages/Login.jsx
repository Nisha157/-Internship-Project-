
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    // Temporary demo login.
    // Backend and database authentication are not connected yet.
    if (
      username.trim() === "admin" &&
      password === "admin123"
    ) {
      navigate("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <Link to="/" className="login-brand">
          <span className="login-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path
                d="M7 29L32 8L57 29M14 27V55H50V27"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 49V24M32 39L24 32M32 34L40 27M32 44L23 40M32 29L37 23"
                stroke="#E4C878"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span>
            <strong>AnnaSetu</strong>
            <small>RATION SHOP MANAGEMENT</small>
          </span>
        </Link>

        <div className="login-promo">
          <span className="login-eyebrow">
            SMART · SECURE · TRANSPARENT
          </span>

          <h1>
            Managing food
            <br />
            distribution,
            <br />
            <span>with trust.</span>
          </h1>

          <p>
            A unified platform for managing ration cards,
            beneficiaries, inventory and fair distribution
            of essential commodities.
          </p>

          <ul>
            <li>✓ Beneficiary management</li>
            <li>✓ Stock monitoring</li>
            <li>✓ Distribution records</li>
          </ul>
        </div>

        <p className="login-visual-footer">
          PUBLIC DISTRIBUTION SYSTEM
        </p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <Link to="/" className="login-back">
            ← Back to Home
          </Link>

          <div className="login-heading">
            <span>ADMINISTRATOR ACCESS</span>
            <h2>Welcome back</h2>
            <p>
              Sign in to access your ration management dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit">
              Sign in to dashboard <span>→</span>
            </button>
          </form>

          <div className="login-security">
            <span>♧</span>
            Secure access for authorized personnel only.
          </div>
        </div>

        <footer className="login-footer">
          © 2026 AnnaSetu · Ration Shop Management System
        </footer>
      </section>
    </main>
  );
}

export default Login;
