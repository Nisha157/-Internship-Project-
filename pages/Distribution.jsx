
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Distribution.css";

const STORAGE_KEY = "annasetu_distributions";
const ALLOCATION_KEY = "annasetu_allocations";

function readRecords(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function Distribution() {
  const [records, setRecords] = useState(() =>
    readRecords(STORAGE_KEY)
  );
  const [allocations] = useState(() =>
    readRecords(ALLOCATION_KEY)
  );
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    beneficiary: "",
    card_number: "",
    item: "Rice",
    allocated_quantity: "",
    quantity_distributed: "",
    remarks: "",
  });

  const saveRecords = (updated) => {
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((record) =>
      `${record.receipt_number} ${record.beneficiary} ${record.card_number} ${record.item}`
        .toLowerCase()
        .includes(q)
    );
  }, [records, search]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    const quantity = Number(form.quantity_distributed);
    const allocated = Number(form.allocated_quantity);

    if (
      !form.beneficiary.trim() ||
      !form.card_number.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setMessage("Enter valid beneficiary, card and distribution quantity.");
      return;
    }

    if (!Number.isFinite(allocated) || allocated <= 0) {
      setMessage("Enter a valid allocated quantity.");
      return;
    }

    if (quantity > allocated) {
      setMessage("Distributed quantity cannot exceed the entered allocation.");
      return;
    }

    const record = {
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      receipt_number: `AS-${Date.now()}`,
      ...form,
      beneficiary: form.beneficiary.trim(),
      card_number: form.card_number.trim(),
      quantity_distributed: quantity,
      allocated_quantity: allocated,
      distribution_date: new Date().toISOString(),
    };

    saveRecords([record, ...records]);
    setForm({
      beneficiary: "",
      card_number: "",
      item: "Rice",
      allocated_quantity: "",
      quantity_distributed: "",
      remarks: "",
    });
    setShowForm(false);
    setMessage("Distribution record saved in this browser.");
  };

  const printReceipt = (record) => {
    const receiptWindow = window.open("", "_blank", "width=700,height=700");

    if (!receiptWindow) {
      setMessage("Allow pop-ups in your browser to print a receipt.");
      return;
    }

    receiptWindow.document.write(`
      <!doctype html>
      <html>
      <head>
        <title>AnnaSetu Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #24382d; }
          h1 { color: #24583e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td { border: 1px solid #dce4da; padding: 12px; }
          .footer { margin-top: 30px; font-size: 12px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>AnnaSetu</h1>
        <h2>Ration Distribution Receipt</h2>
        <p><strong>Receipt:</strong> ${record.receipt_number}</p>
        <p><strong>Beneficiary:</strong> ${record.beneficiary}</p>
        <p><strong>Ration Card:</strong> ${record.card_number}</p>
        <table>
          <tr><td>Item</td><td>${record.item}</td></tr>
          <tr><td>Allocated quantity (kg)</td><td>${record.allocated_quantity}</td></tr>
          <tr><td>Distributed quantity (kg)</td><td>${record.quantity_distributed}</td></tr>
          <tr><td>Date</td><td>${new Date(record.distribution_date).toLocaleString()}</td></tr>
        </table>
        <p class="footer">Ration Shop Management System — AnnaSetu</p>
        <button onclick="window.print()">Print Receipt</button>
      </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const allocationOptions = allocations.filter(
    (allocation) =>
      allocation.item === form.item &&
      allocation.beneficiary.trim().toLowerCase() ===
        form.beneficiary.trim().toLowerCase() &&
      allocation.card_number.trim() === form.card_number.trim()
  );

  return (
    <main className="distribution-page">
      <header className="distribution-header">
        <div>
          <Link to="/dashboard" className="distribution-back">
            ← Back to Dashboard
          </Link>
          <h1>Distribution Management</h1>
          <p>Record ration distribution and generate receipts.</p>
        </div>
        <button
          className="distribution-primary"
          onClick={() => {
            setMessage("");
            setShowForm(!showForm);
          }}
        >
          + Record Distribution
        </button>
      </header>

      {message && (
        <div className="distribution-message" role="status">
          {message}
        </div>
      )}

      <section className="distribution-stats">
        <article>
          <span>Total Distributions</span>
          <strong>{records.length}</strong>
          <small>Recorded transactions</small>
        </article>
        <article>
          <span>Quantity Distributed</span>
          <strong>
            {records.reduce(
              (sum, item) => sum + Number(item.quantity_distributed || 0),
              0
            ).toLocaleString("en-IN", { maximumFractionDigits: 3 })}
          </strong>
          <small>Quantity in kg</small>
        </article>
        <article>
          <span>Receipts Generated</span>
          <strong>{records.filter((item) => item.receipt_number).length}</strong>
          <small>Receipt references</small>
        </article>
      </section>

      {showForm && (
        <section className="distribution-card">
          <h2>Record New Distribution</h2>
          <p className="distribution-muted">
            Enter the beneficiary details and quantity actually distributed.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="distribution-form-grid">
              <label>
                Beneficiary Name *
                <input
                  name="beneficiary"
                  value={form.beneficiary}
                  onChange={handleChange}
                  placeholder="Enter beneficiary name"
                  required
                />
              </label>

              <label>
                Ration Card Number *
                <input
                  name="card_number"
                  value={form.card_number}
                  onChange={handleChange}
                  placeholder="Enter ration card number"
                  required
                />
              </label>

              <label>
                Item *
                <select
                  name="item"
                  value={form.item}
                  onChange={handleChange}
                >
                  <option>Rice</option>
                  <option>Wheat</option>
                  <option>Sugar</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Allocated Quantity (kg) *
                <input
                  name="allocated_quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={form.allocated_quantity}
                  onChange={handleChange}
                  placeholder="Enter approved quantity"
                  required
                />
              </label>

              <label>
                Distributed Quantity (kg) *
                <input
                  name="quantity_distributed"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={form.quantity_distributed}
                  onChange={handleChange}
                  placeholder="Enter quantity distributed"
                  required
                />
              </label>

              <label>
                Remarks
                <input
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Optional remarks"
                />
              </label>
            </div>

            {allocationOptions.length > 0 && (
              <p className="distribution-muted">
                Matching saved allocation found:{" "}
                {allocationOptions.map((item) => item.quantity).join(", ")} kg.
                Verify the approved quantity before saving.
              </p>
            )}

            <div className="distribution-actions">
              <button className="distribution-primary" type="submit">
                Save Distribution
              </button>
              <button
                className="distribution-secondary"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="distribution-card">
        <div className="distribution-list-heading">
          <div>
            <h2>Distribution Records</h2>
            <p className="distribution-muted">
              Total records: {filteredRecords.length}
            </p>
          </div>
          <input
            className="distribution-search"
            type="search"
            placeholder="Search receipt, beneficiary or card..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="distribution-table-wrap">
          <table className="distribution-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Beneficiary</th>
                <th>Card Number</th>
                <th>Item</th>
                <th>Quantity (kg)</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="distribution-empty">
                    No distribution records found. Click Record Distribution to begin.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.receipt_number}</td>
                    <td>{record.beneficiary}</td>
                    <td>{record.card_number}</td>
                    <td>{record.item}</td>
                    <td>{record.quantity_distributed}</td>
                    <td>
                      {new Date(record.distribution_date).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="distribution-receipt"
                        onClick={() => printReceipt(record)}
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Distribution;