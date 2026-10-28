// src/pages/Stock.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Stock.css";

const API_BASE = "http://127.0.0.1:8000/api";

const emptyItem = {
  item_name: "",
  unit: "kg",
  description: "",
};

const emptyTransaction = {
  item: "",
  quantity: "",
  transaction_type: "IN",
  remarks: "",
};

function getCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCookie("csrftoken");
    if (csrf) headers["X-CSRFToken"] = csrf;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message =
        typeof data === "string"
          ? data
          : Object.entries(data)
              .map(([key, value]) => {
                const detail = Array.isArray(value)
                  ? value.join(", ")
                  : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value);
                return `${key}: ${detail}`;
              })
              .join("\n") || message;
    } catch {
      // Keep the HTTP error message if the response isn't JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatQuantity(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function Stock() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [transactionForm, setTransactionForm] = useState(emptyTransaction);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showItemForm, setShowItemForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [itemsData, stockData] = await Promise.all([
        apiRequest("/items/"),
        apiRequest("/stock/"),
      ]);

      setItems(getList(itemsData));
      setTransactions(getList(stockData));
    } catch (err) {
      setError(
        `${err.message}. Django server, API URLs आणि login/authentication तपासा.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate each item's balance from IN and OUT transactions.
  const balances = useMemo(() => {
    const result = {};

    items.forEach((item) => {
      result[item.item_id] = 0;
    });

    transactions.forEach((transaction) => {
      const itemId =
        typeof transaction.item === "object"
          ? transaction.item?.item_id ?? transaction.item?.id
          : transaction.item;

      if (itemId == null) return;

      const quantity = Number(transaction.quantity || 0);
      const current = result[itemId] || 0;

      result[itemId] =
        current +
        (transaction.transaction_type === "IN" ? quantity : -quantity);
    });

    return result;
  }, [items, transactions]);

  const totalItems = items.length;
  const totalStockUnits = Object.values(balances).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const stockInCount = transactions.filter(
    (transaction) => transaction.transaction_type === "IN",
  ).length;
  const stockOutCount = transactions.filter(
    (transaction) => transaction.transaction_type === "OUT",
  ).length;

  const filteredItems = items.filter((item) =>
    `${item.item_name} ${item.unit}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const filteredTransactions = transactions.filter((transaction) => {
    const itemId =
      typeof transaction.item === "object"
        ? transaction.item?.item_id ?? transaction.item?.id
        : transaction.item;

    const item = items.find((entry) => String(entry.item_id) === String(itemId));
    const itemName = item?.item_name || transaction.item_name || "";

    const matchesSearch =
      `${itemName} ${transaction.remarks || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "ALL" || transaction.transaction_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleItemSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/items/", {
        method: "POST",
        body: JSON.stringify({
          item_name: itemForm.item_name.trim(),
          unit: itemForm.unit.trim(),
          description: itemForm.description.trim(),
          status: true,
        }),
      });

      setItemForm(emptyItem);
      setShowItemForm(false);
      setSuccess("Item successfully added.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const itemId = Number(transactionForm.item);
    const quantity = Number(transactionForm.quantity);
    const currentBalance = balances[itemId] || 0;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity zero पेक्षा जास्त असणे आवश्यक आहे.");
      setSaving(false);
      return;
    }

    if (
      transactionForm.transaction_type === "OUT" &&
      quantity > currentBalance
    ) {
      setError(`पुरेसा stock उपलब्ध नाही. Available: ${currentBalance}`);
      setSaving(false);
      return;
    }

    try {
      await apiRequest("/stock/", {
        method: "POST",
        body: JSON.stringify({
          item: itemId,
          quantity: quantity.toFixed(2),
          transaction_type: transactionForm.transaction_type,
          remarks: transactionForm.remarks.trim(),
        }),
      });

      setTransactionForm(emptyTransaction);
      setShowTransactionForm(false);
      setSuccess(
        transactionForm.transaction_type === "IN"
          ? "Stock In transaction successfully saved."
          : "Stock Out transaction successfully saved.",
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="stock-page">
      <header className="stock-header">
        <div>
          <Link to="/dashboard" className="stock-back">
            ← Back to Dashboard
          </Link>
          <h1>Stock Management</h1>
          <p>Monitor essential commodities and inventory transactions.</p>
        </div>

        <div className="stock-header-actions">
          <button
            className="stock-secondary-btn"
            onClick={loadData}
            disabled={loading}
          >
            ↻ Refresh
          </button>
          <button
            className="stock-primary-btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowItemForm((previous) => !previous);
              setShowTransactionForm(false);
            }}
          >
            + Add Item
          </button>
          <button
            className="stock-primary-btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowTransactionForm((previous) => !previous);
              setShowItemForm(false);
            }}
          >
            + Stock Entry
          </button>
        </div>
      </header>

      {error && (
        <div className="stock-alert stock-alert-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="stock-alert stock-alert-success" role="status">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <section className="stock-summary-grid" aria-label="Stock summary">
        <article className="stock-summary-card">
          <span className="stock-summary-icon stock-green">▦</span>
          <div>
            <p>Total Items</p>
            <h2>{totalItems}</h2>
            <span>Registered commodities</span>
          </div>
        </article>

        <article className="stock-summary-card">
          <span className="stock-summary-icon stock-blue">⇧</span>
          <div>
            <p>Stock In Records</p>
            <h2>{stockInCount}</h2>
            <span>Incoming transactions</span>
          </div>
        </article>

        <article className="stock-summary-card">
          <span className="stock-summary-icon stock-orange">⇩</span>
          <div>
            <p>Stock Out Records</p>
            <h2>{stockOutCount}</h2>
            <span>Outgoing transactions</span>
          </div>
        </article>

        <article className="stock-summary-card">
          <span className="stock-summary-icon stock-purple">▤</span>
          <div>
            <p>Total Balance</p>
            <h2>{formatQuantity(totalStockUnits)}</h2>
            <span>Combined units; see item-wise units below</span>
          </div>
        </article>
      </section>

      {showItemForm && (
        <section className="stock-panel">
          <h2>Add New Item</h2>
          <p className="stock-panel-description">
            Register a commodity before entering its stock.
          </p>

          <form onSubmit={handleItemSubmit}>
            <div className="stock-form-grid">
              <label>
                Item Name *
                <input
                  value={itemForm.item_name}
                  onChange={(event) =>
                    setItemForm({
                      ...itemForm,
                      item_name: event.target.value,
                    })
                  }
                  placeholder="e.g. Rice"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Unit *
                <select
                  value={itemForm.unit}
                  onChange={(event) =>
                    setItemForm({ ...itemForm, unit: event.target.value })
                  }
                  required
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="litre">Litre</option>
                  <option value="packet">Packet</option>
                  <option value="bag">Bag</option>
                  <option value="piece">Piece</option>
                  <option value="quintal">Quintal</option>
                </select>
              </label>

              <label className="stock-full-width">
                Description
                <textarea
                  value={itemForm.description}
                  onChange={(event) =>
                    setItemForm({
                      ...itemForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Optional item details"
                  rows={3}
                />
              </label>
            </div>

            <div className="stock-form-actions">
              <button
                className="stock-primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Item"}
              </button>
              <button
                className="stock-secondary-btn"
                type="button"
                onClick={() => setShowItemForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showTransactionForm && (
        <section className="stock-panel">
          <h2>Stock Entry</h2>
          <p className="stock-panel-description">
            Record incoming stock or issue stock out of inventory.
          </p>

          {items.length === 0 ? (
            <p className="stock-empty-inline">
              No items registered. Add an item before creating a stock entry.
            </p>
          ) : (
            <form onSubmit={handleTransactionSubmit}>
              <div className="stock-form-grid">
                <label>
                  Transaction Type *
                  <select
                    value={transactionForm.transaction_type}
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        transaction_type: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                  </select>
                </label>

                <label>
                  Select Item *
                  <select
                    value={transactionForm.item}
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        item: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Choose an item</option>
                    {items.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.item_name} ({item.unit}) — Available:{" "}
                        {formatQuantity(balances[item.item_id])}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantity *
                  <input
                    type="number"
                    value={transactionForm.quantity}
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        quantity: event.target.value,
                      })
                    }
                    min="0.01"
                    step="0.01"
                    placeholder="Enter quantity"
                    required
                  />
                </label>

                <label>
                  Remarks
                  <input
                    value={transactionForm.remarks}
                    onChange={(event) =>
                      setTransactionForm({
                        ...transactionForm,
                        remarks: event.target.value,
                      })
                    }
                    placeholder="Optional remarks"
                  />
                </label>
              </div>

              <div className="stock-form-actions">
                <button
                  className="stock-primary-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : transactionForm.transaction_type === "IN"
                      ? "Save Stock In"
                      : "Save Stock Out"}
                </button>
                <button
                  className="stock-secondary-btn"
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="stock-panel">
        <div className="stock-section-heading">
          <div>
            <h2>Current Inventory</h2>
            <p>Item-wise available balance.</p>
          </div>
          <input
            className="stock-search"
            type="search"
            placeholder="Search items..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="stock-table-wrap">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Available Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="stock-empty">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="stock-empty">
                    No items found. Use Add Item to register a commodity.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const balance = balances[item.item_id] || 0;

                  return (
                    <tr key={item.item_id}>
                      <td>#{item.item_id}</td>
                      <td className="stock-item-name">{item.item_name}</td>
                      <td>{item.unit}</td>
                      <td>
                        <strong>{formatQuantity(balance)}</strong>
                      </td>
                      <td>
                        <span
                          className={`stock-status ${
                            balance > 0 ? "stock-status-available" : "stock-status-empty"
                          }`}
                        >
                          {balance > 0 ? "Available" : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="stock-panel">
        <div className="stock-section-heading">
          <div>
            <h2>Transaction History</h2>
            <p>Review stock-in and stock-out records.</p>
          </div>
          <select
            className="stock-filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter transactions"
          >
            <option value="ALL">All Transactions</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>

        <div className="stock-table-wrap">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Item</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="stock-empty">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="stock-empty">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => {
                  const itemId =
                    typeof transaction.item === "object"
                      ? transaction.item?.item_id ?? transaction.item?.id
                      : transaction.item;

                  const item = items.find(
                    (entry) => String(entry.item_id) === String(itemId),
                  );

                  return (
                    <tr key={transaction.stock_id}>
                      <td>#{transaction.stock_id}</td>
                      <td>{item?.item_name || transaction.item_name || `Item ${itemId}`}</td>
                      <td>
                        <span
                          className={`stock-status ${
                            transaction.transaction_type === "IN"
                              ? "stock-status-available"
                              : "stock-status-out"
                          }`}
                        >
                          {transaction.transaction_type === "IN"
                            ? "Stock In"
                            : "Stock Out"}
                        </span>
                      </td>
                      <td>{formatQuantity(transaction.quantity)}</td>
                      <td>
                        {transaction.transaction_date
                          ? new Date(transaction.transaction_date).toLocaleString()
                          : "—"}
                      </td>
                      <td>{transaction.remarks || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Stock;