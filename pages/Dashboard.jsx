import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const stats = [
  {
    title: "Total Beneficiaries",
    value: "0",
    icon: "users",
    color: "green",
    description: "Registered beneficiaries",
  },
  {
    title: "Ration Cards",
    value: "0",
    icon: "credit-card",
    color: "gold",
    description: "Total ration cards",
  },
  {
    title: "Stock Items",
    value: "0",
    icon: "package",
    color: "blue",
    description: "Items in inventory",
  },
  {
    title: "Distributions",
    value: "0",
    icon: "truck",
    color: "purple",
    description: "Distribution records",
  },
];

const managementItems = [
  {
    icon: "users",
    title: "Beneficiary Management",
    description: "Manage beneficiary details and registrations.",
    path: "/beneficiaries",
  },
  {
    icon: "credit-card",
    title: "Ration Card Management",
    description: "View and manage ration card information.",
    path: "/ration-cards",
  },
  {
    icon: "package",
    title: "Stock Management",
    description: "Monitor essential commodities and stock.",
    path: "/stock",
  },
  {
    icon: "truck",
    title: "Distribution Management",
    description: "Manage ration distribution records.",
    path: "/distribution",
  },
  
  {
    icon: "package",
    title: "Monthly Allocation",
    description: "Manage monthly ration quantities for ration cards.",
    path: "/allocation",
  },
  {
    icon: "file",
    title: "Reports",
    description: "Review management and distribution reports.",
    path: "/reports",
  },
  {
    icon: "settings",
    title: "Settings",
    description: "Manage system settings and preferences.",
    path: "/settings",
  },
];

const iconPaths = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  "credit-card": (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  package: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h12v12H3zM15 10h4l3 4v4h-7z" />
      <circle cx="7.5" cy="19" r="1.5" />
      <circle cx="18.5" cy="19" r="1.5" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L5.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1L9 7.3h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" />
    </>
  ),
};

function Icon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
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
            <small>ADMIN PANEL</small>
          </span>
        </Link>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <a href="#overview" className="dashboard-nav-item active">
            <Icon name="file" size={19} />
            <span>Dashboard</span>
          </a>
          {managementItems.map((item) => (
            <Link
              to={item.path}
              className="dashboard-nav-item"
              key={item.title}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">i</span>
            <div>
              <strong>Need assistance?</strong>
              <p>Contact your system administrator.</p>
            </div>
          </div>
          <Link to="/" className="dashboard-logout">
            ← Back to Home
          </Link>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-breadcrumb">Pages / Overview</p>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-eyebrow">ANNASETU MANAGEMENT PORTAL</span>
            <h2>Welcome to AnnaSetu!</h2>
            <p>
              Manage beneficiaries, ration cards, stock and distribution
              activities from one place.
            </p>
          </div>
          <div className="welcome-symbol" aria-hidden="true">
            <Icon name="package" size={70} />
          </div>
        </section>

        <section className="dashboard-stats" aria-label="Summary statistics">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon name={stat.icon} size={24} />
              </div>
              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
              <span>{stat.description}</span>
            </article>
          ))}
        </section>

        <section className="management-section">
          <div className="section-heading">
            <div>
              <h2>Quick Management</h2>
              <p>Choose a module to manage your ration shop operations.</p>
            </div>
          </div>

          <div className="management-grid">
            {managementItems.map((item) => (
              <Link
                to={item.path}
                className="management-card"
                key={item.title}
              >
                <span className="management-icon">
                  <Icon name={item.icon} size={23} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="management-link">
                  Open module <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 AnnaSetu</span>
          <span>Ration Shop Management System</span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;