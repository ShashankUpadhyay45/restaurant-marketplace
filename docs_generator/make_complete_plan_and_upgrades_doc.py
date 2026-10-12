import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
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

def set_table_borders(table, color="CBD5E0", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_header_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    if level == 1:
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)  # Deep Navy
    elif level == 2:
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)  # Steel Blue
    elif level == 3:
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(3)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)  # Slate
    return h

def add_callout_box(doc, title, text, bg_color="EDF2F7", border_color="2B6CB0"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r_t = p.add_run(f"📌 {title}\n")
    r_t.font.name = 'Calibri'
    r_t.font.size = Pt(10.5)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
    
    r_b = p.add_run(text)
    r_b.font.name = 'Calibri'
    r_b.font.size = Pt(9.5)
    r_b.font.color.rgb = RGBColor(0x4A, 0x55, 0x68)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_after = Pt(4)

def build_comprehensive_plan_and_upgrades_doc(output_path):
    doc = Document()
    
    # Page setup
    for sec in doc.sections:
        sec.top_margin = Inches(0.85)
        sec.bottom_margin = Inches(0.85)
        sec.left_margin = Inches(0.85)
        sec.right_margin = Inches(0.85)
        
        # Header / Footer
        footer = sec.footer
        p_ft = footer.paragraphs[0]
        p_ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_ft = p_ft.add_run("GourmetFleet Marketplace — Implementation Plan & Upgrades Roadmap | Confidential")
        r_ft.font.name = "Calibri"
        r_ft.font.size = Pt(8)
        r_ft.font.color.rgb = RGBColor(0xA0, 0xAE, 0xC0)

    # Document Header / Cover Banner
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(3)
    r_title = p_title.add_run("GOURMETFLEET MARKETPLACE")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(8)
    r_sub = p_sub.add_run("Complete End-to-End Implementation Plan, Architectural Blueprint & Future Upgrades Roadmap")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)

    # Document Metadata Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Document Version:", "2.0 (Post-Audit Enterprise Edition)"),
        ("System Classification:", "Multi-Role Restaurant Marketplace, Table Reservation & On-Demand Fleet Platform"),
        ("Current Scope:", "4 User Personas | 50 Production Screens | 5 Major Indian Hubs | 100 Verified Venues"),
        ("Document Purpose:", "Exhaustive Implementation Blueprint, System Capabilities & Production Upgrade Roadmap")
    ]
    for r_idx, (k, v) in enumerate(meta_data):
        c0 = meta_table.rows[r_idx].cells[0]
        c1 = meta_table.rows[r_idx].cells[1]
        c0.text = k
        c1.text = v
        set_cell_background(c0, "F7FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, 60, 60, 100, 100)
        set_cell_margins(c1, 60, 60, 100, 100)
        c0.paragraphs[0].runs[0].font.bold = True
        c0.paragraphs[0].runs[0].font.size = Pt(8.5)
        c0.paragraphs[0].runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
        c1.paragraphs[0].runs[0].font.size = Pt(8.5)
        c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(0x4A, 0x55, 0x68)
    set_table_borders(meta_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURAL FOUNDATION
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "1. Executive Summary & System Overview", 1)
    
    doc.add_paragraph(
        "GourmetFleet is a state-of-the-art multi-role restaurant marketplace, digital dining table reservation, and "
        "on-demand food delivery platform tailored specifically for the Indian culinary and food-tech ecosystem. The application "
        "bridges four tightly coupled stakeholder ecosystems—Diners/Customers, Restaurant Owners/Merchants, Delivery Fleet Partners, "
        "and Platform Superadministrators—delivering enterprise-grade operations with zero dead links, strict type safety, and real-time state synchronization."
    )
    
    add_callout_box(
        doc,
        "Core Architectural Achievement",
        "The application currently operates with a dual-execution layer: a fully responsive, 50-screen React/TypeScript single-page "
        "application equipped with offline mock database dispatchers, paired with a TypeScript/Express/MongoDB in-memory backend server. "
        "Every single UI component accesses domain resources through strongly typed service boundaries (authService, orderService, "
        "deliveryService, etc.), allowing seamless transition to production cloud microservices with zero UI refactoring.",
        bg_color="EBF8FF",
        border_color="3182CE"
    )

    doc.add_paragraph(
        "Key platform metrics currently implemented and operating in the workspace:"
    )
    
    kpi_table = doc.add_table(rows=1, cols=4)
    kpi_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    kpi_hdrs = ["Metric Category", "Current Value", "Implementation Scope", "Production Readiness"]
    for i, h in enumerate(kpi_hdrs):
        c = kpi_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    kpi_rows = [
        ("Screen Inventory", "50 Registered Pages", "18 Customer, 11 Owner, 6 Delivery, 13 Admin, 2 Auth/Shortcuts", "100% Routed & Tested"),
        ("Indian Geography", "5 Culinary Hubs", "Dehradun, Delhi NCR, Mumbai, Bengaluru, Jaipur", "Authentic Coordinates & Pincodes"),
        ("Catalog Scale", "100 Restaurants / 2,700 Items", "Detailed cuisines, dietary classifications, variants & addons", "Realistic INR Pricing & GST"),
        ("Build & Type Integrity", "Zero Compiler Errors", "Vite build in 12.45s; 29/29 Vitest server tests passing", "100% CI/CD Ready"),
        ("State Machine", "13 Order Lifecycle States", "PLACED through DELIVERED with cancellation & refund pending", "Strict Transition Validation")
    ]

    for r_idx, row_vals in enumerate(kpi_rows):
        row = kpi_table.add_row()
        for ci, val_text in enumerate(row_vals):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(kpi_table)

    # ─────────────────────────────────────────────────────────────
    # SECTION 2: COMPLETED IMPLEMENTATION MATRIX (WHAT IS BUILT)
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "2. Comprehensive Implementation Matrix (Current Baseline)", 1)
    
    doc.add_paragraph(
        "The project has successfully completed full implementation across all four primary persona ecosystems. "
        "The table below details every functional area, its route, component layout, and operational capabilities:"
    )

    ecosystem_table = doc.add_table(rows=1, cols=4)
    ecosystem_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    eco_hdrs = ["Persona Ecosystem", "Routes & Screen Count", "Key Components & Capabilities", "State & Persistence Mode"]
    for i, h in enumerate(eco_hdrs):
        c = ecosystem_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "2B6CB0")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    eco_rows = [
        ("Customer Marketplace", 
         "18 Screens\n(/, /restaurants, /restaurant/:id, /search, /offers, /specials, /events, /checkout, /orders, /orders/:id/track, /reservations, /loyalty, /favorites, /profile)",
         "• 3D Interactive Cloche Canvas (Three.js)\n"
         "• Dual Grid vs. SVG Radar Map View with delivery range rings\n"
         "• Debounced multi-entity search (Restaurants + Dishes)\n"
         "• Table booking with digital boarding pass & QR token\n"
         "• Itemized checkout with 5% Food GST, 18% Platform GST, packaging, delivery fees & tips\n"
         "• Live Bezier delivery radar tracking with 4-digit OTP card\n"
         "• Loyalty wallet tier progress & transaction ledger\n"
         "• Multi-factor reviews (Food, Delivery, Packaging, Overall)",
         "Zustand stores (cart, auth, location, toasts) + mockData in localStorage with REST fallback"),
        
        ("Restaurant Owner Operations Hub",
         "11 Screens\n(/owner/dashboard, /owner/orders, /owner/reservations, /owner/menu, /owner/promotions, /owner/events, /owner/delivery, /owner/reviews, /owner/analytics, /owner/ai-reports, /owner/application)",
         "• KPI Telemetry (Today's GMV, Orders, AOV, Table Occupancy)\n"
         "• 5-Column Kitchen Display System (KDS) Kanban board\n"
         "• Dynamic table seating roster (CONFIRMED, SEATED, COMPLETED)\n"
         "• Menu editor with instant Out-of-Stock toggles & category grouping\n"
         "• Promotional campaign voucher creation with minimum spend rules\n"
         "• Culinary masterclass & event booking roster\n"
         "• Delivery fleet dispatch desk with nearby rider assignment\n"
         "• Analytics charts (Day, Week, Month, Year timeframe selectors)\n"
         "• Owner AI Copilot business reports with operational insights\n"
         "• FSSAI license & KYC verification status viewer",
         "Wrapped in <OwnerLayout> with collapsible sidebar; syncs via RealtimeEventBus (socket.ts)"),

        ("Delivery Partner Fleet Hub",
         "6 Screens\n(/delivery/dashboard, /delivery/requests, /delivery/active, /delivery/earnings, /delivery/ratings, /delivery/profile)",
         "• Online/Offline toggle with real-time status pill\n"
         "• Nearby pickup requests radar with 2 km to 5 km auto-expansion\n"
         "• Estimated payout (INR) & delivery distance cards\n"
         "• 4-Step delivery execution stepper (To Restaurant -> Pickup -> To Customer -> Arrived)\n"
         "• Doorstep 4-digit OTP verification unlocking wallet credit\n"
         "• Detailed earnings analytics with tips & performance incentives\n"
         "• Rider performance scorecard & customer review breakdown\n"
         "• Rider profile with vehicle type, driving license & Aadhaar badges",
         "Wrapped in <DeliveryLayout> with top operations bar; socket notifications for instant job broadcasts"),

        ("Platform Superadmin HQ",
         "13 Screens\n(/admin/dashboard, /admin/restaurants, /admin/applications, /admin/users, /admin/orders, /admin/reservations, /admin/delivery, /admin/events, /admin/reviews, /admin/promotions, /admin/payments, /admin/reports, /admin/audit)",
         "• Platform-wide Executive KPI Telemetry & 5-month trend charts\n"
         "• 100+ Restaurant directory with commission rate controls & suspension toggles\n"
         "• Merchant KYC queue with document inspection (PAN, FSSAI, GSTIN, Cheque)\n"
         "• User & RBAC access governance workbench\n"
         "• Global real-time order stream with force cancellation & instant refunds\n"
         "• Nationwide reservation audit ledger\n"
         "• Delivery fleet disciplinary controls\n"
         "• Multi-factor review moderation & content filtering\n"
         "• Platform-wide promotional engine\n"
         "• Financial settlement workbench with Razorpay escrow placeholder\n"
         "• BI Reports generator with CSV export\n"
         "• Security & Audit trail logging every administrative intervention",
         "Wrapped in <AdminLayout> with dark-themed administration sidebar and metric headers")
    ]

    for r_idx, (persona, routes, comps, state_mode) in enumerate(eco_rows):
        row = ecosystem_table.add_row()
        for ci, val_text in enumerate([persona, routes, comps, state_mode]):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 80, 80, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(ecosystem_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 3: ORDER STATE MACHINE & CONCURRENCY SAFEGUARDS
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "3. Order Lifecycle State Machine & Business Rules", 1)
    
    doc.add_paragraph(
        "GourmetFleet implements a strict 13-state deterministic finite state machine governing order progression, "
        "enforcing business rules across the customer app, merchant KDS, and delivery fleet:"
    )

    sm_table = doc.add_table(rows=1, cols=4)
    sm_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sm_hdrs = ["Stage / Status Code", "Triggering Actor / Event", "Subsequent Transition", "Business & Financial Invariant"]
    for i, h in enumerate(sm_hdrs):
        c = sm_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    sm_rows = [
        ("PLACED", "Customer completes checkout", "CONFIRMED or REJECTED", "Inventory reserved; payment held in escrow; order broadcast to Merchant KDS"),
        ("CONFIRMED", "Restaurant manager clicks 'Accept'", "PREPARING", "Preparation timer starts; delivery request generated within 2km rider radius"),
        ("PREPARING", "Kitchen station begins cooking", "READY_FOR_PICKUP", "Items cannot be cancelled by customer without cancellation fee penalty"),
        ("READY_FOR_PICKUP", "Kitchen marks dish completed", "RIDER_ASSIGNED", "Packaging fee committed; KDS updates to ready column; rider pinged"),
        ("RIDER_ASSIGNED", "Nearby rider accepts delivery request", "PICKED_UP", "Rider identity, vehicle number, phone, and live ETA revealed to customer"),
        ("PICKED_UP", "Rider confirms package receipt", "OUT_FOR_DELIVERY", "Order custody transfers from restaurant to delivery fleet"),
        ("OUT_FOR_DELIVERY", "Rider departs restaurant", "ARRIVED_CUSTOMER", "Live radar map activates; 4-digit doorstep delivery OTP generated on customer app"),
        ("ARRIVED_CUSTOMER", "Rider reaches customer location", "DELIVERED or DELIVERY_FAILED", "Doorstep bell alert sent; 10-minute maximum waiting timer starts"),
        ("DELIVERED", "Rider submits verified 4-digit OTP", "COMPLETED (Terminal)", "Escrow funds released; delivery fee credited to rider wallet; loyalty coins awarded"),
        ("CANCELLED", "Customer or merchant cancels before prep", "REFUND_PENDING / REFUNDED", "Full payment reversed; loyalty coins forfeited; rider dispatch cancelled"),
        ("REJECTED", "Restaurant declines order (rush/out-of-stock)", "REFUNDED (Terminal)", "Immediate payment release; notification with apology & alternative suggestions"),
        ("REFUND_PENDING", "Admin or automated escalation approved", "REFUNDED", "Gateway refund API triggered; audit log entry recorded"),
        ("REFUNDED", "Bank acknowledges refund transaction", "TERMINAL STATE", "Account statement updated; customer receives SMS/email refund confirmation")
    ]

    for r_idx, row_vals in enumerate(sm_rows):
        row = sm_table.add_row()
        for ci, val_text in enumerate(row_vals):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 60, 60, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(sm_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 4: PENDING ADD-ONS & FUTURE UPGRADES (THE CORE ROADMAP)
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "4. Pending Add-ons & Future Upgrades Roadmap", 1)
    
    doc.add_paragraph(
        "To advance GourmetFleet from a polished, production-ready frontend and sandboxed backend to an enterprise-grade, "
        "nationwide food-tech platform rivaling Tier-1 market leaders (Zomato, Swiggy, OpenTable), the following "
        "eight strategic workstreams have been architected and prioritized for implementation:"
    )

    # 4.1 Workstream 1: Database & Cloud Infrastructure
    add_header_styled(doc, "4.1 Workstream A: Production Database & Distributed Cloud Infrastructure", 2)
    doc.add_paragraph(
        "Currently, the server uses MongoDB Memory Server with automatic seed generation for sandbox execution. The production upgrade requires:"
    )
    doc.add_paragraph(
        "• Production MongoDB Atlas Cluster (M30+): High-availability 3-node replica set with auto-scaling storage, automated point-in-time backups, and dedicated VPC peering.\n"
        "• Geospatial Indexing (2dsphere): Full production spatial indexing on Restaurant coordinates and Rider GPS locations for sub-50ms Haversine radial queries.\n"
        "• Redis Cluster 7.x: Distributed in-memory caching for active shopping carts, high-throughput session authentication, rate-limiting counters, and real-time rider location coordinates streaming.\n"
        "• Container Orchestration & Kubernetes: Helm charts and manifest definitions for deployment on AWS EKS or GCP GKE with Horizontal Pod Autoscalers (HPA) responding to traffic surges."
    )

    # 4.2 Workstream 2: Payment Gateway & Escrow Settlement
    add_header_styled(doc, "4.2 Workstream B: Production Payment Gateway & Automated Escrow Settlement", 2)
    doc.add_paragraph(
        "Currently, payments are simulated at checkout with instant status updates. The production upgrade establishes:"
    )
    doc.add_paragraph(
        "• Razorpay & Cashfree India Payment Gateway Integration: Native UPI Intent flow (Google Pay, PhonePe, Paytm), dynamic BharatQR generation, NetBanking for 50+ Indian banks, and tokenized credit/debit card vaulting complying with RBI card storage guidelines.\n"
        "• Marketplace Escrow & Split Settlement (Razorpay Route): Automated split disbursements where platform commission (8% to 15%) is instantly retained by GourmetFleet HQ, and the net food subtotal is deposited into the merchant's verified bank account on a T+1 settlement cycle.\n"
        "• Statutory Tax Deduction at Source (TDS): Automated deduction and accounting under Section 194-O of the Indian Income Tax Act (1% TDS on gross e-commerce marketplace sales).\n"
        "• Automated Refund Engine: Instant reversal of funds via UPI rails for cancelled orders or rejected merchant requests, updating the loyalty ledger simultaneously."
    )

    # 4.3 Workstream 3: Delivery Telemetry & Navigation Engine
    add_header_styled(doc, "4.3 Workstream C: Production Delivery Telemetry, Map Services & Smart Dispatch", 2)
    doc.add_paragraph(
        "Currently, the tracking UI utilizes an animated SVG radar with simulated Bezier curves. The production upgrade establishes:"
    )
    doc.add_paragraph(
        "• Google Maps Platform / MapmyIndia (Mappls) Enterprise APIs: Integration of Directions API, Distance Matrix API, and Roads API (snap-to-roads) for accurate turn-by-turn routing and real-time Indian traffic-adjusted ETAs.\n"
        "• Live WebSocket Telemetry Streaming: Continuous streaming of rider latitude and longitude coordinates through the socket event 'delivery:locationUpdated' every 3 to 5 seconds.\n"
        "• Smart Dispatch Algorithm: Hungarian matching algorithm to calculate optimal rider-to-order assignment based on pickup distance, kitchen readiness ETA, and delivery direction.\n"
        "• Geofencing Automation: Automated triggers advancing order status to 'ARRIVED_RESTAURANT' and 'ARRIVED_CUSTOMER' as soon as the rider enters a 50-meter perimeter."
    )

    # 4.4 Workstream 4: Omnichannel Messaging & Regulatory Communications
    add_header_styled(doc, "4.4 Workstream D: Omnichannel WhatsApp Business API & TRAI DLT-Compliant SMS", 2)
    doc.add_paragraph(
        "Currently, SMS and WhatsApp notifications are simulated in the notification engine. The production upgrade introduces:"
    )
    doc.add_paragraph(
        "• Meta WhatsApp Business Cloud API: Direct integration dispatching rich template messages with interactive buttons ('Track Live', 'View QR Boarding Pass', 'Call Rider', 'Modify Reservation').\n"
        "• TRAI DLT Regulatory SMS Gateway: Certified integration with Gupshup or Kaleyra utilizing registered Principal Entity IDs and approved Indian DLT message templates for transactional OTPs and booking confirmations.\n"
        "• Automated WhatsApp QR Pass Delivery: Immediate dispatch of high-contrast QR table reservation passes and event entry passes directly to the diner's WhatsApp thread upon checkout."
    )

    # 4.5 Workstream 5: Next-Generation AI & Machine Learning Systems
    add_header_styled(doc, "4.5 Workstream E: Enterprise AI Copilot, Dynamic Pricing & Recommendation Engine", 2)
    doc.add_paragraph(
        "Currently, the Owner AI Copilot provides pre-structured business analytics insights. The production upgrade incorporates:"
    )
    doc.add_paragraph(
        "• Google Gemini 2.5 Pro / Flash Multimodal AI Integration: Real-time LLM analysis connecting directly to the restaurant's live transactional database, generating custom menu margin optimizations, ingredient waste forecasts, and competitive pricing analysis.\n"
        "• Dynamic Rush & Weather Surge Pricing Engine: Algorithmic fee adjustment during adverse weather conditions (monsoons) or peak weekend kitchen rushes to balance delivery fleet supply and diner demand.\n"
        "• Vector Embedding Recommendation System: Personalized dish recommendations powered by Pinecone or pgvector, matching diner dietary preferences, allergen exclusions, and historical order affinities.\n"
        "• Automated Review Sentiment & Moderation: NLP pipeline automatically classifying incoming reviews, surfacing negative customer feedback for immediate manager intervention, and flagging abusive or non-genuine content."
    )

    # 4.6 Workstream 6: Native Mobile Applications & Hardware Integration
    add_header_styled(doc, "4.6 Workstream F: Cross-Platform Native Mobile Apps & Kitchen POS Hardware", 2)
    doc.add_paragraph(
        "Currently, the application is responsive web and PWA-ready. The production upgrade implements:"
    )
    doc.add_paragraph(
        "• React Native / Expo Mobile Apps: Dedicated native iOS and Android apps for Diners, Riders, and Restaurant Kitchen Staff.\n"
        "• Background Geolocation & Wake Lock: Native background location tracking service for riders ensuring continuous GPS broadcasts even when the phone screen is locked or running other apps.\n"
        "• ESC/POS Bluetooth Thermal Receipt Printer Integration: Automatic printing of Kitchen Order Tickets (KOT) on 80mm thermal receipt printers the instant an order transitions to 'CONFIRMED'.\n"
        "• Mobile Push Notifications: Firebase Cloud Messaging (FCM) and Apple Push Notification Service (APNs) for high-priority alerts with distinctive audible ringtones for incoming orders and delivery arrivals."
    )

    # 4.7 Workstream 7: Pan-India Expansion & Statutory Compliance
    add_header_styled(doc, "4.7 Workstream G: Nationwide Geographic Expansion & Statutory Indian Compliance", 2)
    doc.add_paragraph(
        "Currently, 5 major culinary hubs (100 restaurants) are modeled. The production upgrade scales to:"
    )
    doc.add_paragraph(
        "• Expansion to 50+ Indian Cities: Tier-1, Tier-2, and culinary tourist destinations (Goa, Chandigarh, Hyderabad, Kolkata, Pune, Ahmedabad, Kochi, Lucknow, etc.).\n"
        "• Live FSSAI Government FoSCoS API Verification: Automated verification of 14-digit FSSAI food safety licenses against the official government database during merchant onboarding.\n"
        "• Automated GST Compliance & Return Generation: Generation of compliant GSTR-1 and GSTR-8 (e-commerce operator tax collection at source) reporting logs.\n"
        "• Multilingual Localization: Native support for regional Indian languages (Hindi, Marathi, Kannada, Tamil, Telugu, and Bengali) across customer and rider interfaces."
    )

    # 4.8 Workstream 8: Enterprise Security, DPDP Compliance & Observability
    add_header_styled(doc, "4.8 Workstream H: Enterprise Data Protection (DPDP 2023) & Cloud Observability", 2)
    doc.add_paragraph(
        "Currently, role checks and audit logging are implemented in software middleware. The production upgrade mandates:"
    )
    doc.add_paragraph(
        "• Digital Personal Data Protection (DPDP) Act 2023 Compliance: Strict user consent capture records, phone number masking between customer and delivery partner, and automated 'Right to Erasure' data anonymization workflows.\n"
        "• Multi-Factor Authentication (MFA): Mandatory SMS/TOTP two-factor authentication for Restaurant Owner finance dashboards and Superadmin access.\n"
        "• Datadog / Prometheus + Grafana Observability: Full metrics telemetry monitoring API latency percentiles (p50, p95, p99), WebSocket connection pools, database connection health, and distributed tracing with Sentry error monitoring."
    )

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 5: PHASED SPRINT SCHEDULE & IMPLEMENTATION TIMELINE
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "5. Implementation Timeline & Phased Sprint Roadmap", 1)
    
    doc.add_paragraph(
        "The following implementation roadmap organizes the pending upgrades into six execution quarters (Q1 to Q6), "
        "providing a structured engineering deployment schedule with estimated person-weeks and milestone gates:"
    )

    roadmap_table = doc.add_table(rows=1, cols=5)
    roadmap_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rd_hdrs = ["Quarter / Phase", "Workstream Focus", "Primary Deliverables & Scope", "Est. Effort", "Milestone Gate"]
    for i, h in enumerate(rd_hdrs):
        c = roadmap_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    roadmap_rows = [
        ("Q1 (Weeks 1–6)", 
         "Cloud DB & Razorpay Integration", 
         "• Provision MongoDB Atlas M30 cluster with 2dsphere indexes\n"
         "• Redis Cluster setup for session cache & rate limits\n"
         "• Integrate Razorpay UPI Intent & BharatQR checkout\n"
         "• Implement Razorpay Route automated merchant split settlement", 
         "12 Person-Weeks", 
         "Live payments processing in sandbox with automated ledger reconciliation"),

        ("Q2 (Weeks 7–12)", 
         "Live Telemetry & Map APIs", 
         "• Integrate Google Maps / MapmyIndia Directions & Distance APIs\n"
         "• Real-time WebSocket rider coordinate streaming\n"
         "• Geofencing triggers for arrival notifications\n"
         "• Dynamic dispatch matching algorithm", 
         "10 Person-Weeks", 
         "Sub-3-second live rider tracking with accuracy within 15 meters on active maps"),

        ("Q3 (Weeks 13–18)", 
         "WhatsApp API & DLT SMS", 
         "• Meta WhatsApp Business Cloud API integration\n"
         "• TRAI DLT-compliant SMS templates & gateway connection\n"
         "• Automated WhatsApp QR boarding pass delivery\n"
         "• Interactive WhatsApp quick-replies for order updates", 
         "8 Person-Weeks", 
         "99.8% delivery rate for transactional WhatsApp notifications & OTPs within 5 seconds"),

        ("Q4 (Weeks 19–24)", 
         "AI Copilot & Smart Recommendation", 
         "• Google Gemini 2.5 Pro / Flash live database copilot\n"
         "• Vector embedding dish recommendations (Pinecone)\n"
         "• Algorithmic weather & rush hour surge pricing\n"
         "• NLP automated review sentiment and moderation pipeline", 
         "14 Person-Weeks", 
         "AI-driven merchant insights generating validated 10%+ margin optimization tips"),

        ("Q5 (Weeks 25–30)", 
         "Native Mobile Apps (iOS/Android)", 
         "• React Native / Expo Customer, Rider & Merchant apps\n"
         "• Native background geolocation & wake lock for riders\n"
         "• ESC/POS Bluetooth thermal KOT printer integration\n"
         "• Push notifications via Firebase Cloud Messaging & APNs", 
         "16 Person-Weeks", 
         "App Store and Google Play Store certification with zero crash-free rate > 99.5%"),

        ("Q6 (Weeks 31–36)", 
         "Pan-India Expansion & Compliance", 
         "• Expand platform catalog to 50+ Indian cities\n"
         "• FSSAI FoSCoS live license verification API\n"
         "• GSTR-1 and GSTR-8 automated tax return exports\n"
         "• DPDP Act 2023 compliance audit & Datadog APM monitoring", 
         "12 Person-Weeks", 
         "Full statutory compliance certification & sub-200ms p95 global API latency")
    ]

    for r_idx, row_vals in enumerate(roadmap_rows):
        row = roadmap_table.add_row()
        for ci, val_text in enumerate(row_vals):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(roadmap_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 6: API INTEGRATION GAP MATRIX & CONTRACTS
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "6. Production Backend Endpoint Gap Matrix", 1)
    
    doc.add_paragraph(
        "The following matrix maps the current frontend service interfaces (`client/src/services/`) directly to the "
        "target production backend REST and WebSocket endpoints, highlighting the exact integration boundary for backend engineers:"
    )

    api_table = doc.add_table(rows=1, cols=5)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_hdrs = ["Service Function", "HTTP Method & Endpoint", "Payload / Query Spec", "Current Behavior", "Production Target Integration"]
    for i, h in enumerate(api_hdrs):
        c = api_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "2B6CB0")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    api_rows = [
        ("authService.login()", "POST /api/auth/login", "{ email, password }", "Mock user lookup & token generation", "Bcrypt validation, JWT in HttpOnly cookie, Redis session"),
        ("restaurantService.getRestaurants()", "GET /api/restaurants", "?city, cuisine, mode, lat, lng", "Mock data array filter with Haversine", "MongoDB $geoNear aggregation with 2dsphere index"),
        ("orderService.createOrder()", "POST /api/orders", "{ items, address, deliveryFee, tip }", "Saves to localStorage mock DB", "Mongoose Order document creation; triggers payment hold"),
        ("orderService.updateOrderStatus()", "PATCH /api/orders/:id/status", "{ orderStatus, description }", "Updates mock state & local socket event", "MongoDB atomic update; Socket.IO broadcast to rooms"),
        ("deliveryService.getRequests()", "GET /api/delivery/requests", "?radiusKm=2..5", "Filters pending orders within radius", "Spatial geoNear query filtering active pending delivery jobs"),
        ("deliveryService.verifyDeliveryOtp()", "POST /api/delivery/orders/:id/verify-otp", "{ otp: string }", "Checks 4-digit OTP match", "Validates OTP, sets status to DELIVERED, releases escrow funds"),
        ("reservationService.createReservation()", "POST /api/reservations", "{ restaurantId, tableId, date, slot }", "Generates mock QR token", "Atomic slot booking preventing double booking; QR token stored"),
        ("aiReportService.generateReport()", "POST /api/owner/ai/reports/generate", "{ reportType, restaurantId }", "Returns structured mock insights", "Sends sanitized DB metrics to Google Gemini 2.5 Pro API"),
        ("promotionService.applyCoupon()", "POST /api/promotions/apply", "{ code, subtotal }", "Calculates percentage or flat discount", "Validates usage count limit & minimum order in DB"),
        ("socketBus.emit('delivery:locationUpdated')", "WebSocket Event", "{ riderId, lat, lng, speed, heading }", "Simulated Bezier curve motion", "Redis GeoPubSub broadcasting live GPS to customer tracking room")
    ]

    for r_idx, row_vals in enumerate(api_rows):
        row = api_table.add_row()
        for ci, val_text in enumerate(row_vals):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 60, 60, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(api_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 7: QUALITY ASSURANCE, ACCEPTANCE CRITERIA & GATES
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "7. Quality Assurance Gates & Acceptance Criteria", 1)
    
    doc.add_paragraph(
        "To ensure production resilience, every phase of the implementation and upgrade roadmap must strictly satisfy "
        "the following automated acceptance criteria and quality gates:"
    )

    qa_table = doc.add_table(rows=1, cols=4)
    qa_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    qa_hdrs = ["Quality Dimension", "Target Specification", "Verification Methodology", "Pass / Fail Gate"]
    for i, h in enumerate(qa_hdrs):
        c = qa_table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    qa_rows = [
        ("Concurrency Safety", "Zero double-bookings under 20 concurrent table reservations", "Locust / k6 concurrency load test hitting simultaneous booking endpoint", "Exactly 1 successful booking; 19 rejected with 409 Slot Unavailable"),
        ("Price Integrity", "Server recalculates all items, addons, GST, and delivery fees", "Malicious client payload modifying unit prices or subtotal", "Server strictly overrides with authoritative DB prices or returns 400 Bad Request"),
        ("Tenant Isolation", "Restaurant Owner A cannot access or modify Restaurant Owner B's data", "Automated penetration test invoking Owner A token on Owner B's KDS endpoints", "Strict HTTP 403 Forbidden with security audit log entry generated"),
        ("API Latency", "Sub-150ms p95 latency for restaurant searches and menu queries", "k6 load test simulating 5,000 active users querying menus", "p95 <= 150ms; p99 <= 300ms across all cached endpoints"),
        ("Frontend Build Integrity", "Zero TypeScript compilation warnings, zero circular dependencies", "tsc --noEmit && vite build with Rollup code-splitting chunks", "Zero errors; build duration under 25s; chunk sizes within 500kB thresholds"),
        ("Accessibility & Motion", "Full compliance with WCAG 2.1 AA and prefers-reduced-motion", "Lighthouse Accessibility audit and manual screen reader testing", "Lighthouse Accessibility score >= 95/100; zero missing aria attributes")
    ]

    for r_idx, row_vals in enumerate(qa_rows):
        row = qa_table.add_row()
        for ci, val_text in enumerate(row_vals):
            c = row.cells[ci]
            c.text = val_text
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 60, 60, 80, 80)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    set_table_borders(qa_table)

    doc.add_paragraph() # Spacing

    # ─────────────────────────────────────────────────────────────
    # SECTION 8: CONCLUSION & NEXT STEPS
    # ─────────────────────────────────────────────────────────────
    add_header_styled(doc, "8. Conclusion & Immediate Execution Steps", 1)
    
    doc.add_paragraph(
        "GourmetFleet represents an exceptionally well-engineered, modular foundation. With all 50 frontend screens operating "
        "flawlessly, strongly typed contracts established across both client and server, and complete Indian localization "
        "built-in, the platform is ideally positioned for immediate execution of the Phase 1 production upgrades.\n\n"
        "Immediate recommended steps for the engineering leadership team:\n"
        "1. Provision MongoDB Atlas M30 cluster and configure VPC peering with backend application servers.\n"
        "2. Register Merchant Account on Razorpay Sandbox and configure Webhook secrets for payment events.\n"
        "3. Obtain Google Maps Platform API key with Directions, Distance Matrix, and Geocoding APIs enabled.\n"
        "4. Register Principal Entity ID on TRAI DLT portal for transactional SMS compliance."
    )

    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    target_path = sys.argv[1] if len(sys.argv) > 1 else "Complete_Implementation_Plan_and_Future_Upgrades.docx"
    build_comprehensive_plan_and_upgrades_doc(target_path)
