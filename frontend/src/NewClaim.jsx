import { useState, useRef, useCallback } from "react";

const API    = "http://localhost:8000";
const BRAND  = "#19a5e1";   // ← Suggestion 3: new brand colour used everywhere

// ── Confidence Badge ──────────────────────────────────────────────
function ConfBadge({ value }) {
  const v  = typeof value === "number" ? value : parseFloat(value) || 0;
  const c  = v >= 80 ? "#065F46" : v >= 55 ? "#92400E" : "#991B1B";
  const bg = v >= 80 ? "#ECFDF5" : v >= 55 ? "#FFFBEB" : "#FEF2F2";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: c, background: bg,
      padding: "2px 9px", borderRadius: 99, border: `1px solid ${c}33` }}>
      {v}%
    </span>
  );
}

// ── Product Card ──────────────────────────────────────────────────
function ProductCard({ product, selected, onClick }) {
  const [err, setErr] = useState(false);
  return (
    <div onClick={() => onClick(product)} style={{
      borderRadius: 10, overflow: "hidden", cursor: "pointer",
      border: `2px solid ${selected ? BRAND : "#E5E7EB"}`,
      background: selected ? "#E8F7FC" : "#FFFFFF",
      boxShadow: selected ? `0 0 0 3px ${BRAND}33` : "0 1px 3px rgba(0,0,0,0.06)",
      transition: "all 0.18s", position: "relative",
    }}>
      {selected && (
        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2,
          width: 22, height: 22, borderRadius: "50%", background: BRAND,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#fff", fontWeight: 700 }}>✓</div>
      )}
      <div style={{ height: 100, background: "#F9FAFB", display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        {!err
          ? <img src={product.image_url} alt={product.item_no}
              onError={() => setErr(true)}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 6 }} />
          : <span style={{ fontSize: 28, color: "#9CA3AF" }}>📦</span>}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700,
          color: BRAND, marginBottom: 2 }}>{product.item_no}</div>
        <div style={{ fontSize: 11, color: "#6B7280", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
          {product.title}
        </div>
        <ConfBadge value={product.similarity} />
      </div>
    </div>
  );
}

// ── Product Image Area ────────────────────────────────────────────
function ProductImageArea({ product }) {
  const [err, setErr] = useState(false);
  const noImage = !product.image_url || err;
  return (
    <div style={{ height: 140, background: "#F9FAFB", display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      {!noImage
        ? <img src={product.image_url} alt={product.item_no}
            onError={() => setErr(true)}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 10 }} />
        : (
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 40, color: "#D1D5DB" }}>📦</span>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>No image available</div>
          </div>
        )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, color: "#6B7280",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
};
const inputStyle = {
  width: "100%", padding: "9px 12px",
  border: "1px solid #E5E7EB", borderRadius: 8,
  fontSize: 13, color: "#111827", outline: "none",
  background: "#F9FAFB", boxSizing: "border-box", fontFamily: "inherit",
};
// Auto-filled locked style (light blue)
const autoLockedStyle = {
  ...inputStyle,
  background: "#EAF6FC",
  color: "#0e6a91",
  border: `1px solid #a8dff5`,
  cursor: "default",
};
// Auto-filled unlocked style (white, editable)
const autoUnlockedStyle = {
  ...inputStyle,
  background: "#FFFFFF",
  color: "#111827",
  border: `1px solid ${BRAND}`,
  boxShadow: `0 0 0 2px ${BRAND}22`,
};

// ── SUGGESTION 2: Lockable Input Field ───────────────────────────
// Shows lock icon on auto-filled fields. Click to toggle editable.
function LockableField({ label, value, onChange, mono, placeholder, colSpan, type = "text", locked, onToggleLock }) {
  return (
    <div style={{ gridColumn: colSpan ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
        {/* Lock toggle button */}
        <button
          onClick={onToggleLock}
          title={locked ? "Click to unlock and edit" : "Click to lock"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, padding: "0 2px", lineHeight: 1,
            color: locked ? BRAND : "#9CA3AF",
            transition: "color 0.15s",
          }}
        >
          {locked ? "🔒" : "🔓"}
        </button>
      </div>
      <input
        type={type}
        value={value || ""}
        readOnly={locked}
        onChange={e => !locked && onChange && onChange(e.target.value)}
        placeholder={locked ? "" : (placeholder || "")}
        style={{
          ...(locked ? autoLockedStyle : autoUnlockedStyle),
          fontFamily: mono ? "monospace" : "inherit",
        }}
      />
    </div>
  );
}

function InputField({ label, value, onChange, readOnly, mono, placeholder, colSpan, type = "text" }) {
  return (
    <div style={{ gridColumn: colSpan ? "1 / -1" : undefined }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value || ""}
        readOnly={readOnly}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder || ""}
        style={{ ...(readOnly ? autoLockedStyle : inputStyle), fontFamily: mono ? "monospace" : "inherit" }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea value={value || ""} onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder || ""} rows={rows}
        style={{ ...inputStyle, resize: "vertical", background: "#FFFFFF" }} />
    </div>
  );
}

