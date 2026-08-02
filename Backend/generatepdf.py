

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io

W, H = A4  # 595.27 x 841.89 points  (210 x 297 mm)


def generate_alem09_pdf(data: dict) -> bytes:
    buf = io.BytesIO()
    c   = canvas.Canvas(buf, pagesize=A4)

    # ── Drawing helpers ───────────────────────────────────────────
    def y(mm_from_top):
        return H - mm_from_top * 2.83465

    def x(mm_from_left):
        return mm_from_left * 2.83465

    def pt(mm):
        return mm * 2.83465

    def draw_rect(lx, ty, w, h, fill_rgb=None, stroke=True):
        c.setLineWidth(0.5)
        if fill_rgb:
            c.setFillColorRGB(*fill_rgb)
            c.rect(x(lx), y(ty+h), pt(w), pt(h), fill=1, stroke=1 if stroke else 0)
        else:
            c.setStrokeColorRGB(0.5, 0.5, 0.5)
            c.rect(x(lx), y(ty+h), pt(w), pt(h), fill=0, stroke=1)

    def draw_line(x1, y1, x2, y2, width=0.4, gray=0.6):
        c.setLineWidth(width)
        c.setStrokeColorRGB(gray, gray, gray)
        c.line(x(x1), y(y1), x(x2), y(y2))

    def label_text(lx, ty, txt, size=6.5):
        c.setFillColorRGB(0.45, 0.45, 0.45)
        c.setFont("Helvetica", size)
        c.drawString(x(lx), y(ty), txt)

    def value_text(lx, ty, val, size=8.5, bold=False):
        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawString(x(lx), y(ty), str(val) if val is not None else "")

    def section_header(lx, ty, w, h, title):
        draw_rect(lx, ty, w, h, fill_rgb=(0.15, 0.15, 0.15))
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x(lx+2), y(ty + h/2 + 1.5), title)

    def checkbox(lx, ty, checked, size=3.4):
        c.setLineWidth(0.5)
        c.setStrokeColorRGB(0.3, 0.3, 0.3)
        c.rect(x(lx), y(ty+size), pt(size), pt(size), fill=0, stroke=1)
        if checked:
            c.setFillColorRGB(0.05, 0.35, 0.65)
            c.rect(x(lx+0.4), y(ty+size-0.4), pt(size-0.8), pt(size-0.8), fill=1, stroke=0)

    def wrap_text(lx, ty, txt, max_width_mm, size=8.5, line_height=5.5, max_lines=3):
        if not txt:
            return
        c.setFont("Helvetica", size)
        c.setFillColorRGB(0, 0, 0)
        words = str(txt).split()
        current_line, lines = "", []
        for word in words:
            test = (current_line + " " + word).strip()
            if c.stringWidth(test, "Helvetica", size) <= pt(max_width_mm):
                current_line = test
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
        for i, ln in enumerate(lines[:max_lines]):
            c.drawString(x(lx), y(ty + i * line_height), ln)

    # ═══════════════════════════════════════════════════════════════
    # HEADER
    # ═══════════════════════════════════════════════════════════════
    # Left logo band
    draw_rect(10, 8, 30, 10, fill_rgb=(0.08, 0.30, 0.58))
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x(12), y(16), "SEG / EIO")
    c.setFillColorRGB(0.35, 0.35, 0.35)
    c.setFont("Helvetica-Oblique", 6.5)
    c.drawString(x(10), y(22), "E.L. Elmateriel Leverantörernas förening")

    # Green banner
    draw_rect(10, 23, 45, 5, fill_rgb=(0.08, 0.48, 0.18))
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(x(12), y(27.2), "BELYSNINGSBRANSCHEN")

    # Title block
    draw_rect(100, 8, 100, 20, fill_rgb=(0.94, 0.94, 0.94))
    c.setFillColorRGB(0.08, 0.08, 0.08)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(x(103), y(17), "COMPLAINT FORM")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x(103), y(23), "For ALEM 09")
    c.setFont("Helvetica", 7.5)
    c.setFillColorRGB(0.45, 0.45, 0.45)
    c.drawString(x(103), y(27.5), "(not intended for transport damage)")

    # ═══════════════════════════════════════════════════════════════
    # SECTION 1 — GENERAL INFORMATION
    # ═══════════════════════════════════════════════════════════════
    r = 31
    section_header(10, r, 190, 6, "General Information  —  Allmänna uppgifter")

    # Buyer | Contact Person
    r += 6
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3.5, "Buyer  (Köpare)")
    value_text(11, r+7, data.get("BuyerName",""))
    label_text(101, r+3.5, "Contact Person  (Kontaktperson)")
    value_text(101, r+7, data.get("BuyerContactPerson",""))

    # Buyer Phone | Email
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3.5, "Phone  (Telefon)")
    value_text(11, r+7, data.get("BuyerPhone",""))
    label_text(101, r+3.5, "Email  (E-post)")
    value_text(101, r+7, data.get("BuyerEmail",""))

    # Seller | Contact Person
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3.5, "Seller  (Säljare)")
    value_text(11, r+7, data.get("Seller_name",""))
    label_text(101, r+3.5, "Contact Person  (Kontaktperson)")
    value_text(101, r+7, data.get("Seller_contact",""))

    # Seller Phone | Email
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3.5, "Phone  (Telefon)")
    value_text(11, r+7, data.get("Seller_phone",""))
    label_text(101, r+3.5, "Email  (E-post)")
    value_text(101, r+7, data.get("Seller_mail",""))

    # 5-column dates row
    r += 8
    draw_rect(10, r, 190, 9)
    cols = [
        (10, 38, "Complaint Date",    "Complaint_date"),
        (48, 38, "Order Date",        "Odatum"),
        (86, 38, "Invoice No",        "Faktnr"),
        (124,38, "Delivery Date",     "Levdat"),
        (162,38, "Commissioning Date","Comm_date"),
    ]
    for i, (lx, cw, lbl, key) in enumerate(cols):
        if i > 0:
            draw_line(lx, r, lx, r+9)
        label_text(lx+1, r+3.5, lbl, size=6)
        value_text(lx+1, r+8.5, data.get(key,""), size=8)

    # ═══════════════════════════════════════════════════════════════
    # SECTION 2 — BUYER'S AGREEMENT
    # ═══════════════════════════════════════════════════════════════
    r += 9
    section_header(10, r, 190, 6, "Buyer's Agreement with Contractor  —  Köparens avtal med beställaren")

    # Contract type checkboxes
    r += 6
    draw_rect(10, r, 190, 8)
    contracts = [
        (12,  "AB 04 / AB-U 07",   bool(data.get("AB04",0))),
        (51,  "ABT 06 / ABT-U 07", bool(data.get("ABT06",0))),
        (92,  "EL 10",             bool(data.get("EL10",0))),
        
    ]
    for lx, lbl, chk in contracts:
        checkbox(lx, r+2.5, chk)
        value_text(lx+5, r+6.5, lbl, size=7.5)

    # Contract enclosed + warranty months
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "Contract Enclosed")
    enclosed = bool(data.get("ContractAttached",0))
    checkbox(11, r+4.5, enclosed);       value_text(16, r+7.5, "Yes", size=7.5)
    checkbox(27, r+4.5, not enclosed);   value_text(32, r+7.5, "No",  size=7.5)
    label_text(53, r+3, "Other, specify  (Annat, vilket):")
    value_text(55, r+7.5, data.get("Agreement_OtherText",""), size=7.5)
    label_text(101, r+3, "Buyer's Warranty Months  (Garantitid, antal månader)")
    wm = data.get("BuyerWarrantyMonths","")
    value_text(101, r+7.5, str(wm) if wm else "", size=11, bold=True)

    # End customer | Installation site
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "End Customer / Facility Owner  (Beställare/Anläggningsägare)")
    value_text(11, r+7, data.get("EndCustomerOrFacilityOwner",""))
    label_text(101, r+3, "Installation Site  (Montageplats)")
    value_text(101, r+7, data.get("Install_site",""))

    # Investigation + product location
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "Investigation Report Requested?  (Önskas undersökningsrapport?)")
    inv = bool(data.get("InvestigationReportRequested",0))
    checkbox(11, r+4.5, inv);       value_text(16, r+7.5, "Yes", size=7.5)
    checkbox(27, r+4.5, not inv);   value_text(32, r+7.5, "No",  size=7.5)
    label_text(101, r+3, "Current Product Location  (Var finns produkten idag?)")
    value_text(101, r+7, data.get("CurrentProductLocation",""))

    # Return delivery address
    r += 8
    draw_rect(10, r, 190, 8)
    label_text(11, r+3, "Return Address for Repaired / Replacement Product  (Leveransadress)")
    value_text(11, r+7, data.get("ReturnDeliveryAddress",""))

    # ═══════════════════════════════════════════════════════════════
    # SECTION 3 — CLAIMED PRODUCT
    # ═══════════════════════════════════════════════════════════════
    r += 8
    section_header(10, r, 190, 6, "Claimed Product  —  Reklamerad produkt")

    # Column headers
    r += 6
    draw_rect(10, r, 190, 7, fill_rgb=(0.91, 0.91, 0.91))
    prod_cols = [
        (10,  20, "Quantity  (Antal)"),
        (30,  65, "E-No / Article No / EAN "),
        (95,  55, "Serial Number  (Serienummer)"),
        (150, 50, "Type / Description  (Typbeteckning)"),
    ]
    for lx, cw, lbl in prod_cols:
        draw_line(lx, r, lx, r+7, width=0.4)
        c.setFillColorRGB(0.15, 0.15, 0.15)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(x(lx+1), y(r+4.5), lbl)

    # Data row
    r += 7
    draw_rect(10, r, 190, 9)
    prod_vals = [
        (10,  data.get("Quantity","")),
        (30,  f"{data.get('Artnr','')}   {data.get('EAN','')}"),
        (95,  data.get("Serienum","")),
        (150, data.get("Type_designation","")),
    ]
    for lx, val in prod_vals:
        draw_line(lx, r, lx, r+9)
        value_text(lx+2, r+6.5, str(val) if val else "", size=8.5)

    # ═══════════════════════════════════════════════════════════════
    # SECTION 4 — FAULT DESCRIPTION
    # ═══════════════════════════════════════════════════════════════
    r += 9
    section_header(10, r, 190, 6, "Fault Description  —  Felbeskrivning")

    r += 6
    draw_rect(10, r, 190, 20)
    wrap_text(12, r+5.5, data.get("Descfault",""), max_width_mm=184,
              size=8.5, line_height=6, max_lines=3)

    # Additional info
    r += 20
    draw_rect(10, r, 190, 10)
    label_text(11, r+3, "Additional Information  (Övrig information)")
    add = data.get("Add_info","")
    value_text(11, r+8.5, str(add)[:130] if add else "", size=8)

    # ═══════════════════════════════════════════════════════════════
    # SECTION 5 — INSTALLATION & CONDITIONS
    # ═══════════════════════════════════════════════════════════════
    r += 10
    section_header(10, r, 190, 6, "Installation & Operating Conditions  —  Montage och driftförhållanden")

    # Environment row
    r += 6
    draw_rect(10, r, 190, 8)
    env = [
        (12,  "Indoors  (Inne)",    bool(data.get("InstalledIndoors",0))),
        (50,  "Outdoors  (Ute)",    bool(data.get("InstalledOutdoors",0))),
        (90,  "Humid  (Fuktigt)",   bool(data.get("HumidEnvironment",0))),
        (126, "Dry  (Torrt)",       bool(data.get("DryEnvironment",0))),
        (157, "Dusty  (Dammigt)",   bool(data.get("DustyEnvironment",0))),
    ]
    for lx, lbl, chk in env:
        checkbox(lx, r+2.5, chk)
        value_text(lx+5, r+6.5, lbl, size=7.5)

    # Heated / aggressive / temp / vibrations row
    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(95, r, 95, r+8)
    checkbox(12, r+2.5, bool(data.get("PermanentlyHeated",0)))
    value_text(17, r+6.5, "Permanently Heated ", size=7.5)
    checkbox(60, r+2.5, bool(data.get("AggressiveEnvironment",0)))
    value_text(65, r+6.5, "Aggressive Env.", size=7.5)
    label_text(96, r+3, "Ambient Temp Min/Max")
    value_text(96, r+7, data.get("AmbientTempMinMax",""), size=8.5)
    checkbox(165, r+2.5, bool(data.get("VibrationsPresent",0)))
    value_text(170, r+6.5, "Vibrations", size=7.5)

    # Compliance row
    r += 8
    draw_rect(10, r, 190, 9)
    draw_line(73, r, 73, r+9)
    draw_line(136, r, 136, r+9)
    for lx, lbl, key in [
        (10,  "Installed to standard?\n(Enligt gällande föreskrifter)",      "InstalledToStandard"),
        (74,  "Installed to instructions?\n(Enligt montageanvisning)",       "InstalledToInstructions"),
        (137, "Maintained to instructions?\n(Underhållits enligt anvisning)","MaintainedToInstructions"),
    ]:
        short_lbl = lbl.split("\n")[0]
        label_text(lx+1, r+3.5, short_lbl, size=6.5)
        val = bool(data.get(key,0))
        checkbox(lx+1, r+4.8, val);       value_text(lx+6,  r+8, "Yes", size=7.5)
        checkbox(lx+17, r+4.8, not val);  value_text(lx+22, r+8, "No",  size=7.5)

    # Circuit diagram + operation log
    r += 9
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "Circuit Diagram Available?  (Finns kretsschema?)")
    cd = str(data.get("CircuitDiagramStatus","No"))
    checkbox(11, r+4.5, cd=="Yes");      value_text(16, r+7.5, "Yes",      size=7.5)
    checkbox(26, r+4.5, cd=="Attached"); value_text(31, r+7.5, "Attached", size=7.5)
    checkbox(51, r+4.5, cd=="No");       value_text(56, r+7.5, "No",       size=7.5)
    label_text(101, r+3, "Operation Log Maintained?  (Har driftsjournal förts?)")
    ol = str(data.get("OperationLogStatus","No"))
    checkbox(101, r+4.5, ol=="Yes");      value_text(106, r+7.5, "Yes",      size=7.5)
    checkbox(116, r+4.5, ol=="Attached"); value_text(121, r+7.5, "Attached", size=7.5)
    checkbox(141, r+4.5, ol=="No");       value_text(146, r+7.5, "No",       size=7.5)

    # ═══════════════════════════════════════════════════════════════
    # SECTION 6 — FORM COMPLETED BY
    # ═══════════════════════════════════════════════════════════════
    r += 8
    section_header(10, r, 190, 6, "Form Completed By  —  Blanketten ifylld av")

    r += 6
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "Name  (Namn)")
    value_text(11, r+7, data.get("technician_name",""))
    label_text(101, r+3, "Company (if other than buyer)  (Företag)")
    value_text(101, r+7, data.get("company_name",""))

    r += 8
    draw_rect(10, r, 190, 8)
    draw_line(100, r, 100, r+8)
    label_text(11, r+3, "Phone  (Telefon)")
    value_text(11, r+7, data.get("phone_number",""))
    label_text(101, r+3, "Email  (E-post)")
    value_text(101, r+7, data.get("mail_id",""))

    # ═══════════════════════════════════════════════════════════════
    # CLAIM ID BANNER
    # ═══════════════════════════════════════════════════════════════
    r += 10
    draw_rect(10, r, 190, 8, fill_rgb=(0.88, 0.93, 1.0))
    status_colors = {"approved": (0.04,0.37,0.27), "rejected": (0.6,0.1,0.1), "pending": (0.57,0.25,0.05)}
    status_str = str(data.get("Claim_status","pending")).lower()
    sc = status_colors.get(status_str, (0.1,0.1,0.1))
    c.setFillColorRGB(*sc)
    c.setFont("Helvetica-Bold", 9)
    claim_line = (
        f"Claim ID: #{data.get('claimid','')}   |   "
        f"Status: {status_str.upper()}   |   "
        f"Date: {data.get('Created_at','') or data.get('Complaint_date','')}"
    )
    c.drawString(x(12), y(r+5), claim_line)

    # ── Footer ────────────────────────────────────────────────────
    c.setFillColorRGB(0.55, 0.55, 0.55)
    c.setFont("Helvetica", 6.5)
    c.drawString(x(10), y(293), "Warranty Complaint Form (English) — Generated by Warranty Management System")
    c.drawRightString(x(200), y(293), "ALEM 09 reklamationsblankett 2014.07")

    c.save()
    buf.seek(0)
    return buf.read()