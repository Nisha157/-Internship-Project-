
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Reports.css";

function readRecords(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function Reports() {
  const [reportType, setReportType] = useState("distribution");
  const [search, setSearch] = useState("");

  const beneficiaries = useMemo(
    () => readRecords("annasetu_beneficiaries"),
    []
  );
  const rationCards = useMemo(
    () => readRecords("annasetu_ration_cards"),
    []
  );
  const stock = useMemo(
    () => readRecords("annasetu_stock"),
    []
  );
  const distributions = useMemo(
    () => readRecords("annasetu_distributions"),
    []
  );
  const allocations = useMemo(
    () => readRecords("annasetu_allocations"),
    []
  );

  const reportData = useMemo(() => {
    const datasets = {
      beneficiaries: {
        title: "Beneficiary Report",
        rows: beneficiaries,
        columns: [
          ["full_name", "Beneficiary Name"],
          ["mobile_no", "Mobile Number"],
          ["address", "Address"],
          ["family_members", "Family Members"],
        ],
      },
      rationCards: {
        title: "Ration Card Report",
        rows: rationCards,
        columns: [
          ["card_number", "Card Number"],
          ["beneficiary", "Beneficiary"],
          ["card_type", "Card Type"],
          ["status", "Status"],
        ],
      },
      stock: {
        title: "Stock Report",
        rows: stock,
        columns: [
          ["item_name", "Item"],
          ["quantity", "Quantity"],
          ["unit", "Unit"],
          ["category", "Category"],
        ],
      },
      allocation: {
        title: "Allocation Report",
        rows: allocations,
        columns: [
          ["beneficiary", "Beneficiary"],
          ["card_number", "Card Number"],
          ["item", "Item"],
          ["quantity", "Allocated Quantity"],
        ],
      },
      distribution: {
        title: "Distribution Report",
        rows: distributions,
        columns: [
          ["receipt_number", "Receipt Number"],
          ["beneficiary", "Beneficiary"],
          ["card_number", "Card Number"],
          ["item", "Item"],
          ["quantity_distributed", "Quantity (kg)"],
          ["distribution_date", "Date"],
        ],
      },
    };

    return datasets[reportType];
  }, [
    reportType,
    beneficiaries,
    rationCards,
    stock,
    allocations,
    distributions,
  ]);

  const filteredRows = reportData.rows.filter((row) =>
    reportData.columns
      .map(([key]) => String(row[key] ?? ""))
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const exportCSV = () => {
    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const lines = [
      reportData.columns.map(([, label]) => escapeCSV(label)).join(","),
      ...filteredRows.map((row) =>
        reportData.columns
          .map(([key]) => escapeCSV(row[key]))
          .join(",")
      ),
    ];

    const blob = new Blob(
      ["\uFEFF" + lines.join("\r\n")],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <Link to="/dashboard" className="reports-back">
            ← Back to Dashboard
          </Link>
          <h1>Reports</h1>
          <p>Review and export AnnaSetu management records.</p>
        </div>
        <button className="reports-primary" onClick={exportCSV}>
          Export CSV ↓
        </button>
      </header>

      <section className="reports-summary">
        <article>
          <span>Beneficiaries</span>
          <strong>{beneficiaries.length}</strong>
        </article>
        <article>
          <span>Ration Cards</span>
          <strong>{rationCards.length}</strong>
        </article>
        <article>
          <span>Stock Records</span>
          <strong>{stock.length}</strong>
        </article>
        <article>
          <span>Distributions</span>
          <strong>{distributions.length}</strong>
        </article>
      </section>

      <section className="reports-card">
        <div className="reports-toolbar">
          <div>
            <h2>Management Report</h2>
            <p>Select a module to view its records.</p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search report..."
            aria-label="Search report"
          />
        </div>

        <div className="reports-tabs">
          <button
            className={reportType === "distribution" ? "selected" : ""}
            onClick={() => setReportType("distribution")}
          >
            Distribution
          </button>
          <button
            className={reportType === "beneficiaries" ? "selected" : ""}
            onClick={() => setReportType("beneficiaries")}
          >
            Beneficiaries
          </button>
          <button
            className={reportType === "rationCards" ? "selected" : ""}
            onClick={() => setReportType("rationCards")}
          >
            Ration Cards
          </button>
          <button
            className={reportType === "stock" ? "selected" : ""}
            onClick={() => setReportType("stock")}
          >
            Stock
          </button>
          <button
            className={reportType === "allocation" ? "selected" : ""}
            onClick={() => setReportType("allocation")}
          >
            Allocation
          </button>
        </div>

        <div className="reports-table-heading">
          <div>
            <h3>{reportData.title}</h3>
            <span>{filteredRows.length} records</span>
          </div>
          <button
            className="reports-secondary"
            onClick={() => window.print()}
          >
            Print Report
          </button>
        </div>

        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                {reportData.columns.map(([, label]) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={reportData.columns.length}
                    className="reports-empty"
                  >
                    No records found for this report.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={row.id ?? row.receipt_number ?? index}>
                    {reportData.columns.map(([key]) => (
                      <td key={key}>
                        {key.endsWith("_date") && row[key]
                          ? new Date(row[key]).toLocaleDateString()
                          : row[key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="reports-footer">
        AnnaSetu · Ration Shop Management System
      </footer>
    </main>
  );
}

export default Reports;