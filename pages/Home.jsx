
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <Link to="/" className="home-brand">
          <span className="home-brand-icon">⌂</span>
          <span>
            <strong>AnnaSetu</strong>
            <small>RATION SHOP MANAGEMENT</small>
          </span>
        </Link>

        <div className="home-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="nav-login">
            Login <span>→</span>
          </Link>
        </div>
      </nav>

      <main>
        <section className="home-hero" id="home">
          <div className="hero-content">
            <span className="home-eyebrow">
              SMART • SECURE • TRANSPARENT
            </span>

            <h1>
              Every Grain
              <br />
              Counts. Every
              <br />
              <span>Family Matters.</span>
            </h1>

            <p>
              A smarter way to manage ration distribution,
              monitor essential commodities, and serve every
              beneficiary with transparency and care.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="hero-primary">
                Get Started <span>→</span>
              </Link>
              <a href="#about" className="hero-secondary">
                Discover AnnaSetu
              </a>
            </div>

            <div className="hero-trust">
              <span>✓ Transparent Distribution</span>
              <span>✓ Efficient Stock Management</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="grain-circle">
              <div className="grain-icon">🌾</div>
              <span>ANNA</span>
              <strong>SETU</strong>
              <small>FOOD FOR EVERY FAMILY</small>
            </div>
            <div className="floating-card">
              <span>✓</span>
              <div>
                <strong>Trusted Distribution</strong>
                <small>Managing essentials responsibly</small>
              </div>
            </div>
          </div>
        </section>

        <section className="home-about" id="about">
          <span className="section-label">ABOUT OUR SYSTEM</span>
          <h2>Technology with a purpose.</h2>
          <p>
            AnnaSetu is a ration shop management system designed
            to organize beneficiary records, maintain stock
            information, and support transparent distribution
            of essential commodities.
          </p>
        </section>

        <section className="home-services" id="services">
          <span className="section-label">WHAT WE OFFER</span>
          <h2>One platform. Better management.</h2>

          <div className="service-grid">
            <article className="service-card">
              <span className="service-icon">▤</span>
              <h3>Ration Card Management</h3>
              <p>Organized beneficiary and ration card records.</p>
            </article>

            <article className="service-card">
              <span className="service-icon">▦</span>
              <h3>Stock Management</h3>
              <p>Clear records of available essential commodities.</p>
            </article>

            <article className="service-card">
              <span className="service-icon">↗</span>
              <h3>Distribution Records</h3>
              <p>Maintain distribution transactions and history.</p>
            </article>
          </div>
        </section>

        <section className="home-contact" id="contact">
          <div>
            <span className="section-label">ANNASetu</span>
            <h2>Building a more transparent distribution system.</h2>
          </div>
          <Link to="/login" className="hero-primary">
            Access Portal →
          </Link>
        </section>
      </main>

      <footer className="home-footer">
        <strong>AnnaSetu</strong>
        <span>Ration Shop Management System</span>
        <span>© 2026 AnnaSetu</span>
      </footer>
    </div>
  );
}

export default Home;