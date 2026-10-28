
import { useState } from "react";
import { Link } from "react-router-dom";
import "./RationCards.css";

function RationCards() {
  const [cards, setCards] = useState([]);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState("PHH");
  const [issueDate, setIssueDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setBeneficiaryName("");
    setCardNumber("");
    setCardType("PHH");
    setIssueDate("");
    setStatus("Active");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cardData = {
      beneficiaryName: beneficiaryName.trim(),
      cardNumber: cardNumber.trim(),
      cardType,
      issueDate,
      status,
    };

    const duplicate = cards.some(
      (card) =>
        card.cardNumber.toLowerCase() ===
          cardData.cardNumber.toLowerCase() &&
        card.id !== editingId
    );

    if (duplicate) {
      alert("This ration card number already exists.");
      return;
    }

    if (editingId !== null) {
      setCards((previous) =>
        previous.map((card) =>
          card.id === editingId
            ? { ...cardData, id: editingId }
            : card
        )
      );
    } else {
      setCards((previous) => [
        ...previous,
        { ...cardData, id: Date.now() },
      ]);
    }

    resetForm();
  };

  const handleEdit = (card) => {
    setBeneficiaryName(card.beneficiaryName);
    setCardNumber(card.cardNumber);
    setCardType(card.cardType);
    setIssueDate(card.issueDate);
    setStatus(card.status);
    setEditingId(card.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      setCards((previous) =>
        previous.filter((card) => card.id !== id)
      );
    }
  };

  const filteredCards = cards.filter((card) =>
    `${card.beneficiaryName} ${card.cardNumber} ${card.cardType}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="ration-page">
      <header className="ration-header">
        <div>
          <Link to="/dashboard" className="ration-back">
            ← Back to Dashboard
          </Link>
          <h1>Ration Card Management</h1>
          <p>Register and manage ration card information.</p>
        </div>

        <button
          className="ration-primary-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Ration Card
        </button>
      </header>

      <section className="ration-summary">
        <div className="ration-summary-icon">▤</div>
        <div>
          <p>Total Ration Cards</p>
          <h2>{cards.length}</h2>
        </div>
      </section>

      {showForm && (
        <section className="ration-panel">
          <h2>
            {editingId !== null ? "Edit Ration Card" : "New Ration Card"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="ration-form-grid">
              <label>
                Beneficiary Name *
                <input
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Enter beneficiary name"
                  required
                />
              </label>

              <label>
                Ration Card Number *
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Enter unique card number"
                  maxLength={30}
                  required
                />
              </label>

              <label>
                Card Type *
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  required
                >
                  <option value="PHH">PHH</option>
                  <option value="AAY">AAY</option>
                  <option value="APL">APL</option>
                  <option value="BPL">BPL</option>
                </select>
              </label>

              <label>
                Issue Date
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </label>

              <label>
                Card Status *
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>
            </div>

            <div className="ration-form-actions">
              <button type="submit" className="ration-primary-btn">
                {editingId !== null ? "Update Card" : "Save Card"}
              </button>

              <button
                type="button"
                className="ration-secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="ration-panel">
        <div className="ration-list-heading">
          <div>
            <h2>Ration Card List</h2>
            <p>Search and manage registered cards.</p>
          </div>

          <input
            className="ration-search"
            type="search"
            placeholder="Search name or card number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ration-table-wrap">
          <table className="ration-table">
            <thead>
              <tr>
                <th>Beneficiary</th>
                <th>Card Number</th>
                <th>Card Type</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="ration-empty">
                    No ration cards found. Click "Add Ration Card"
                    to register a card.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr key={card.id}>
                    <td>{card.beneficiaryName}</td>
                    <td>{card.cardNumber}</td>
                    <td>
                      <span className="ration-type">
                        {card.cardType}
                      </span>
                    </td>
                    <td>{card.issueDate || "—"}</td>
                    <td>
                      <span
                        className={`ration-status ${card.status.toLowerCase()}`}
                      >
                        {card.status}
                      </span>
                    </td>
                    <td>
                      <div className="ration-actions">
                        <button
                          className="ration-edit-btn"
                          onClick={() => handleEdit(card)}
                        >
                          Edit
                        </button>
                        <button
                          className="ration-delete-btn"
                          onClick={() => handleDelete(card.id)}
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
    </main>
  );
}

export default RationCards;