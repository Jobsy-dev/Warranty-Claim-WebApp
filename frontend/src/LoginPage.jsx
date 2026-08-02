import { useState } from "react";

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



export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Invalid username or password."); return; }

      const data = await res.json();

      const session = {
        access_token:    data.access_token,
        technician_name: data.technician_name,
        technician_id:   data.technician_id,
        company_name:    data.company_name  || "",
        phone_number:    data.phone_number  || "",
        mail_id:         data.mail_id       || "",
      };
      sessionStorage.setItem("session", JSON.stringify(session));
      onLogin(session);

    } catch {
      setError("Cannot connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── Logo — blue on white card ── */}
        <div style={{ marginBottom: 8 }}>
          <Logo color="blue" height={44} />
        </div>
        <div style={styles.subtitle}>Warranty Claim Management</div>

        <form onSubmit={handleLogin}>
          <div style={styles.group}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" placeholder="Enter your username"
              value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:     { minHeight:"100vh", backgroundColor:"#F0F4FF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Segoe UI, Arial, sans-serif" },
  card:     { backgroundColor:"#FFFFFF", padding:"48px 40px", borderRadius:"16px", boxShadow:"0 4px 24px rgba(0,0,0,0.10)", width:"400px" },
  subtitle: { fontSize:"13px", color:"#6B7280", marginBottom:"32px", marginTop:"6px" },
  group:    { marginBottom:"18px" },
  label:    { display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" },
  input:    { width:"100%", padding:"11px 14px", border:"1px solid #D1D5DB", borderRadius:"8px", fontSize:"14px", color:"#111827", outline:"none", boxSizing:"border-box", backgroundColor:"#F9FAFB" },
  error:    { backgroundColor:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#DC2626", marginBottom:"14px" },
  button:   { width:"100%", padding:"13px", backgroundColor:"#19a5e1", color:"#FFFFFF", border:"none", borderRadius:"8px", fontSize:"15px", fontWeight:"700", cursor:"pointer", marginTop:"8px" },
};