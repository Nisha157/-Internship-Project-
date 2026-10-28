
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Settings.css";

const STORAGE_KEY = "annasetu_settings";

const defaultSettings = {
  adminName: "Administrator",
  username: "admin",
  shopName: "",
  shopNumber: "",
  shopAddress: "",
  mobile: "",
  language: "English",
  dateFormat: "DD/MM/YYYY",
  notifications: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {
    // Use defaults if saved settings cannot be read.
  }

  return { ...defaultSettings };
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!message) return undefined;

    const timeout = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setMessage("Settings saved successfully in this browser.");
    } catch {
      setMessage("Unable to save settings. Check your browser storage.");
    }
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setMessage("New password must contain at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage(
      "Password change needs Django authentication. No password was changed."
    );
  };

  const resetSettings = () => {
    if (!window.confirm("Reset all settings to their default values?")) {
      return;
    }

    setSettings({ ...defaultSettings });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultSettings)
      );
      setMessage("Settings have been reset.");
    } catch {
      setMessage("Unable to reset settings in browser storage.");
    }
  };

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <Link to="/dashboard" className="settings-back">
            ← Back to Dashboard
          </Link>
          <h1>Settings</h1>
          <p>Manage your AnnaSetu account and shop preferences.</p>
        </div>

        <button
          type="button"
          className="settings-reset-btn"
          onClick={resetSettings}
        >
          Reset Settings
        </button>
      </header>

      {message && (
        <div className="settings-message" role="status">
          <span aria-hidden="true">✓</span>
          {message}
        </div>
      )}

      <section className="settings-profile-banner">
        <div className="settings-avatar">
          {(settings.adminName.trim().charAt(0) || "A").toUpperCase()}
        </div>

        <div className="settings-profile-info">
          <span className="settings-eyebrow">ADMINISTRATOR ACCOUNT</span>
          <h2>{settings.adminName || "Administrator"}</h2>
          <p>@{settings.username || "admin"} · AnnaSetu Management Portal</p>
        </div>

        <span className="settings-status">
          <span /> Admin
        </span>
      </section>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <p className="settings-sidebar-label">SETTINGS MENU</p>

          <button
            type="button"
            className={`settings-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <span>⚙</span> General Settings
          </button>

          <button
            type="button"
            className={`settings-tab ${activeTab === "shop" ? "active" : ""}`}
            onClick={() => setActiveTab("shop")}
          >
            <span>▤</span> Shop Information
          </button>

          <button
            type="button"
            className={`settings-tab ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <span>☷</span> Preferences
          </button>

          <button
            type="button"
            className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <span>♙</span> Security
          </button>

          <div className="settings-sidebar-note">
            <strong>Need assistance?</strong>
            <p>Contact your system administrator for account or access issues.</p>
          </div>
        </aside>

        <div className="settings-content">
          {activeTab === "general" && (
            <form onSubmit={handleSave} className="settings-card">
              <div className="settings-section-heading">
                <div>
                  <h2>General Settings</h2>
                  <p>Update your administrator profile details.</p>
                </div>
                <span className="settings-section-icon">♙</span>
              </div>

              <div className="settings-form-grid">
                <label>
                  Administrator Name *
                  <input
                    name="adminName"
                    value={settings.adminName}
                    onChange={handleChange}
                    placeholder="Enter administrator name"
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Username *
                  <input
                    name="username"
                    value={settings.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    maxLength={50}
                  />
                </label>
              </div>

              <div className="settings-info-note">
                <strong>Account information</strong>
                <p>
                  These profile fields are local display settings. They do
                  not change the username used by Django authentication.
                </p>
              </div>

              <div className="settings-form-actions">
                <button className="settings-save-btn" type="submit">
                  Save Changes →
                </button>
              </div>
            </form>
          )}

          {activeTab === "shop" && (
            <form onSubmit={handleSave} className="settings-card">
              <div className="settings-section-heading">
                <div>
                  <h2>Shop Information</h2>
                  <p>Maintain the details of your ration shop.</p>
                </div>
                <span className="settings-section-icon">▤</span>
              </div>

              <div className="settings-form-grid">
                <label>
                  Ration Shop Name *
                  <input
                    name="shopName"
                    value={settings.shopName}
                    onChange={handleChange}
                    placeholder="Enter shop name"
                    required
                    maxLength={150}
                  />
                </label>

                <label>
                  Shop / License Number
                  <input
                    name="shopNumber"
                    value={settings.shopNumber}
                    onChange={handleChange}
                    placeholder="Enter shop number"
                    maxLength={50}
                  />
                </label>

                <label>
                  Contact Mobile Number
                  <input
                    name="mobile"
                    type="tel"
                    value={settings.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </label>

                <label className="settings-full-width">
                  Shop Address *
                  <textarea
                    name="shopAddress"
                    value={settings.shopAddress}
                    onChange={handleChange}
                    placeholder="Enter complete shop address"
                    rows={4}
                    required
                    maxLength={500}
                  />
                </label>
              </div>

              <div className="settings-form-actions">
                <button className="settings-save-btn" type="submit">
                  Save Shop Details →
                </button>
              </div>
            </form>
          )}

          {activeTab === "preferences" && (
            <form onSubmit={handleSave} className="settings-card">
              <div className="settings-section-heading">
                <div>
                  <h2>System Preferences</h2>
                  <p>Choose how information is displayed in your portal.</p>
                </div>
                <span className="settings-section-icon">☷</span>
              </div>

              <div className="settings-form-grid">
                <label>
                  Preferred Language
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                  >
                    <option value="English">English</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                  </select>
                </label>

                <label>
                  Date Format
                  <select
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </label>
              </div>

              <div className="settings-preference-row">
                <div>
                  <strong>Enable notifications</strong>
                  <p>Store your notification preference for this browser.</p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleChange}
                  />
                  <span className="settings-switch-track" />
                </label>
              </div>

              <div className="settings-info-note">
                <strong>Note</strong>
                <p>
                  Saving a language or date format preference does not
                  automatically translate the other pages. That requires
                  additional application-wide integration.
                </p>
              </div>

              <div className="settings-form-actions">
                <button className="settings-save-btn" type="submit">
                  Save Preferences →
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordChange}
              className="settings-card"
            >
              <div className="settings-section-heading">
                <div>
                  <h2>Security Settings</h2>
                  <p>Manage your account password securely.</p>
                </div>
                <span className="settings-section-icon">♧</span>
              </div>

              <div className="settings-security-warning">
                <strong>Password update is not connected yet</strong>
                <p>
                  The form below validates your entries only. It will not
                  change your actual account password until Django
                  authentication is integrated.
                </p>
              </div>

              <div className="settings-security-fields">
                <label>
                  Current Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        currentPassword: event.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                    required
                  />
                </label>

                <label>
                  New Password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        newPassword: event.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </label>

                <label>
                  Confirm New Password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Re-enter new password"
                    minLength={8}
                    required
                  />
                </label>
              </div>

              <div className="settings-form-actions">
                <button className="settings-save-btn" type="submit">
                  Validate Password Change
                </button>
              </div>
            </form>
          )}

          <div className="settings-bottom-note">
            <span>♧</span>
            <p>
              AnnaSetu · Ration Shop Management System
              <br />
              Local preferences are stored in this browser.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Settings;