function CheckBox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)}
        style={{ width: 15, height: 15, accentColor: BRAND, cursor: "pointer" }} />
      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function RadioGroup({ label, value, onChange, options }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
        {options.map(opt => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="radio" name={label} value={opt} checked={value === opt}
              onChange={() => onChange(opt)} style={{ accentColor: BRAND, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SubLabel({ text }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF",
      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
      {text}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #F3F4F6", margin: "18px 0" }} />;
}

// ── TAB DEFINITIONS ───────────────────────────────────────────────
const TABS = [
  { id: "product",      icon: "📦", label: "Product Details" },
  { id: "general",      icon: "📋", label: "General Information" },
  { id: "agreement",    icon: "📄", label: "Buyer's Agreement" },
  { id: "installation", icon: "🏭", label: "Installation & Conditions" },
  { id: "other",        icon: "📝", label: "Other Information" },
];

// ════════════════════════════════════════════════════════
// TABBED FORM
// ════════════════════════════════════════════════════════
function TabbedForm({ product, customerDetails, session, orderAutoFill, orderFaktnrMap, orderQuantityMap, onSubmitted }) {
  const [activeTab, setActiveTab]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── SUGGESTION 3: new brand colour used for contract cards ──
  const [contractCategory, setContractCategory] = useState("");

  // ── SUGGESTION 2: lock states for auto-filled fields ─────────
  // true = locked (read-only), false = unlocked (editable)
  const [locks, setLocks] = useState({
    Artnr: true, EAN: true, Type_designation: true, Serienum: true, Quantity: true,
    ManufacturerItemNo: true, Brand: true,
    BuyerName: true, BuyerContactPerson: true, BuyerPhone: true, BuyerEmail: true,
    Seller_name: true, Seller_contact: true, Seller_phone: true, Seller_mail: true,
    EndCustomerOrFacilityOwner: true, Install_site: true,
    CurrentProductLocation: true, ReturnDeliveryAddress: true,
    Faktnr: true, Odatum: true, Levdat: true, Comm_date: true,
    TechName: true, TechCompany: true, TechPhone: true, TechEmail: true,
  });
  const toggleLock = (key) => setLocks(p => ({ ...p, [key]: !p[key] }));

  const [form, setForm] = useState({
    Artnr:               product.item_no              || "",
    EAN:                 product.ean                  || "",
    Serienum:            product.item_no              || "",
    Type_designation:    product.title                || "",
    ManufacturerItemNo:  product.manufacturer_item_no || "",
    Brand:               product.brand                || "",
    Quantity:         "1",  // ✅ Always 1 — quantity from DB is ignored
    Descfault:        "",
    BuyerName:          session.company_name    || "company_name",
    BuyerContactPerson: session.technician_name || "",
    BuyerPhone:         session.phone_number    || "",
    BuyerEmail:         session.mail_id         || "",
    Seller_name:    "sellername",
    Seller_contact: "contact",
    Seller_phone:   "7896654123",
    Seller_mail:    "mail_id",
    Complaint_date: new Date().toISOString().slice(0, 10),
    Odatum:    orderAutoFill?.odatum  || "",
    Faktnr:    orderAutoFill ? (orderFaktnrMap?.[product.item_no] || orderAutoFill.faktnr || "") : "",
    Levdat:    orderAutoFill?.levdat  || "",
    Comm_date: orderAutoFill?.levdat  || "",
    EndCustomerOrFacilityOwner: customerDetails?.Customer_name    || "",
    Install_site:               customerDetails?.Customer_Address || "",
    InvestigationReportRequested: false,
    CurrentProductLocation: "company_name", ReturnDeliveryAddress: "Rexel",
    AB04: false, ABT06: false, EL10: false, ABS09: false,
    Agreement_HandymanForm: false, Agreement_OtherText: "",
    ContractAttached: false, BuyerWarrantyMonths: "",
    InstalledIndoors: false, InstalledOutdoors: false,
    HumidEnvironment: false, DryEnvironment: false, DustyEnvironment: false,
    PermanentlyHeated: false, AmbientTempMinMax: "",
    AggressiveEnvironment: false, VibrationsPresent: false,
    InstalledToStandard: "", InstalledToInstructions: "",
    MaintainedToInstructions: "",
    CircuitDiagramStatus: "", OperationLogStatus: "",
    Add_info: "",
    Claim_status: "",
    // Technician fields (Form Completed By) — editable via lock toggle
    TechName:    session.technician_name || "",
    TechCompany: session.company_name    || "company_name",
    TechPhone:   session.phone_number    || "",
    TechEmail:   session.mail_id         || "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isLastTab = activeTab === TABS.length - 1;

  // ── Warranty calculation ──────────────────────────────────────
  const calcWarrantyMonths = (contractType) => {
    const totalMonths = contractType === "EL10" ? 24 : 66;
    const levdat    = form.Levdat || orderAutoFill?.levdat || "";
    const complaint = form.Complaint_date || new Date().toISOString().slice(0, 10);
    if (!levdat) return totalMonths;
    const elapsed = Math.floor((new Date(complaint) - new Date(levdat)) / (1000 * 60 * 60 * 24 * 30.44));
    return Math.max(0, totalMonths - elapsed);
  };

  const handleCategorySelect = (category) => {
    setContractCategory(category);
    if (category === "service") {
      const months = calcWarrantyMonths("EL10");
      setForm(p => ({ ...p, AB04: 0, ABT06: 0, EL10: 1, BuyerWarrantyMonths: months }));
    } else {
      // FIX 2: ABT06 auto-selected by default when Project is chosen
      const months = calcWarrantyMonths("ABT06");
      setForm(p => ({ ...p, AB04: 0, ABT06: 1, EL10: 0, BuyerWarrantyMonths: months }));
    }
  };

  const handleContractSelect = (contractType) => {
    const months = calcWarrantyMonths(contractType);
    setForm(p => ({
      ...p,
      AB04:  contractType === "AB04"  ? 1 : 0,
      ABT06: contractType === "ABT06" ? 1 : 0,
      EL10:  contractType === "EL10"  ? 1 : 0,
      BuyerWarrantyMonths: months,
    }));
  };

  const selectedContract = form.AB04 ? "AB04" : form.ABT06 ? "ABT06" : form.EL10 ? "EL10" : "";

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.Claim_status) { setSubmitError("Please select Approve or Reject."); return; }
    if (!form.Descfault.trim()) { setSubmitError("Fault description is required (Product Details tab)."); return; }
    if (!form.Artnr.trim()) { setSubmitError("Article number is required."); return; }
    setSubmitting(true); setSubmitError("");
    try {
      const payload = {
        ...form,
        Customer_name:    customerDetails.Customer_name,
        Customer_phone:   customerDetails.Customer_phone,
        Customer_Address: customerDetails.Customer_Address,
        Tech_id:             session.technician_id,
        BuyerWarrantyMonths: form.BuyerWarrantyMonths ? parseInt(form.BuyerWarrantyMonths) : null,
        Quantity:            form.Quantity ? parseInt(form.Quantity) : null,
        AB04:  form.AB04 ? 1 : 0, ABT06: form.ABT06 ? 1 : 0, EL10: form.EL10 ? 1 : 0,
        ABS09: form.ABS09 ? 1 : 0, Agreement_HandymanForm: form.Agreement_HandymanForm ? 1 : 0,
        ContractAttached: form.ContractAttached ? 1 : 0,
        InvestigationReportRequested: form.InvestigationReportRequested ? 1 : 0,
        InstalledIndoors: form.InstalledIndoors ? 1 : 0, InstalledOutdoors: form.InstalledOutdoors ? 1 : 0,
        HumidEnvironment: form.HumidEnvironment ? 1 : 0, DryEnvironment: form.DryEnvironment ? 1 : 0,
        DustyEnvironment: form.DustyEnvironment ? 1 : 0, PermanentlyHeated: form.PermanentlyHeated ? 1 : 0,
        AggressiveEnvironment: form.AggressiveEnvironment ? 1 : 0, VibrationsPresent: form.VibrationsPresent ? 1 : 0,
        InstalledToStandard:      form.InstalledToStandard === "Yes" ? 1 : 0,
        InstalledToInstructions:  form.InstalledToInstructions === "Yes" ? 1 : 0,
        MaintainedToInstructions: form.MaintainedToInstructions === "Yes" ? 1 : 0,
        Odatum: form.Odatum || null, Levdat: form.Levdat || null,
        Comm_date: form.Comm_date || null, Complaint_date: form.Complaint_date || null,
      };
      const res  = await fetch(`${API}/claims/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Submit failed");

      try {
        const pdfPayload = { ...payload, claimid: data.claimid, Claim_status: form.Claim_status,
          Created_at: new Date().toISOString().slice(0, 10),
          technician_name: form.TechName    || session.technician_name || "",
          company_name:    form.TechCompany || session.company_name    || "",
          phone_number:    form.TechPhone   || session.phone_number    || "",
          mail_id:         form.TechEmail   || session.mail_id         || "",
          Quantity: form.Quantity ? String(form.Quantity) : "",
          BuyerWarrantyMonths: form.BuyerWarrantyMonths ? parseInt(form.BuyerWarrantyMonths) : null,
        };
        const pdfRes = await fetch(`${API}/claims/generate-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(pdfPayload),
        });
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement("a");
          a.href = url; a.download = `ALEM09_Claim_${data.claimid}.pdf`;
          document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(url);
        }
      } catch (pdfErr) { console.warn("PDF failed:", pdfErr); }

      onSubmitted(data.claimid, form.Claim_status, form.Type_designation || form.Artnr, form.Artnr);
    } catch (e) {
      setSubmitError(e.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tab: Product ──────────────────────────────────────────────
  const isDbOnly = product.source === "db";

  const renderProduct = () => (
    <div>
     

      {/* FIX 4: DB-only warning banner */}
      {isDbOnly && (
        <div style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 14,
          background: "#FFFBEB", border: "1px solid #FCD34D", fontSize: 12, color: "#92400E" }}>
          ⚠ <strong>Item found in database only</strong> — not in the product catalogue.
          EAN, title, manufacturer and brand details are not available.
          Please fill in the fault description and serial number manually below.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Item No — always shown */}
        <LockableField label="Item Number (E-nummer)" value={form.Artnr} onChange={v => set("Artnr", v)}
          mono locked={locks.Artnr} onToggleLock={() => toggleLock("Artnr")} />

        {/* FIX 4: EAN hidden for DB-only items */}
        {!isDbOnly && (
          <LockableField label="EAN" value={form.EAN} onChange={v => set("EAN", v)}
            mono locked={locks.EAN} onToggleLock={() => toggleLock("EAN")} />
        )}

        {/* FIX 4: Product Title hidden for DB-only items */}
        {!isDbOnly && (
          <LockableField label="Product Title / Type Designation" value={form.Type_designation}
            onChange={v => set("Type_designation", v)} colSpan
            locked={locks.Type_designation} onToggleLock={() => toggleLock("Type_designation")} />
        )}

        {/* FIX: Manufacturer No uses form state — editable when unlocked */}
        {!isDbOnly && (
          <LockableField
            label="Manufacturer Item No"
            value={form.ManufacturerItemNo}
            onChange={v => set("ManufacturerItemNo", v)}
            mono
            locked={locks.ManufacturerItemNo}
            onToggleLock={() => toggleLock("ManufacturerItemNo")}
          />
        )}

        {/* FIX: Brand uses form state — editable when unlocked */}
        {!isDbOnly && (
          <LockableField
            label="Brand / Supplier"
            value={form.Brand}
            onChange={v => set("Brand", v)}
            locked={locks.Brand}
            onToggleLock={() => toggleLock("Brand")}
          />
        )}
      </div>

      <Divider />
     
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Quantity always defaults to 1 — technician can edit freely */}
        <InputField label="Quantity (Antal)" value={form.Quantity}
          onChange={v => set("Quantity", v)} type="number" placeholder="1" />
        <LockableField label="Serial Number (Serienummer)" value={form.Serienum}
          onChange={v => set("Serienum", v)} placeholder="e.g. SN-20240123"
          locked={locks.Serienum} onToggleLock={() => toggleLock("Serienum")} />
      </div>
      <TextAreaField label="Fault Description (Felbeskrivning) *" value={form.Descfault}
        onChange={v => set("Descfault", v)}
        placeholder="Describe the fault or defect clearly and in detail..." rows={4} />
    </div>
  );

  // ── Tab: General ──────────────────────────────────────────────
  const renderGeneral = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <SubLabel text="Buyer (Köpare)" />
      <div style={{ background: "#F0FAFE", border: `1px solid #a8dff5`, borderRadius: 10, padding: "14px 16px", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: BRAND, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {(session.company_name || "E").charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Buyer Details</div>
          <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
            background: "#E8F7FC", color: BRAND, fontWeight: 600 }}></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LockableField label="Buyer Name (Company)"    value={form.BuyerName}          onChange={v => set("BuyerName", v)}          locked={locks.BuyerName}          onToggleLock={() => toggleLock("BuyerName")} />
          <LockableField label="Buyer Contact Person"    value={form.BuyerContactPerson} onChange={v => set("BuyerContactPerson", v)} locked={locks.BuyerContactPerson} onToggleLock={() => toggleLock("BuyerContactPerson")} />
          <LockableField label="Buyer Phone"             value={form.BuyerPhone}         onChange={v => set("BuyerPhone", v)}         locked={locks.BuyerPhone}         onToggleLock={() => toggleLock("BuyerPhone")} />
          <LockableField label="Buyer Email"             value={form.BuyerEmail}         onChange={v => set("BuyerEmail", v)}         locked={locks.BuyerEmail}         onToggleLock={() => toggleLock("BuyerEmail")} />
        </div>
      </div>

      <Divider />

      <SubLabel text="Seller (Säljare)" />
      <div style={{ background: "#F0FAFE", border: `1px solid #a8dff5`, borderRadius: 10, padding: "14px 16px", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0369A1", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>R</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Seller Details</div>
          <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
            background: "#E8F7FC", color: BRAND, fontWeight: 600 }}></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LockableField label="Seller Name"           value={form.Seller_name}    onChange={v => set("Seller_name", v)}    locked={locks.Seller_name}    onToggleLock={() => toggleLock("Seller_name")} />
          <LockableField label="Seller Contact Person" value={form.Seller_contact} onChange={v => set("Seller_contact", v)} locked={locks.Seller_contact} onToggleLock={() => toggleLock("Seller_contact")} />
          <LockableField label="Seller Phone"          value={form.Seller_phone}   onChange={v => set("Seller_phone", v)}   locked={locks.Seller_phone}   onToggleLock={() => toggleLock("Seller_phone")} />
          <LockableField label="Seller Email"          value={form.Seller_mail}    onChange={v => set("Seller_mail", v)}    locked={locks.Seller_mail}    onToggleLock={() => toggleLock("Seller_mail")} />
        </div>
      </div>

      <Divider />

      <SubLabel text="Dates" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
        <InputField label="Complaint Date" value={form.Complaint_date} onChange={v => set("Complaint_date", v)} type="date" />
        <LockableField label="Order Date (Odatum)"    value={form.Odatum}    onChange={v => set("Odatum", v)}    type="date" locked={locks.Odatum}    onToggleLock={() => toggleLock("Odatum")} />
        <LockableField label="Invoice No (Faktnr)"    value={form.Faktnr}    onChange={v => set("Faktnr", v)}    locked={locks.Faktnr}    onToggleLock={() => toggleLock("Faktnr")} placeholder="INV-2024-001" />
        <LockableField label="Delivery Date (Levdat)" value={form.Levdat}    onChange={v => set("Levdat", v)}    type="date" locked={locks.Levdat}    onToggleLock={() => toggleLock("Levdat")} />
        <LockableField label="Commissioning Date"     value={form.Comm_date} onChange={v => set("Comm_date", v)} type="date" locked={locks.Comm_date} onToggleLock={() => toggleLock("Comm_date")} />
      </div>

      <Divider />

      <SubLabel text="End Customer / Facility (Beställare/Anläggningsägare)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
        <LockableField label="End Customer / Facility Owner" value={form.EndCustomerOrFacilityOwner}
          onChange={v => set("EndCustomerOrFacilityOwner", v)} placeholder="Beställare / Anläggningsägare"
          locked={locks.EndCustomerOrFacilityOwner} onToggleLock={() => toggleLock("EndCustomerOrFacilityOwner")} />
        <LockableField label="Installation Site (Montageplats)" value={form.Install_site}
          onChange={v => set("Install_site", v)} placeholder="Address or site description"
          locked={locks.Install_site} onToggleLock={() => toggleLock("Install_site")} />
      </div>

      <Divider />

      <SubLabel text="Investigation & Product Location" />
      <div style={{ marginBottom: 14 }}>
        <CheckBox label="Investigation Report Requested (Önskas undersökningsrapport)"
          checked={form.InvestigationReportRequested} onChange={v => set("InvestigationReportRequested", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <LockableField label="Current Product Location" value={form.CurrentProductLocation}
          onChange={v => set("CurrentProductLocation", v)} placeholder="Where is the product now?"
          locked={locks.CurrentProductLocation} onToggleLock={() => toggleLock("CurrentProductLocation")} />
        <LockableField label="Return Delivery Address" value={form.ReturnDeliveryAddress}
          onChange={v => set("ReturnDeliveryAddress", v)} placeholder="Return address"
          locked={locks.ReturnDeliveryAddress} onToggleLock={() => toggleLock("ReturnDeliveryAddress")} />
      </div>
    </div>
  );

  // ── Tab: Agreement ────────────────────────────────────────────
  const renderAgreement = () => {
    const levdat    = form.Levdat || orderAutoFill?.levdat || "";
    const complaint = form.Complaint_date || new Date().toISOString().slice(0, 10);
    const projectContracts = [
      { key: "AB04",  label: "AB 04 / AB-U 07",  months: 66 },
      { key: "ABT06", label: "ABT 06 / ABT-U 07", months: 66 },
    ];
    return (
      <div>
        <SubLabel text="Step 1 — Work Type (Avtalstyp)" />
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 14, marginTop: -6 }}>
          Select the type of work — this determines which contract types are available.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { key: "project", label: "Project", desc: "AB 04 / AB-U 07 or ABT 06 / ABT-U 07", color: BRAND, bg: "#E8F7FC" },
            { key: "service", label: "Service", desc: "EL 10 — service & maintenance work",     color: "#065F46", bg: "#ECFDF5" },
          ].map(cat => {
            const isSelected = contractCategory === cat.key;
            return (
              <div key={cat.key} onClick={() => handleCategorySelect(cat.key)} style={{
                borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                border: `2px solid ${isSelected ? cat.color : "#E5E7EB"}`,
                background: isSelected ? cat.bg : "#FAFAFA",
                boxShadow: isSelected ? `0 0 0 3px ${cat.color}22` : "none",
                transition: "all 0.18s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${isSelected ? cat.color : "#D1D5DB"}`,
                    background: isSelected ? cat.color : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? cat.color : "#374151" }}>{cat.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", paddingLeft: 30 }}>{cat.desc}</div>
              </div>
            );
          })}
        </div>

        {contractCategory && (
          <>
            <SubLabel text={`Step 2 — Contract Type (${contractCategory === "project" ? "Project contracts" : "Service contract"})`} />
            {contractCategory === "service" ? (
              <div style={{ borderRadius: 12, padding: "16px 18px", border: "2px solid #065F46",
                background: "#ECFDF5", boxShadow: "0 0 0 3px #065F4622", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: "#065F46",
                    border: "2px solid #065F46", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>EL 10</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 99,
                    background: "#065F46", color: "#fff", fontWeight: 600 }}>✓ Auto-selected</span>
                </div>
                <div style={{ paddingLeft: 28, marginTop: 6, fontSize: 11, color: "#6B7280" }}>Total warranty: <strong>24 months</strong></div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {projectContracts.map(c => {
                  const isSelected = selectedContract === c.key;
                  const levDate    = levdat ? new Date(levdat) : null;
                  const compDate   = complaint ? new Date(complaint) : null;
                  const elapsed    = (levDate && compDate) ? Math.floor((compDate - levDate) / (1000 * 60 * 60 * 24 * 30.44)) : 0;
                  const remaining  = levDate ? Math.max(0, c.months - elapsed) : c.months;
                  const expired    = remaining === 0 && levDate;
                  return (
                    <div key={c.key} onClick={() => handleContractSelect(c.key)} style={{
                      borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                      border: `2px solid ${isSelected ? BRAND : "#E5E7EB"}`,
                      background: isSelected ? "#E8F7FC" : "#FAFAFA",
                      boxShadow: isSelected ? `0 0 0 3px ${BRAND}22` : "none",
                      transition: "all 0.18s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${isSelected ? BRAND : "#D1D5DB"}`,
                          background: isSelected ? BRAND : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSelected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? BRAND : "#374151" }}>{c.label}</span>
                      </div>
                      <div style={{ paddingLeft: 28 }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Total warranty: <strong>{c.months} months</strong></div>
                        {isSelected && levdat && (
                          <div style={{ fontSize: 12, fontWeight: 700,
                            color: expired ? "#991B1B" : remaining <= 12 ? "#92400E" : "#065F46",
                            background: expired ? "#FEF2F2" : remaining <= 12 ? "#FFFBEB" : "#ECFDF5",
                            padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                            {expired ? "⚠ Warranty Expired" : `✓ ${remaining} months remaining`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedContract && (
              <div style={{ background: "#F0FAFE", border: `1px solid #a8dff5`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>📅</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>Warranty Period Calculation</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#E8F7FC", color: BRAND, fontWeight: 600 }}>✓ Auto-calculated</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>Delivery Date</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{levdat || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>Complaint Date</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{complaint}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>Remaining Months</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: form.BuyerWarrantyMonths > 0 ? "#065F46" : "#991B1B" }}>
                      {form.BuyerWarrantyMonths ?? "—"}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", marginLeft: 4 }}>months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {!contractCategory && (
          <div style={{ borderRadius: 10, border: "2px dashed #E5E7EB", background: "#F9FAFB",
            padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
            👆 Select Project or Service above to choose a contract type
          </div>
        )}
      </div>
    );
  };

  // ── Tab: Installation ─────────────────────────────────────────
  const renderInstallation = () => (
    <div>
      <SubLabel text="Installation Environment" />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 4 }}>
        <CheckBox label="Indoors (Inne)"   checked={form.InstalledIndoors}  onChange={v => set("InstalledIndoors", v)} />
        <CheckBox label="Outdoors (Ute)"   checked={form.InstalledOutdoors} onChange={v => set("InstalledOutdoors", v)} />
        <CheckBox label="Humid (Fuktigt)"  checked={form.HumidEnvironment}  onChange={v => set("HumidEnvironment", v)} />
        <CheckBox label="Dry (Torrt)"      checked={form.DryEnvironment}    onChange={v => set("DryEnvironment", v)} />
        <CheckBox label="Dusty (Dammigt)"  checked={form.DustyEnvironment}  onChange={v => set("DustyEnvironment", v)} />
      </div>
      <Divider />
      <SubLabel text="Additional Conditions" />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
        <CheckBox label="Permanently Heated" checked={form.PermanentlyHeated}    onChange={v => set("PermanentlyHeated", v)} />
        <CheckBox label="Aggressive Environment" checked={form.AggressiveEnvironment} onChange={v => set("AggressiveEnvironment", v)} />
        <CheckBox label="Vibrations" checked={form.VibrationsPresent} onChange={v => set("VibrationsPresent", v)} />
      </div>
      <div style={{ maxWidth: 280 }}>
        <InputField label="Ambient Temp Min–Max" value={form.AmbientTempMinMax} onChange={v => set("AmbientTempMinMax", v)} placeholder="e.g. -10°C to +40°C" />
      </div>
      <Divider />
      <SubLabel text="Compliance" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 4 }}>
        <RadioGroup label="Installed per regulations?" value={form.InstalledToStandard}      onChange={v => set("InstalledToStandard", v)}      options={["Yes", "No"]} />
        <RadioGroup label="Installed per instructions?" value={form.InstalledToInstructions} onChange={v => set("InstalledToInstructions", v)} options={["Yes", "No"]} />
        <RadioGroup label="Maintained per instructions?" value={form.MaintainedToInstructions} onChange={v => set("MaintainedToInstructions", v)} options={["Yes", "No"]} />
      </div>
      <Divider />
      <SubLabel text="Documentation" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RadioGroup label="Circuit Diagram available?" value={form.CircuitDiagramStatus} onChange={v => set("CircuitDiagramStatus", v)} options={["Yes", "Enclosed", "No"]} />
        <RadioGroup label="Operation Log kept?" value={form.OperationLogStatus} onChange={v => set("OperationLogStatus", v)} options={["Yes", "Enclosed", "No"]} />
      </div>
    </div>
  );

  // ── Tab: Other ────────────────────────────────────────────────
  const renderOther = () => (
    <div>
      <SubLabel text="Övrig information" />
      <TextAreaField label="Additional Information" value={form.Add_info} onChange={v => set("Add_info", v)}
        placeholder="Any other relevant information..." rows={4} />
      <Divider />
      <SubLabel text="Form Completed By (Blanketten ifylld av)" />
      <div style={{ background: "#F0FAFE", border: `1px solid #a8dff5`, borderRadius: 10, padding: "14px 16px", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: BRAND, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {(session.technician_name || "T").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: BRAND }}>{session.technician_name || "—"}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Technician Details</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99,
            background: "#E8F7FC", color: BRAND, fontWeight: 600 }}></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LockableField label="Name"    value={form.TechName}    onChange={v => set("TechName", v)}    locked={locks.TechName}    onToggleLock={() => toggleLock("TechName")} />
          <LockableField label="Company" value={form.TechCompany} onChange={v => set("TechCompany", v)} locked={locks.TechCompany} onToggleLock={() => toggleLock("TechCompany")} />
          <LockableField label="Phone"   value={form.TechPhone}   onChange={v => set("TechPhone", v)}   locked={locks.TechPhone}   onToggleLock={() => toggleLock("TechPhone")} />
          <LockableField label="Email"   value={form.TechEmail}   onChange={v => set("TechEmail", v)}   locked={locks.TechEmail}   onToggleLock={() => toggleLock("TechEmail")} />
        </div>
      </div>
      <Divider />
      <SubLabel text="ALEM09 Claim Decision" />
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => set("Claim_status", "approved")} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer",
          border: `2px solid ${form.Claim_status === "approved" ? "#059669" : "#D1FAE5"}`,
          background: form.Claim_status === "approved" ? "#ECFDF5" : "#F9FAFB", transition: "all 0.2s" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>✅</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>APPROVE</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Claimable under warranty</div>
        </button>
        <button onClick={() => set("Claim_status", "rejected")} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer",
          border: `2px solid ${form.Claim_status === "rejected" ? "#DC2626" : "#FEE2E2"}`,
          background: form.Claim_status === "rejected" ? "#FEF2F2" : "#F9FAFB", transition: "all 0.2s" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>❌</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>REJECT</div>
          <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Not claimable</div>
        </button>
      </div>
      {submitError && (
        <div style={{ padding: "9px 14px", borderRadius: 8, background: "#FEF2F2",
          border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginBottom: 12 }}>⚠ {submitError}</div>
      )}
      <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none",
        background: form.Claim_status ? BRAND : "#E5E7EB",
        color: form.Claim_status ? "#fff" : "#9CA3AF",
        fontSize: 14, fontWeight: 700, cursor: form.Claim_status ? "pointer" : "not-allowed" }}>
        {submitting ? "⏳ Saving & generating PDF..." : "🚀 Submit Claim + Download ALEM09 PDF"}
      </button>
      {!form.Claim_status && (
        <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 8 }}>
          Select Approve or Reject above to enable submit
        </div>
      )}
    </div>
  );

  const tabContent = [renderProduct(), renderGeneral(), renderAgreement(), renderInstallation(), renderOther()];

  return (
    <div style={{ borderRadius: 14, background: "#FFFFFF", border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>📋 ALEM09 Warranty Claim Form</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Product details auto-filled — complete all tabs then submit</div>
        </div>
        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: "#E8F7FC", color: BRAND, fontWeight: 600 }}></span>
      </div>

      {/* Progress */}
      <div style={{ padding: "10px 20px 0", background: "#FAFBFF", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          {TABS.map((tab, i) => {
            const done = i < activeTab; const active = i === activeTab;
            return (
              <div key={tab.id} onClick={() => setActiveTab(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {i > 0 && <div style={{ flex: 1, height: 2, background: done || active ? BRAND : "#E5E7EB", transition: "background 0.3s" }} />}
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 13 : 12, fontWeight: 700,
                    background: done ? BRAND : active ? "#E8F7FC" : "#F3F4F6",
                    border: `2px solid ${done || active ? BRAND : "#E5E7EB"}`,
                    color: done ? "#fff" : active ? BRAND : "#9CA3AF", transition: "all 0.3s" }}>
                    {done ? "✓" : i + 1}
                  </div>
                  {i < TABS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? BRAND : "#E5E7EB", transition: "background 0.3s" }} />}
                </div>
                <div style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? BRAND : done ? "#6B7280" : "#9CA3AF", marginTop: 5, textAlign: "center", maxWidth: 80, lineHeight: 1.2 }}>
                  {tab.icon} {tab.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px" }}>{tabContent[activeTab]}</div>

      {!isLastTab && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", background: "#FAFBFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setActiveTab(i => Math.max(0, i - 1))} disabled={activeTab === 0}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#FFFFFF", color: activeTab === 0 ? "#D1D5DB" : "#6B7280", fontSize: 13, fontWeight: 600, cursor: activeTab === 0 ? "not-allowed" : "pointer" }}>← Back</button>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Step {activeTab + 1} of {TABS.length}</span>
          <button onClick={() => setActiveTab(i => Math.min(TABS.length - 1, i + 1))}
            style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Next →</button>
        </div>
      )}
      {isLastTab && (
        <div style={{ padding: "8px 20px 0 20px", background: "#FAFBFF", borderTop: "1px solid #F3F4F6" }}>
          <button onClick={() => setActiveTab(i => Math.max(0, i - 1))}
            style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MAIN NEW CLAIM PAGE
// ════════════════════════════════════════════════════════
export default function NewClaim({ session }) {
  const [preview, setPreview]     = useState(null);
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [matches, setMatches]     = useState([]);
  const [method, setMethod]       = useState(null);
  const [selected, setSelected]   = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError]         = useState(null);
  const [drag, setDrag]           = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  const [orderNumber, setOrderNumber]     = useState("");
  const [orderLoading, setOrderLoading]   = useState(false);
  const [orderError, setOrderError]       = useState("");
  const [orderLoaded, setOrderLoaded]     = useState(false);
  const [orderItems, setOrderItems]       = useState([]);
  const [orderFaktnrMap, setOrderFaktnrMap]   = useState({});
  const [orderQuantityMap, setOrderQuantityMap] = useState({});
  const [customer, setCustomer] = useState({ Customer_name: "", Customer_phone: "", Customer_Address: "" });
  const setC = (k, v) => setCustomer(p => ({ ...p, [k]: v }));
  const [orderAutoFill, setOrderAutoFill] = useState(null);

  const [identifyMode, setIdentifyMode]   = useState("photo");
  const [manualArtnr, setManualArtnr]     = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError]     = useState("");

  // ── SUGGESTION 1: order validation warning ───────────────────
  const [orderValidation, setOrderValidation] = useState(null);
  // null = not checked, { valid, message } = checked

  const fileRef = useRef();

  const reset = () => {
    setPreview(null); setFile(null); setMatches([]);
    setMethod(null); setSelected(null); setConfirmed(null); setError(null);
    setSubmitted(false); setClaimResult(null);
    setOrderNumber(""); setOrderLoading(false); setOrderError("");
    setOrderLoaded(false); setOrderItems([]); setOrderFaktnrMap({});
    setOrderAutoFill(null); setOrderQuantityMap({});
    setCustomer({ Customer_name: "", Customer_phone: "", Customer_Address: "" });
    setManualArtnr(""); setManualError(""); setOrderValidation(null);
  };

  const loadOrder = async () => {
    if (!orderNumber.trim()) { setOrderError("Please enter an order number."); return; }
    setOrderLoading(true); setOrderError(""); setOrderLoaded(false);
    setOrderItems([]); setOrderFaktnrMap({}); setOrderAutoFill(null);
    setMatches([]); setMethod(null); setSelected(null); setConfirmed(null);
    setOrderValidation(null);
    try {
      const res  = await fetch(`${API}/order/${orderNumber.trim()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) { setOrderError(data.detail || "Order not found."); return; }
      setCustomer({
        Customer_name:    data.order_info.customer_name    || "",
        Customer_phone:   data.order_info.customer_phone   || "",
        Customer_Address: data.order_info.customer_address || "",
      });
      setOrderItems(data.item_numbers || []);
      setOrderFaktnrMap(data.faktnr_map || {});
      setOrderQuantityMap(data.quantity_map || {});
      setOrderAutoFill(data.order_info);
      setOrderLoaded(true);
    } catch {
      setOrderError("Cannot reach backend.");
    } finally {
      setOrderLoading(false);
    }
  };

  // ── SUGGESTION 1: validate item against order ─────────────────
  const validateItemAgainstOrder = async (itemNo) => {
    if (!orderLoaded || !orderNumber.trim() || !itemNo) {
      setOrderValidation(null);
      return true; // no order loaded = no validation needed
    }
    try {
      const res  = await fetch(
        `${API}/validate-order-item?order_number=${encodeURIComponent(orderNumber.trim())}&item_no=${encodeURIComponent(itemNo)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const data = await res.json();
      setOrderValidation(data);
      return data.valid;
    } catch {
      setOrderValidation(null);
      return true; // network error = don't block
    }
  };

  const pickFile = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setMatches([]); setMethod(null);
    setSelected(null); setConfirmed(null); setError(null);
    setOrderValidation(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    pickFile(e.dataTransfer.files[0]);
  }, [pickFile]);

  const identifyByPhoto = async () => {
    if (!file) return;
    setLoading(true); setError(null); setOrderValidation(null);
    setMatches([]); setMethod(null); setSelected(null); setConfirmed(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (orderLoaded && orderItems.length > 0) {
        fd.append("order_items", orderItems.join(","));
      }
      const res  = await fetch(`${API}/identify`, { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) { setError(data.message || "No matches found."); return; }
      setMatches(data.matches || []);
      setMethod(data.match_method);
      if (data.auto_confirm && data.matches?.length > 0) {
        const prod = data.matches[0];
        // FIX 1: validate barcode against order — only auto-confirm if valid (or no order loaded)
        const valid = await validateItemAgainstOrder(prod.item_no);
        setSelected(prod);
        if (valid) {
          setConfirmed(prod);  // show form
        }
        // if not valid → orderValidation.valid=false → banner shown, form NOT shown
      }
    } catch {
      setError("Cannot reach backend. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTION 2 + 4: manual article lookup with DB fallback
  const identifyByArtnr = async () => {
    if (!manualArtnr.trim()) { setManualError("Please enter an article number."); return; }
    setManualLoading(true); setManualError(""); setOrderValidation(null);
    setMatches([]); setMethod(null); setSelected(null); setConfirmed(null);
    try {
      const res  = await fetch(`${API}/identify-by-artnr?item_no=${encodeURIComponent(manualArtnr.trim())}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!data.success) { setManualError(data.message || "Product not found."); return; }

      const product = data.product;
      product.similarity   = 100.0;
      product.match_method = "manual";

      // FIX 1: validate item against loaded order — block form if not valid
      const valid = await validateItemAgainstOrder(product.item_no);

      setMatches([product]);
      setMethod("manual");
      setSelected(product);
      if (valid) {
        setConfirmed(product);  // show ALEM09 form only if valid
      }
      // if not valid → orderValidation banner shows, form NOT shown
    } catch {
      setManualError("Cannot reach backend.");
    } finally {
      setManualLoading(false);
    }
  };

  // FIX 1: handle AI result selection — validate on click
  const handleSelectProduct = async (prod) => {
    setSelected(prod);
    setConfirmed(null);  // always reset confirmed when selecting a new product
    await validateItemAgainstOrder(prod.item_no);
  };

  // FIX 1: Confirm button only works if order validation passes (or no order loaded)
  const handleConfirmProduct = (prod) => {
    if (orderValidation && !orderValidation.valid) {
      // Show validation error but don't allow confirm
      return;
    }
    setConfirmed(prod);
  };

  const isBarcode = method === "barcode";
  const isAI      = method === "visual_search" && matches.length > 0;
  const isManual  = method === "manual" && confirmed;

  if (submitted && claimResult) {
    return (
      <div style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.5px" }}>New Warranty Claim</h1>
        <div style={{ borderRadius: 14, padding: 40, textAlign: "center",
          background: claimResult.status === "approved" ? "#ECFDF5" : "#FEF2F2",
          border: `1px solid ${claimResult.status === "approved" ? "#6EE7B7" : "#FECACA"}`, marginTop: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>{claimResult.status === "approved" ? "✅" : "❌"}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: claimResult.status === "approved" ? "#065F46" : "#991B1B" }}>
            Claim {claimResult.status === "approved" ? "APPROVED" : "REJECTED"}
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
            Claim <strong style={{ fontFamily: "monospace", color: BRAND }}>#{claimResult.claimId}</strong> saved to database
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Product: {claimResult.productName}</div>
          <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "monospace", marginBottom: 28 }}>Item No: {claimResult.artnr}</div>
          <button onClick={reset} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: BRAND, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ New Claim</button>
        </div>
      </div>
    );
  }

  // ── FIX 1: Order validation banner ───────────────────────────
  const ValidationBanner = () => {
    if (!orderValidation) return null;
    if (orderValidation.valid) return (
      <div style={{ padding: "9px 14px", borderRadius: 8, background: "#ECFDF5",
        border: "1px solid #6EE7B7", color: "#065F46", fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
        ✅ {orderValidation.message}
      </div>
    );
    return (
      <div style={{ padding: "14px 16px", borderRadius: 10, background: "#FEF2F2",
        border: "2px solid #FECACA", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>
          ❌ Article not found in this order
        </div>
        <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 6 }}>
          {orderValidation.message}
        </div>
        <div style={{ fontSize: 11, color: "#6B7280" }}>
          The ALEM09 form is hidden. Please check the article number or load the correct order.
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 6, letterSpacing: "-0.5px" }}>New Warranty Claim</h1>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 28 }}>Upload a product photo or enter an article number → confirm → fill ALEM09 form</p>

      {/* Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 28 }}>
        {[
          { icon: "🔢", step: "Step 1", text: "Enter order number " },
          { icon: "👤", step: "Step 2", text: "Customer details " },
          { icon: "📷", step: "Step 3", text: "Upload photo OR enter article number" },
          { icon: "🔍", step: "Step 4", text: "Product identified — confirm selection" },
          { icon: "📋", step: "Step 5", text: "Fill tabs & submit claim" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND, marginBottom: 2 }}>{s.step}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{s.text}</div>
          </div>
        ))}
      </div>

      {/* Order number */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>🔢</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Order Number (Ordernummer)</div>
          {orderLoaded && (
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#ECFDF5", color: "#065F46", fontWeight: 700 }}>
              ✓ Order loaded — {orderItems.length} products
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: orderLoaded ? 20 : 0 }}>
          <input value={orderNumber} onChange={e => { setOrderNumber(e.target.value); setOrderError(""); setOrderLoaded(false); setOrderValidation(null); }}
            onKeyDown={e => e.key === "Enter" && loadOrder()} placeholder="Enter order number (ordobjekt)..."
            style={{ flex: 1, padding: "10px 14px", border: `1px solid ${orderError ? "#FECACA" : "#E5E7EB"}`, borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", background: "#F9FAFB", fontFamily: "monospace" }} />
          <button onClick={loadOrder} disabled={orderLoading || !orderNumber.trim()} style={{ padding: "10px 24px", borderRadius: 8, border: "none",
            background: orderNumber.trim() ? BRAND : "#E5E7EB", color: orderNumber.trim() ? "#fff" : "#9CA3AF",
            fontSize: 13, fontWeight: 700, cursor: orderNumber.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {orderLoading ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Loading...</> : "🔍 Load Order"}
          </button>
        </div>
        {orderError && <div style={{ padding: "9px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginTop: 10 }}>⚠ {orderError}</div>}
        {orderLoaded && orderAutoFill && (
          <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>👤</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Customer Details</div>
              <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#E8F7FC", color: BRAND, fontWeight: 600 }}></span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <InputField label="Customer Name"    value={customer.Customer_name}    readOnly />
              <InputField label="Customer Phone"   value={customer.Customer_phone}   readOnly />
              <InputField label="Customer Address" value={customer.Customer_Address} readOnly />
            </div>
          </div>
        )}
        {!orderLoaded && !orderLoading && (
          <div style={{ marginTop: 14, borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>Or enter customer details manually:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <InputField label="Customer Name"    value={customer.Customer_name}    onChange={v => setC("Customer_name", v)}    placeholder="Full name or company" />
              <InputField label="Customer Phone"   value={customer.Customer_phone}   onChange={v => setC("Customer_phone", v)}   placeholder="+46 70 123 4567" type="tel" />
              <InputField label="Customer Address" value={customer.Customer_Address} onChange={v => setC("Customer_Address", v)} placeholder="Street, City, Postcode" />
            </div>
          </div>
        )}
      </div>

      {/* Product Identification — toggle */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: 24, marginBottom: 24 }}>
        {/* Toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB", width: "fit-content" }}>
          {[
            { key: "photo",  label: "📷 Photo Upload" },
            { key: "manual", label: "🔢 Manual Article No" },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setIdentifyMode(tab.key); setMatches([]); setMethod(null); setSelected(null); setConfirmed(null); setError(null); setManualError(""); setOrderValidation(null); }}
              style={{ padding: "10px 22px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                background: identifyMode === tab.key ? BRAND : "#F9FAFB",
                color: identifyMode === tab.key ? "#fff" : "#6B7280" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photo mode */}
        {identifyMode === "photo" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Product Image</div>
              {orderLoaded && orderItems.length > 0 && (
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#FFFBEB", color: "#92400E", border: "1px solid #FCD34D", fontWeight: 600 }}>
                  🎯 AI filtered to {orderItems.length} order products only
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
                onClick={() => !preview && fileRef.current?.click()}
                style={{ width: 220, minHeight: 180, borderRadius: 12, flexShrink: 0,
                  border: `2px dashed ${drag ? BRAND : preview ? "#93C5FD" : "#D1D5DB"}`,
                  background: drag ? "#E8F7FC" : "#F9FAFB", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", cursor: preview ? "default" : "pointer",
                  overflow: "hidden", position: "relative", transition: "all 0.2s" }}>
                {preview ? (
                  <div style={{ width: "100%", position: "relative" }}>
                    <img src={preview} alt="upload" style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block" }} />
                    <button onClick={e => { e.stopPropagation(); reset(); }} style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", fontSize: 13 }}>✕</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Drop image here</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>or click to browse</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => pickFile(e.target.files[0])} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 16, lineHeight: 1.6 }}>
                  <strong>Barcode detected?</strong> → Product identified instantly.<br />
                  <strong>No barcode?</strong> → Top 5 AI matches shown.
                </div>
                {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>}
                {matches.length > 0 && !error && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: isBarcode ? "#ECFDF5" : "#E8F7FC", border: `1px solid ${isBarcode ? "#6EE7B7" : "#a8dff5"}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isBarcode ? "#065F46" : BRAND }}>
                      {isBarcode ? "🎯 Barcode detected — exact product found!" : `🤖 AI found ${matches.length} similar products`}
                    </div>
                  </div>
                )}
                <button onClick={identifyByPhoto} disabled={!file || loading} style={{ padding: "12px 28px", borderRadius: 10, border: "none",
                  background: file && !loading ? BRAND : "#E5E7EB", color: file && !loading ? "#FFFFFF" : "#9CA3AF",
                  fontSize: 14, fontWeight: 700, cursor: file && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8 }}>
                  {loading ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Identifying...</> : "🔍 Identify Product"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Manual article number mode */}
        {identifyMode === "manual" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Enter Article Number (E-nummer / Item No)
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 1.6 }}>
            
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <input value={manualArtnr} onChange={e => { setManualArtnr(e.target.value); setManualError(""); setOrderValidation(null); }}
                onKeyDown={e => e.key === "Enter" && identifyByArtnr()} placeholder="e.g. 7320241, EAN, or item no..."
                style={{ flex: 1, padding: "11px 16px", border: `1px solid ${manualError ? "#FECACA" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, color: "#111827", outline: "none", background: "#F9FAFB", fontFamily: "monospace" }} />
              <button onClick={identifyByArtnr} disabled={!manualArtnr.trim() || manualLoading}
                style={{ padding: "11px 28px", borderRadius: 10, border: "none",
                  background: manualArtnr.trim() ? BRAND : "#E5E7EB", color: manualArtnr.trim() ? "#fff" : "#9CA3AF",
                  fontSize: 14, fontWeight: 700, cursor: manualArtnr.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {manualLoading ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Looking up...</> : "🔍 Look Up Product"}
              </button>
            </div>
            {manualError && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13 }}>⚠ {manualError}</div>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ width: 36, height: 36, border: `3px solid #E8F7FC`, borderTopColor: BRAND, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: BRAND }}>Scanning image...</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Checking barcode first, then AI visual search</div>
        </div>
      )}

      {/* ── SUGGESTION 1: Validation banner shown above results ── */}
      <ValidationBanner />

      {/* Barcode result */}
      {isBarcode && confirmed && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", background: "#ECFDF5" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>🎯 Barcode — Exact Match</span>
            </div>
            <ProductImageArea product={confirmed} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: BRAND, marginBottom: 4 }}>{confirmed.item_no}</div>
              <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>{confirmed.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{confirmed.brand}</div>
            </div>
          </div>
          <TabbedForm product={confirmed} customerDetails={customer} session={session} orderAutoFill={orderAutoFill} orderFaktnrMap={orderFaktnrMap} orderQuantityMap={orderQuantityMap}
            onSubmitted={(claimId, status, productName, artnr) => { setClaimResult({ claimId, status, productName, artnr }); setSubmitted(true); }} />
        </div>
      )}

      {/* Manual result */}
      {isManual && confirmed && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6",
              background: confirmed.source === "db" ? "#FFFBEB" : "#F0FDF4" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: confirmed.source === "db" ? "#92400E" : "#065F46" }}>
                {confirmed.source === "db" ? "🗄️ DB Match — No catalogue data" : "🔢 Manual — Article No Match"}
              </span>
            </div>
            {/* FIX 4: hide image for DB-only items */}
            {confirmed.source !== "db" && <ProductImageArea product={confirmed} />}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: BRAND, marginBottom: 4 }}>{confirmed.item_no}</div>
              {confirmed.source !== "db" && <>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>{confirmed.title || "—"}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>{confirmed.brand || "—"}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>EAN: {confirmed.ean || "—"}</div>
              </>}
              {confirmed.source === "db" && (
                <div style={{ fontSize: 12, color: "#92400E", marginTop: 4, lineHeight: 1.6 }}>
                  Item exists in database.<br />
                  Please fill in fault details in the form.
                </div>
              )}
            </div>
          </div>
          <TabbedForm product={confirmed} customerDetails={customer} session={session} orderAutoFill={orderAutoFill} orderFaktnrMap={orderFaktnrMap} orderQuantityMap={orderQuantityMap}
            onSubmitted={(claimId, status, productName, artnr) => { setClaimResult({ claimId, status, productName, artnr }); setSubmitted(true); }} />
        </div>
      )}

      {/* AI visual results */}
      {isAI && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            🤖 Top {matches.length} AI Matches — Click the correct product
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 14 }}>
            {matches.map(p => (
              <ProductCard key={p.item_no} product={p} selected={selected?.item_no === p.item_no}
                onClick={handleSelectProduct} />
            ))}
          </div>

          {/* Fix 2: Reminder message after top 5 list */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 16px", borderRadius: 10, marginBottom: 20,
            background: "#FFFBEB", border: "1px solid #FCD34D",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>
                Please verify the article number
              </div>
              <div style={{ fontSize: 12, color: "#78350F", lineHeight: 1.5 }}>
                Make sure the selected product's article number is listed under order{" "}
                <strong style={{ fontFamily: "monospace" }}>
                  {orderLoaded ? `#${orderNumber}` : "number"}
                </strong>{" "}
                before confirming.
              </div>
            </div>
          </div>
          {selected && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>🤖 AI Match — {selected.item_no}</span>
                </div>
                <ProductImageArea product={selected} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: BRAND, marginBottom: 4 }}>{selected.item_no}</div>
                  <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>{selected.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>{selected.brand}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>EAN: {selected.ean || "—"}</div>
                  <ConfBadge value={selected.similarity} />
                  {confirmed?.item_no !== selected.item_no && (
                    orderValidation && !orderValidation.valid ? (
                      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8,
                        background: "#FEF2F2", border: "1px solid #FECACA",
                        fontSize: 12, fontWeight: 600, color: "#991B1B", textAlign: "center" }}>
                        ❌ Cannot confirm — not in order
                      </div>
                    ) : (
                      <button onClick={() => handleConfirmProduct(selected)} style={{ width: "100%", marginTop: 14, padding: "11px", borderRadius: 10, border: "none", background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Confirm This Product</button>
                    )
                  )}
                  {confirmed?.item_no === selected.item_no && (
                    <div style={{ marginTop: 12, padding: 10, borderRadius: 8, textAlign: "center", background: "#ECFDF5", border: "1px solid #6EE7B7", fontSize: 12, fontWeight: 600, color: "#065F46" }}>✓ Confirmed! Fill the form →</div>
                  )}
                </div>
              </div>
              <div>
                {confirmed
                  ? <TabbedForm product={confirmed} customerDetails={customer} session={session} orderAutoFill={orderAutoFill} orderFaktnrMap={orderFaktnrMap} orderQuantityMap={orderQuantityMap}
                      onSubmitted={(claimId, status, productName, artnr) => { setClaimResult({ claimId, status, productName, artnr }); setSubmitted(true); }} />
                  : <div style={{ borderRadius: 14, border: "2px dashed #E5E7EB", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, textAlign: "center", padding: 24 }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                      <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Click "Confirm This Product"</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>to open the ALEM09 warranty form</div>
                    </div>
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}