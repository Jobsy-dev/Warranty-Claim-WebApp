import { useEffect, useState } from "react";

export default function Dashboard({ session }) {
  const [stats, setStats]     = useState(null);
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:8000/claims/dashboard", {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then(data => {
        setStats(data.stats);
        setClaims(data.recent_claims || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter claims based on active tab
  const filteredClaims = activeFilter === "all"
    ? claims
    : claims.filter(c => c.Claim_status?.toLowerCase() === activeFilter);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center",
      justifyContent: "center", minHeight: "60vh",
      fontSize: 16, color: "#6B7280" }}>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ padding: "20px", borderRadius: 10,
      background: "#FEF2F2", border: "1px solid #FECACA",
      color: "#DC2626", fontSize: 14 }}>
      ⚠ {error}
    </div>
  );

  const filterTabs = [
    { key: "all",      label: "All Claims", count: stats?.total    ?? 0, color: "#19a5e1", bg: "#E8F7FC" },
    { key: "approved", label: "Approved",   count: stats?.approved ?? 0, color: "#065F46", bg: "#ECFDF5" },
    { key: "rejected", label: "Rejected",   count: stats?.rejected ?? 0, color: "#991B1B", bg: "#FEF2F2" },
    { key: "pending",  label: "Pending",    count: stats?.pending  ?? 0, color: "#92400E", bg: "#FFFBEB" },
  ];

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>

      {/* ── Stat Cards — clickable to filter table ── */}
      <div style={styles.statsGrid}>
        {filterTabs.map(tab => (
          <StatCard
            key={tab.key}
            label={tab.label}
            value={tab.count}
            color={tab.color}
            bg={tab.bg}
            active={activeFilter === tab.key}
            onClick={() => setActiveFilter(tab.key)}
          />
        ))}
      </div>

      {/* ── Recent Claims Table ── */}
      <div style={styles.tableCard}>

        {/* Header with filter pill tabs */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "16px 24px",
          borderBottom: "1px solid #F3F4F6", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
            Recent Claims
          </h2>

          {/* Filter pill buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {filterTabs.map(tab => {
              const isActive = activeFilter === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveFilter(tab.key)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  border: isActive ? `2px solid ${tab.color}` : "2px solid #E5E7EB",
                  background: isActive ? tab.bg : "#FFFFFF",
                  color: isActive ? tab.color : "#6B7280",
                }}>
                  {tab.label}
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 700,
                    background: isActive ? tab.color : "#F3F4F6",
                    color: isActive ? "#fff" : "#6B7280",
                    padding: "1px 7px", borderRadius: 99,
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <table style={styles.table}>
          <thead>
            <tr>
              {["Claim ID",  "Article No", "Technician", "Date", "Status"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px",
                  color: "#9CA3AF", fontSize: 13 }}>
                  {activeFilter === "all"
                    ? "No claims yet."
                    : `No ${activeFilter} claims found.`}
                </td>
              </tr>
            ) : filteredClaims.map(c => (
              <tr key={c.claimid}
                onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ ...styles.td, color: "#19a5e1", fontFamily: "monospace", fontWeight: 700 }}>
                  #{c.claimid}
                </td>
                
                <td style={{ ...styles.td, color: "#6B7280", fontFamily: "monospace" }}>{c.Artnr || "—"}</td>
                <td style={{ ...styles.td, color: "#374151" }}>{c.technician_name || "—"}</td>
                <td style={{ ...styles.td, color: "#6B7280" }}>{c.Created_at || "—"}</td>
                <td style={styles.td}><StatusBadge status={c.Claim_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid #F3F4F6",
          fontSize: 12, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 8 }}>
          Showing {filteredClaims.length} of {claims.length} claims
          {activeFilter !== "all" && (
            <button onClick={() => setActiveFilter("all")} style={{
              fontSize: 11, color: "#19a5e1", fontWeight: 600,
              background: "none", border: "none", cursor: "pointer",
              textDecoration: "underline", padding: 0,
            }}>
              Clear filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: 22, borderRadius: 12,
      backgroundColor: bg,
      borderTop: `4px solid ${color}`,
      cursor: "pointer",
      boxShadow: active
        ? `0 0 0 3px ${color}33, 0 2px 8px rgba(0,0,0,0.1)`
        : "0 1px 4px rgba(0,0,0,0.06)",
      transform: active ? "translateY(-2px)" : "none",
      transition: "all 0.18s",
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color }}>
        {value ?? 0}
      </div>
      {active && (
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color, opacity: 0.8 }}>
          ▼ Filtered
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    approved: { bg: "#ECFDF5", color: "#065F46" },
    rejected: { bg: "#FEF2F2", color: "#991B1B" },
    pending:  { bg: "#FFFBEB", color: "#92400E" },
  };
  const c = colors[status?.toLowerCase()] || colors.pending;
  return (
    <span style={{ backgroundColor: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
      {status || "pending"}
    </span>
  );
}

const styles = {
  pageTitle: { fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 28, letterSpacing: "-0.5px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 },
  tableCard: { backgroundColor: "#FFFFFF", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.6px", padding: "12px 20px", borderBottom: "1px solid #F3F4F6" },
  td:        { padding: "14px 20px", fontSize: 13, color: "#111827", borderBottom: "1px solid #F9FAFB" },
};