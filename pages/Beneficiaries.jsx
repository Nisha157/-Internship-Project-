
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Beneficiaries.css";

const API_URL = "http://127.0.0.1:8000/api/beneficiaries/";

const emptyForm = {
  full_name: "",
  aadhaar_no: "",
  mobile_no: "",
  address: "",
  family_size: "1",
  status: true,
};

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBeneficiaries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Unable to load data (${response.status})`);
      }

      const data = await response.json();
      setBeneficiaries(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(
        "Cannot connect to Django API. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{12}$/.test(form.aadhaar_no)) {
      setError("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    if (!/^\d{10,15}$/.test(form.mobile_no)) {
      setError("Mobile number must contain 10 to 15 digits.");
      return;
    }

    if (Number(form.family_size) < 1) {
      setError("Family size must be at least 1.");
      return;
    }

    const payload = {
      ...form,
      family_size: Number(form.family_size),
    };

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}${editingId}/`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = Object.entries(result)
          .map(([key, value]) => `${key}: ${[].concat(value).join(", ")}`)
          .join("\n");

        throw new Error(details || `Request failed (${response.status})`);
      }

      resetForm();
      setSuccess(
        editingId
          ? "Beneficiary updated successfully."
          : "Beneficiary added successfully."
      );

      await loadBeneficiaries();
    } catch (err) {
      setError(err.message || "Unable to save beneficiary.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      full_name: item.full_name || "",
      aadhaar_no: item.aadhaar_no || "",
      mobile_no: item.mobile_no || "",
      address: item.address || "",
      family_size: String(item.family_size ?? 1),
      status: item.status ?? true,
    });

    setEditingId(item.beneficiary_id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this beneficiary?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403 || response.status === 401
            ? "You do not have permission to delete this record."
            : `Delete failed (${response.status}).`
        );
      }

      setSuccess("Beneficiary deleted successfully.");
      await loadBeneficiaries();
    } catch (err) {
      setError(err.message || "Unable to delete beneficiary.");
    }
  };

  const filteredBeneficiaries = beneficiaries.filter((item) =>
    `${item.full_name} ${item.mobile_no} ${item.aadhaar_no}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="beneficiary-page">
      <header className="beneficiary-header">
        <div>
          <Link to="/dashboard" className="beneficiary-back">
            ← Back to Dashboard
          </Link>
          <h1>Beneficiary Management</h1>
          <p>Manage ration shop beneficiary information.</p>
        </div>

        <button
          className="beneficiary-add-btn"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
              setError("");
              setSuccess("");
            }
          }}
        >
          {showForm ? "Cancel Form" : "+ Add Beneficiary"}
        </button>
      </header>

      {error && (
        <div className="beneficiary-message beneficiary-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="beneficiary-message beneficiary-success" role="status">
          {success}
        </div>
      )}

      {showForm && (
        <section className="beneficiary-form-card">
          <h2>{editingId ? "Edit Beneficiary" : "Add New Beneficiary"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="beneficiary-form-grid">
              <label>
                Full Name *
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Aadhaar Number *
                <input
                  name="aadhaar_no"
                  value={form.aadhaar_no}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  placeholder="12-digit test number"
                  title="Enter exactly 12 digits"
                  required
                />
              </label>

              <label>
                Mobile Number *
                <input
                  name="mobile_no"
                  type="tel"
                  value={form.mobile_no}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{10,15}"
                  maxLength={15}
                  placeholder="Enter mobile number"
                  required
                />
              </label>

              <label>
                Family Members *
                <input
                  name="family_size"
                  type="number"
                  min="1"
                  value={form.family_size}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Address *
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                />
              </label>

              <label className="beneficiary-status-label">
                <input
                  name="status"
                  type="checkbox"
                  checked={form.status}
                  onChange={handleChange}
                />
                Active beneficiary
              </label>
            </div>

            <div className="beneficiary-form-actions">
              <button
                type="submit"
                className="beneficiary-add-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Beneficiary"
                    : "Save Beneficiary"}
              </button>

              <button
                type="button"
                className="beneficiary-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="beneficiary-list-card">
        <div className="beneficiary-list-heading">
          <div>
            <h2>Beneficiary List</h2>
            <p>Total beneficiaries: {beneficiaries.length}</p>
          </div>

          <input
            className="beneficiary-search"
            type="search"
            placeholder="Search name, mobile or Aadhaar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="beneficiary-table-wrap">
          <table className="beneficiary-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Address</th>
                <th>Family Members</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="beneficiary-empty">
                    Loading beneficiaries...
                  </td>
                </tr>
              ) : filteredBeneficiaries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="beneficiary-empty">
                    No beneficiaries found. Click Add Beneficiary to get started.
                  </td>
                </tr>
              ) : (
                filteredBeneficiaries.map((item) => (
                  <tr key={item.beneficiary_id}>
                    <td>{item.full_name}</td>
                    <td>{item.mobile_no || "—"}</td>
                    <td>{item.address || "—"}</td>
                    <td>{item.family_size}</td>
                    <td>{item.status ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="beneficiary-actions">
                        <button
                          className="beneficiary-edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="beneficiary-delete-btn"
                          onClick={() =>
                            handleDelete(item.beneficiary_id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Beneficiaries;