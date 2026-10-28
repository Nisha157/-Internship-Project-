
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Allocation.css";

const API = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = Object.entries(data)
      .map(([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
      )
      .join("\n");

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

function getList(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

function Allocation() {
  const [allocations, setAllocations] = useState([]);
  const [cards, setCards] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    ration_card: "",
    item: "",
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    allocated_quantity: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [allocationData, cardData, itemData] = await Promise.all([
        request("/allocations/"),
        request("/ration-cards/"),
        request("/items/"),
      ]);

      setAllocations(getList(allocationData));
      setCards(getList(cardData));
      setItems(getList(itemData));
    } catch (err) {
      setError(err.message || "Unable to load allocation data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allocations.filter((record) => {
      const card = cards.find(
        (entry) =>
          String(entry.ration_card_id) === String(record.ration_card)
      );
      const item = items.find(
        (entry) => String(entry.item_id) === String(record.item)
      );

      const cardNumber =
        card?.card_number ||
        (typeof record.ration_card === "object"
          ? record.ration_card?.card_number
          : "");

      const itemName =
        item?.item_name ||
        (typeof record.item === "object" ? record.item?.item_name : "");

      const beneficiaryName =
        card?.beneficiary_name ||
        (typeof card?.beneficiary === "object"
          ? card.beneficiary?.full_name
          : "");

      return `${cardNumber} ${itemName} ${beneficiaryName} ${record.month} ${record.year}`
        .toLowerCase()
        .includes(query);
    });
  }, [allocations, cards, items, search]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const quantity = Number(form.allocated_quantity);

    if (!form.ration_card || !form.item) {
      setError("Please select a ration card and item.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      await request("/allocations/", {
        method: "POST",
        body: JSON.stringify({
          ration_card: Number(form.ration_card),
          item: Number(form.item),
          month: Number(form.month),
          year: Number(form.year),
          allocated_quantity: quantity.toFixed(2),
        }),
      });

      setMessage("Allocation saved successfully in the database.");
      setForm((previous) => ({
        ...previous,
        allocated_quantity: "",
      }));
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save allocation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this allocation record?")) return;

    setError("");
    setMessage("");

    try {
      await request(`/allocations/${id}/`, { method: "DELETE" });
      setMessage("Allocation deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete allocation.");
    }
  };

  const monthName = (month) =>
    new Date(2000, Number(month) - 1, 1).toLocaleString("en-IN", {
      month: "long",
    });

  return (
    <main className="allocation-page">
      <header className="allocation-header">
        <div>
          <Link to="/dashboard" className="allocation-back">
            ← Back to Dashboard
          </Link>
          <h1>Monthly Allocation</h1>
          <p>Manage monthly ration quantities for ration cards.</p>
        </div>

        <button
          type="button"
          className="allocation-primary"
          onClick={() => {
            setError("");
            setMessage("");
            setShowForm((previous) => !previous);
          }}
        >
          {showForm ? "Close Form" : "+ New Allocation"}
        </button>
      </header>

      {error && (
        <div role="alert" className="allocation-message allocation-error">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="allocation-message allocation-success">
          {message}
        </div>
      )}

      {showForm && (
        <section className="allocation-card">
          <h2>Create Monthly Allocation</h2>

          <form onSubmit={handleSubmit}>
            <div className="allocation-form-grid">
              <label>
                Ration Card *
                <select
                  name="ration_card"
                  value={form.ration_card}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select ration card</option>
                  {cards.map((card) => (
                    <option
                      key={card.ration_card_id}
                      value={card.ration_card_id}
                    >
                      {card.card_number} —{" "}
                      {typeof card.beneficiary === "object"
                        ? card.beneficiary?.full_name
                        : card.beneficiary_name || `Card ${card.ration_card_id}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Item *
                <select
                  name="item"
                  value={form.item}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.item_id} value={item.item_id}>
                      {item.item_name} ({item.unit})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Month *
                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {monthName(index + 1)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Year *
                <input
                  name="year"
                  type="number"
                  min="2000"
                  max="9999"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Allocated Quantity *
                <input
                  name="allocated_quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.allocated_quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </label>
            </div>

            <div className="allocation-actions">
              <button
                className="allocation-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Allocation"}
              </button>

              <button
                className="allocation-secondary"
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="allocation-card">
        <div className="allocation-list-heading">
          <div>
            <h2>Allocation Records</h2>
            <p className="allocation-muted">
              Total records: {filtered.length}
            </p>
          </div>

          <input
            className="allocation-search"
            type="search"
            placeholder="Search card, item, month or year..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading allocations...</p>
        ) : (
          <div className="allocation-table-wrap">
            <table className="allocation-table">
              <thead>
                <tr>
                  <th>Ration Card</th>
                  <th>Item</th>
                  <th>Month</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="allocation-empty">
                      No allocation records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => {
                    const card = cards.find(
                      (entry) =>
                        String(entry.ration_card_id) ===
                        String(
                          typeof record.ration_card === "object"
                            ? record.ration_card?.ration_card_id
                            : record.ration_card
                        )
                    );

                    const item = items.find(
                      (entry) =>
                        String(entry.item_id) ===
                        String(
                          typeof record.item === "object"
                            ? record.item?.item_id
                            : record.item
                        )
                    );

                    return (
                      <tr key={record.allocation_id}>
                        <td>
                          {card?.card_number ||
                            (typeof record.ration_card === "object"
                              ? record.ration_card?.card_number
                              : record.ration_card)}
                        </td>
                        <td>
                          {item?.item_name ||
                            (typeof record.item === "object"
                              ? record.item?.item_name
                              : record.item)}
                        </td>
                        <td>
                          {monthName(record.month)} {record.year}
                        </td>
                        <td>{record.allocated_quantity}</td>
                        <td>
                          <button
                            type="button"
                            className="allocation-delete"
                            onClick={() =>
                              handleDelete(record.allocation_id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Allocation;