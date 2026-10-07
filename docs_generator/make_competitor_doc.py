import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_header_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    if level == 1:
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(18)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
    elif level == 2:
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
    elif level == 3:
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(2)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    return h

def add_callout(doc, text, title="KEY STRATEGIC INSIGHT"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F7FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border only (accent line)
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="2B6CB0"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"[{title}]\n")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
    
    r_text = p.add_run(text)
    r_text.font.name = "Calibri"
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_competitor_doc(filepath):
    doc = Document()
    
    # Page setup
    for sec in doc.sections:
        sec.top_margin = Inches(1)
        sec.bottom_margin = Inches(1)
        sec.left_margin = Inches(1)
        sec.right_margin = Inches(1)
        
    # Title Page / Header Block
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(24)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("COMPETITOR RESEARCH & BUSINESS ANALYSIS")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Strategic Benchmarking, Unit Economics, Operational Bottlenecks, and Differentiation for GourmetFleet")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(0x71, 0x80, 0x96)
    
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(24)
    r_meta = p_meta.add_run("Author: Principal Product Architect & E-Commerce Lead  |  Platform: GourmetFleet Marketplace  |  Date: September 2026")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(9.5)
    r_meta.font.color.rgb = RGBColor(0xA0, 0xAE, 0xC0)
    
    add_header_styled(doc, "1. Executive Summary & Market Landscape", 1)
    doc.add_paragraph(
        "The online food delivery and restaurant reservation ecosystem has undergone massive consolidation, transitioning "
        "from pure hyper-growth customer acquisition to strict margin defense and monetisation. Incumbent market leaders such as "
        "Zomato and Swiggy in India, alongside global platforms like DoorDash, Uber Eats, and OpenTable, dominate customer attention. "
        "However, independent restaurateurs face unprecedented economic strain due to high take rates (18% - 32%), non-transparent "
        "platform fees, arbitrary ad bidding algorithms, and complete disintermediation from their own customer relationships."
    )
    doc.add_paragraph(
        "Simultaneously, consumers suffer from 'fee fatigue'—confronting unannounced platform fees, packaging surcharges, "
        "surge delivery charges, and inflated menu pricing (up to 30% higher than in-restaurant rates). GourmetFleet is conceptualized "
        "as a hybrid marketplace that unifies online food delivery, takeout, and real-time dining table reservations under an ethical, "
        "transparent commission framework coupled with an autonomous Owner AI operational copilot."
    )
    
    add_callout(doc, 
        "Key Market Fact: According to the National Restaurant Association and recent market filings (2024-2026), restaurant net profit margins "
        "consistently hover between 6% and 12%. When third-party platforms extract 22% to 28% in commissions, the restaurant loses money "
        "on every delivered order unless menu prices are inflated or portion sizes reduced.",
        "INDUSTRY ECONOMIC REALITY"
    )
    
    add_header_styled(doc, "2. Comprehensive Competitor Analysis", 1)
    doc.add_paragraph(
        "To design an enterprise-grade platform, we analyzed four primary market archetypes: Duopoly Delivery Giants (Zomato & Swiggy), "
        "Reservation Pioneers (OpenTable & Resy), Direct Restaurant Tech (Toast & SevenRooms), and Hybrid Delivery Platforms (DoorDash)."
    )
    
    # Competitor Comparison Table
    table = doc.add_table(rows=1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    headers = ["Platform", "Core Focus", "Take Rate / Fee Model", "Customer Discovery", "Reservation Tech", "Pain Points / Flaws"]
    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = h_text
        set_cell_background(hdr_cells[i], "1A365D")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.runs[0].font.name = "Calibri"
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(9)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    comp_data = [
        ("Zomato", "Hyperlocal Delivery, Gold Dining, Hyperpure", "18% - 28% per order + Ad fees + ₹6-₹10 platform fee", "Algorithmic search heavily biased toward ad-spend", "Zomato Dining / Bookings (Basic slot booking)", "High commission, predatory ad pressure, delivery rider unrest, customer data masking"),
        ("Swiggy", "Food Delivery, Instamart Quick Commerce, Dineout", "18% - 26% per order + ₹5-₹9 platform fee", "Discovery feed optimized for ad slots & high-margin cloud kitchens", "Swiggy Dineout (Discount table offers)", "Discount dilution for fine dining, unannounced customer fees, high churn among mid-tier cafes"),
        ("OpenTable", "Table Reservations, Guest Experience", "$249-$449/mo flat SaaS + $1.00-$2.50 per seated diner via network", "Global reservation portal, international traveler reach", "Industry-leading floor plan & table assignment engine", "Zero delivery/takeaway logistics, high fee per seated guest, vulnerable to no-shows without prepayments"),
        ("Toast", "Integrated POS, Direct Online Ordering, Handhelds", "$69-$165/mo SaaS + 2.49% to 2.99% + 15¢ card processing", "Zero built-in marketplace discovery; restaurant must drive own traffic", "Basic table layout integration via POS hardware", "Hardware lock-in, zero external marketplace demand, complex setup for multi-brand cloud kitchens"),
        ("GourmetFleet (Proposed)", "Unified Delivery, Takeaway, Reservations & Owner AI", "Tiered 8% - 12% capped commission OR $89/mo Flat SaaS + 3%", "Organic discovery based on verified hygiene, reviews, and proximity", "Real-time atomic slot lock, deposit support, QR pass, zero no-show hold", "Requires building brand trust and initial density compared to incumbent gig-fleets")
    ]
    
    for row_idx, data in enumerate(comp_data):
        row = table.add_row()
        for col_idx, text in enumerate(data):
            c = row.cells[col_idx]
            c.text = text
            bg_color = "F7FAFC" if row_idx % 2 == 0 else "FFFFFF"
            if data[0].startswith("GourmetFleet"):
                bg_color = "EBF8FF"
            set_cell_background(c, bg_color)
            set_cell_margins(c, top=80, bottom=80, left=80, right=80)
            p = c.paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.name = "Calibri"
                p.runs[0].font.size = Pt(8.5)
                if data[0].startswith("GourmetFleet"):
                    p.runs[0].font.bold = True
                    p.runs[0].font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
                else:
                    p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    
    add_header_styled(doc, "3. Small Restaurant Unit Economics & Fee Breakdown", 1)
    doc.add_paragraph(
        "A critical flaw of incumbent aggregators is the extraction of unsustainable margins from small and medium food enterprises (SMEs). "
        "Below is a validated unit economic comparison on an average order value (AOV) of ₹600 ($7.20 USD equivalent):"
    )
    
    # Unit Economics Table
    eco_table = doc.add_table(rows=1, cols=4)
    eco_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    eco_headers = ["Financial Metric / Line Item", "Incumbent Aggregator (24% Comm.)", "GourmetFleet Model (9% Comm.)", "Variance / Restaurant Benefit"]
    for i, h_text in enumerate(eco_headers):
        c = eco_table.rows[0].cells[i]
        c.text = h_text
        set_cell_background(c, "2B6CB0")
        set_cell_margins(c, top=100, bottom=100, left=100, right=100)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(9)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    eco_rows = [
        ("Gross Food Subtotal", "₹600.00", "₹600.00", "Standard AOV baseline"),
        ("Food Cost (COGS @ 32%)", "-₹192.00", "-₹192.00", "Ingredients & raw materials"),
        ("Packaging & Eco-Containers", "-₹30.00", "-₹30.00", "Quality tamper-proof boxes"),
        ("Platform Commission", "-₹144.00 (24%)", "-₹54.00 (9%)", "+₹90.00 retained margin (+15%)"),
        ("Payment Processing & Gateway", "-₹12.00 (2%)", "-₹12.00 (2%)", "Standard payment gateway fee"),
        ("Mandatory Ad Surcharge (Est.)", "-₹36.00 (6%)", "₹0.00 (Organic Ranking)", "+₹36.00 retained margin"),
        ("Staff Prep & Kitchen Overhead (22%)", "-₹132.00", "-₹132.00", "Cook labor and utility cost"),
        ("Net Restaurant Profit Per Order", "₹54.00 (9.0% margin)", "₹180.00 (30.0% margin)", "+₹126.00 (+233% Net Profit)"),
        ("Customer Visibility of Fees", "Hidden in price or surge", "Itemized breakdown shown upfront", "Eliminates surprise cart abandonment")
    ]
    
    for r_idx, (m_item, inc_val, gf_val, var_val) in enumerate(eco_rows):
        row = eco_table.add_row()
        cells = row.cells
        cells[0].text = m_item
        cells[1].text = inc_val
        cells[2].text = gf_val
        cells[3].text = var_val
        bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
        if "Net Restaurant Profit" in m_item:
            bg = "C6F6D5"
        for ci in range(4):
            set_cell_background(cells[ci], bg)
            set_cell_margins(cells[ci], top=70, bottom=70, left=80, right=80)
            p = cells[ci].paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8.5)
            if "Net Restaurant Profit" in m_item:
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(0x22, 0x54, 0x3D)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    
    add_header_styled(doc, "4. SWOT Analysis for GourmetFleet Marketplace", 1)
    
    swot_table = doc.add_table(rows=2, cols=2)
    swot_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Strengths
    c_s = swot_table.cell(0, 0)
    set_cell_background(c_s, "EDF2F7")
    set_cell_margins(c_s, 120, 120, 120, 120)
    ps = c_s.paragraphs[0]
    ps.add_run("STRENGTHS (Internal)\n").bold = True
    ps.runs[0].font.color.rgb = RGBColor(0x27, 0x67, 0x49)
    ps.add_run(
        "• Unified Delivery + Reservation database eliminates dual-software costs.\n"
        "• Fair, transparent 8-12% commission structure earns restaurant loyalty.\n"
        "• Built-in Owner AI Copilot provides proactive yield management without extra data scientists.\n"
        "• Atomic table concurrency engine prevents no-shows and double bookings.\n"
        "• Zero fabricated ETAs or deceptive phantom tracking: truthful delivery logistics."
    )
    
    # Weaknesses
    c_w = swot_table.cell(0, 1)
    set_cell_background(c_w, "FFF5F5")
    set_cell_margins(c_w, 120, 120, 120, 120)
    pw = c_w.paragraphs[0]
    pw.add_run("WEAKNESSES (Internal)\n").bold = True
    pw.runs[0].font.color.rgb = RGBColor(0x9B, 0x2C, 0x2C)
    pw.add_run(
        "• Cold-start delivery fleet logistics compared to incumbents' millions of gig riders.\n"
        "• Requires localized merchant onboarding density before network effects take off.\n"
        "• Higher initial consumer education needed to communicate honest fee breakdowns."
    )
    
    # Opportunities
    c_o = swot_table.cell(1, 0)
    set_cell_background(c_o, "EBF8FF")
    set_cell_margins(c_o, 120, 120, 120, 120)
    po = c_o.paragraphs[0]
    po.add_run("OPPORTUNITIES (External)\n").bold = True
    po.runs[0].font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
    po.add_run(
        "• Anti-monopoly sentiment among restaurateurs seeking independent channels.\n"
        "• Growing consumer resistance against inflated menu prices and surprise fees.\n"
        "• Unified dining rewards (loyalty points earned dining out can be redeemed on delivery orders).\n"
        "• Expansion into B2B catering and curated culinary experiences."
    )
    
    # Threats
    c_t = swot_table.cell(1, 1)
    set_cell_background(c_t, "FEFCBF")
    set_cell_margins(c_t, 120, 120, 120, 120)
    pt = c_t.paragraphs[0]
    pt.add_run("THREATS (External)\n").bold = True
    pt.runs[0].font.color.rgb = RGBColor(0x74, 0x42, 0x10)
    pt.add_run(
        "• Incumbents engaging in predatory discounting or deep-pocket loyalty subsidies.\n"
        "• Regulatory changes regarding gig-worker social security and minimum wage.\n"
        "• High restaurant employee turnover creating training gaps for tablet interfaces."
    )
    
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    add_header_styled(doc, "5. Enterprise Risk Register & Mitigation Strategy", 1)
    
    risk_table = doc.add_table(rows=1, cols=5)
    risk_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    r_hdrs = ["Risk ID", "Risk Description", "Likelihood / Impact", "Core Vulnerability", "Engineering & Operational Mitigation"]
    for i, h_text in enumerate(r_hdrs):
        c = risk_table.rows[0].cells[i]
        c.text = h_text
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 100, 100)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    risks = [
        ("RSK-01", "Reservation Double Booking Race Condition", "High / High", "Two users booking Table 4 simultaneously at 8:00 PM", "Server-side atomic MongoDB findOneAndUpdate with status lock and reservation slot index check."),
        ("RSK-02", "Price Tampering via Client Payload", "Medium / Critical", "Malicious user editing cart total in client POST payload", "Strict server-side price recalculation against database snapshot; client payload totals ignored."),
        ("RSK-03", "Payment Webhook Replay Attacks", "Medium / High", "Attacker replaying successful payment webhook to get free food", "Idempotency keys stored in Redis/DB with unique transaction signature verification."),
        ("RSK-04", "No-Shows on Peak Dining Slots", "High / Medium", "Users booking tables and failing to show up, wasting table capacity", "Configurable per-seat reservation deposit, 15-minute grace window, and automated WhatsApp/SMS reminders."),
        ("RSK-05", "Multi-Tenant Data Leakage in AI Copilot", "Low / Critical", "AI prompt injection prompting bot to reveal competitor restaurant sales", "Strict SQL/NoSQL query scoping parameterized by authenticated restaurantId; role verification before tool call execution."),
        ("RSK-06", "Food Waste from Stale Menu Items", "High / Medium", "Kitchen running out of fresh seafood leading to delayed cancellations", "Instant 1-click 'Out of Stock' toggle in Owner Dashboard with real-time Socket.IO cart item invalidation.")
    ]
    
    for r_idx, r_data in enumerate(risks):
        row = risk_table.add_row()
        for ci, txt in enumerate(r_data):
            cell = row.cells[ci]
            cell.text = txt
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, 70, 70, 70, 70)
            p = cell.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    add_header_styled(doc, "6. Proposed Differentiation Strategy & Product Pillars", 1)
    doc.add_paragraph(
        "GourmetFleet positions itself not merely as another transactional delivery app, but as the premier Hospitality Operating System "
        "and Ethical Marketplace. Our strategy is built upon five foundational pillars:"
    )
    
    pillars = [
        ("1. The Unified Hospitality Loop: ", "Unlike Zomato or Swiggy where reservations are an afterthought, and unlike OpenTable which has no delivery, GourmetFleet bridges the dining room and the living room. Diners earn unified loyalty points whether they book a romantic anniversary dinner or order takeout on a busy Tuesday."),
        ("2. Radical Pricing Transparency: ", "Every fee line item is disclosed upfront: Base Food Subtotal, Packaging Fee (explicitly cost-matched), Delivery Fee (distance-calculated), Platform Fee (transparently capped at ₹15), and GST. No stealth markups."),
        ("3. Modular Restaurant Operational Modes: ", "Full architectural support for: (a) Delivery-Only Cloud Kitchens, (b) Fine Dining / Table Reservation-Only Bistros, and (c) Hybrid Full-Service Restaurants."),
        ("4. Autonomous Owner AI Copilot: ", "Every restaurant owner receives an executive AI business assistant that analyzes real, localized sales data, predicts peak table demand, flags low-margin recipes, and crafts targeted promotional campaigns with explicit human-in-the-loop confirmation."),
        ("5. Privacy & Regulatory Rigor: ", "Engineered in strict compliance with the Digital Personal Data Protection Act (DPDP Act 2023), FSSAI food hygiene standards, and Consumer Protection E-Commerce Rules.")
    ]
    
    for title, desc in pillars:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r1 = p.add_run(title)
        r1.bold = True
        r1.font.name = "Calibri"
        r1.font.size = Pt(10)
        r1.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
        r2 = p.add_run(desc)
        r2.font.name = "Calibri"
        r2.font.size = Pt(10)
        r2.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
        
    doc.save(filepath)
    print(f"Successfully generated {filepath}")

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "Competitor_Research_and_Business_Analysis.docx"
    build_competitor_doc(target)
