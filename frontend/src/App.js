import { useState } from "react";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import NewClaim  from "./NewClaim";

function Logo({ color = "blue", height = 32 }) {
  const fill = color === "white" ? "#FFFFFF" : "#19a5e1";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 75"
      height={height}
      style={{ display: "block", width: "auto" }}
      fill={fill}
    >
      <rect x="10" y="20" width="35" height="35" rx="6" />
      <text x="55" y="48" fontFamily="Segoe UI, Arial, sans-serif" fontSize="34" fontWeight="700" fill={fill}>
        Warranty
      </text>
    </svg>
  );
}

export { Logo };



export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("session")); }
    catch { return null; }
  });
  const [page, setPage] = useState("dashboard");

  function handleLogout() {
    sessionStorage.removeItem("session");
    setSession(null);
    setPage("dashboard");
  }

  if (!session) return <LoginPage onLogin={setSession} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif", backgroundColor: "#F0F4FF" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div style={{
        width: 240,
        backgroundColor: "#FFFFFF",
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh",        // full screen height
        overflow: "hidden",     // never scroll the whole sidebar
      }}>

        {/* TOP — logo + nav (shrinks if needed but won't push bottom away) */}
        <div style={{ flexShrink: 0, paddingTop: 28 }}>
          {/* Logo */}
          <div style={{ padding: "0 24px 6px" }}>
            <Logo color="blue" height={32} />
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", padding: "0 24px 20px", borderBottom: "1px solid #F3F4F6" }}>
            Warranty System
          </div>

          {/* Nav links */}
          <nav style={{ padding: "16px 12px 0" }}>
            <button onClick={() => setPage("dashboard")} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === "dashboard" ? "#E8F7FC" : "transparent",
              color: page === "dashboard" ? "#19a5e1" : "#6B7280",
              fontSize: 14, fontWeight: page === "dashboard" ? 600 : 500,
              marginBottom: 4, textAlign: "left",
            }}>📊 Dashboard</button>

            <button onClick={() => setPage("claim")} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === "claim" ? "#E8F7FC" : "transparent",
              color: page === "claim" ? "#19a5e1" : "#6B7280",
              fontSize: 14, fontWeight: page === "claim" ? 600 : 500,
              marginBottom: 4, textAlign: "left",
            }}>📋 New Claim</button>
          </nav>
        </div>

        {/* SPACER — pushes bottom section down */}
        <div style={{ flex: 1 }} />

        {/* BOTTOM — user card + logout — always pinned to bottom */}
        <div style={{
          flexShrink: 0,
          padding: "12px 12px 20px",
          borderTop: "1px solid #F3F4F6",
        }}>
          {/* User card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", background: "#F9FAFB",
            borderRadius: 8, marginBottom: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#19a5e1", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {session.technician_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#111827",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {session.technician_name}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>Technician</div>
            </div>
          </div>

          {/* Logout button — always visible */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "10px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 8, color: "#6B7280",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 6,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#FEF2F2";
              e.currentTarget.style.borderColor = "#FECACA";
              e.currentTarget.style.color = "#DC2626";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.color = "#6B7280";
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: 240, flex: 1, padding: "36px 40px" }}>
        {page === "dashboard"
          ? <Dashboard session={session} onLogout={handleLogout} />
          : <NewClaim session={session} />
        }
      </main>
    </div>
  );
}