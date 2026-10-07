import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

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
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(17)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
    elif level == 2:
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2B, 0x6C, 0xB0)
    elif level == 3:
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        for run in h.runs:
            run.font.name = 'Calibri'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    return h

def build_tech_doc(filepath):
    doc = Document()
    for sec in doc.sections:
        sec.top_margin = Inches(1)
        sec.bottom_margin = Inches(1)
        sec.left_margin = Inches(1)
        sec.right_margin = Inches(1)
        
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(24)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("TECHNICAL ARCHITECTURE & API DOCUMENTATION")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1A, 0x36, 0x5D)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("System Architecture, MongoDB Schemas, Real-time Topology, Concurrency Controls, and REST API Contracts")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(0x71, 0x80, 0x96)
    
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(20)
    r_meta = p_meta.add_run("System: GourmetFleet Engine  |  Runtime: Node.js 22 + TypeScript + Express + MongoDB + Socket.IO")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(9.5)
    r_meta.font.color.rgb = RGBColor(0xA0, 0xAE, 0xC0)
    
    add_header_styled(doc, "1. High-Level System Architecture & Flow", 1)
    doc.add_paragraph(
        "GourmetFleet is engineered as a high-throughput, decoupled MERN architecture designed to handle concurrent order "
        "placement, real-time kitchen dispatching, and atomic table reservation locks without split-brain conditions."
    )
    
    arch_diagram = (
        "┌─────────────────────────────────────────────────────────────────────────────┐\n"
        "│                          CLIENT LAYER (Browser / Mobile)                    │\n"
        "│  React 18/19 SPA  │  Tailwind CSS  │  Three.js 3D  │  Zustand  │  Socket.IO │\n"
        "└──────────────────────────────────────┬──────────────────────────────────────┘\n"
        "                                       │ HTTPS / WSS (WebSocket)\n"
        "                                       ▼\n"
        "┌─────────────────────────────────────────────────────────────────────────────┐\n"
        "│                     API GATEWAY / REVERSE PROXY & SECURITY                  │\n"
        "│  Helmet Headers  │  Rate Limiting  │  CORS  │  Zod Schema Validation Guards │\n"
        "└──────────────────────────────────────┬──────────────────────────────────────┘\n"
        "                                       │ Validated Requests\n"
        "                                       ▼\n"
        "┌─────────────────────────────────────────────────────────────────────────────┐\n"
        "│                   EXPRESS / TYPESCRIPT SERVICE CONTROLLERS                  │\n"
        "│  Auth & RBAC   │  Pricing Engine   │  Reservation Engine   │  Owner AI Agent│\n"
        "└──────┬───────────────────┬───────────────────┬────────────────────┬─────────┘\n"
        "       │                   │                   │                    │\n"
        "       ▼                   ▼                   ▼                    ▼\n"
        "┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌─────────────────┐\n"
        "│ MongoDB Core  │   │ Redis Pub/Sub │   │ Socket.IO Hub │   │ LLM AI Provider │\n"
        "│ Collections & │   │ Caching &     │   │ Real-time     │   │ Context & Tool- │\n"
        "│ Atomic Trans. │   │ Rate Limits   │   │ Room Broadcast│   │ calling sandbox │\n"
        "└───────────────┘   └───────────────┘   └───────────────┘   └─────────────────┘"
    )
    
    p_code = doc.add_paragraph()
    p_code.paragraph_format.space_before = Pt(4)
    p_code.paragraph_format.space_after = Pt(8)
    rc = p_code.add_run(arch_diagram)
    rc.font.name = "Consolas"
    rc.font.size = Pt(7.5)
    rc.font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
    
    add_header_styled(doc, "2. MongoDB Core Schemas & Entity Relationships", 1)
    
    models = [
        ("User Model", 
         "Fields: _id (ObjectId), email (String, indexed, unique), passwordHash (String), fullName (String), phone (String), "
         "role ('customer' | 'restaurant_owner' | 'admin'), verificationStatus ('PENDING' | 'VERIFIED' | 'SUSPENDED'), "
         "restaurantId (ObjectId, optional), loyaltyPointsBalance (Number, default 0), membershipTier ('STANDARD' | 'BRONZE' | 'SILVER' | 'GOLD'), "
         "savedAddresses (Array of { label, street, city, postalCode, location: { lat, lng } }), createdAt, updatedAt."),
        ("Restaurant Model",
         "Fields: _id (ObjectId), name (String, indexed), slug (String, unique), ownerId (ObjectId, ref: User), "
         "operatingMode ('DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID'), cuisineTypes (Array of String), description (String), "
         "heroImage (String), logoImage (String), address ({ street, city, state, postalCode, location: { lat, lng } }), "
         "deliveryZones (Array of { maxDistanceKm: Number, deliveryFee: Number, minOrderAmount: Number }), "
         "businessHours (Array of { day: Number, open: String, close: String, isClosed: Boolean }), "
         "fssaiLicenseNumber (String, verified), gstinNumber (String), commissionRate (Number, default 10.0), "
         "averageRating (Number, default 4.5), totalReviews (Number, default 0), isActive (Boolean), verificationStatus ('PENDING' | 'APPROVED' | 'REJECTED')."),
        ("MenuItem Model",
         "Fields: _id (ObjectId), restaurantId (ObjectId, ref: Restaurant, indexed), category (String, indexed), name (String), "
         "description (String), basePrice (Number), imageUrl (String), dietaryTags (Array of 'VEG' | 'NON_VEG' | 'VEGAN' | 'GLUTEN_FREE' | 'HALAL'), "
         "variants (Array of { name: String, priceDelta: Number }), modifierGroups (Array of { name: String, minSelection: Number, maxSelection: Number, options: [{ name: String, price: Number }] }), "
         "isAvailable (Boolean, default true), preparationTimeMinutes (Number, default 20)."),
        ("Table Model",
         "Fields: _id (ObjectId), restaurantId (ObjectId, ref: Restaurant, indexed), tableNumber (String), "
         "capacity (Number), zone ('INDOOR' | 'OUTDOOR' | 'VIP_BOOTH' | 'TERRACE'), minPartySize (Number), "
         "isActive (Boolean, default true)."),
        ("Reservation Model",
         "Fields: _id (ObjectId), restaurantId (ObjectId, ref: Restaurant, indexed), customerId (ObjectId, ref: User, indexed), "
         "tableId (ObjectId, ref: Table, indexed), guestCount (Number), reservationDate (Date, indexed), "
         "timeSlot (String, e.g. '19:30'), durationMinutes (Number, default 90), status ('PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'), "
         "depositAmount (Number, default 0), qrCodeToken (String, unique, indexed), specialRequests (String), createdAt."),
        ("Order Model",
         "Fields: _id (ObjectId), orderNumber (String, unique, indexed), restaurantId (ObjectId, ref: Restaurant, indexed), "
         "customerId (ObjectId, ref: User, indexed), orderType ('DELIVERY' | 'TAKEOUT'), "
         "items (Array of { menuItemId, name, quantity, unitPrice, variant, modifiers, totalPrice }), "
         "subtotal (Number), deliveryFee (Number), packagingFee (Number), platformFee (Number), gstAmount (Number), "
         "tip (Number), discountAmount (Number), totalAmount (Number), paymentStatus ('PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'), "
         "paymentIntentId (String), idempotencyKey (String, unique, sparse), orderStatus ('PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'), "
         "deliveryAddress (Object), estimatedDeliveryTime (Date), cancellationReason (String), createdAt, updatedAt."),
        ("LoyaltyLedger Model",
         "Fields: _id (ObjectId), userId (ObjectId, ref: User, indexed), points (Number), "
         "transactionType ('EARNED' | 'REDEEMED' | 'REVERSED' | 'BONUS'), referenceType ('ORDER' | 'RESERVATION' | 'PROMO'), "
         "referenceId (ObjectId), balanceAfter (Number), notes (String), createdAt.")
    ]
    
    for m_name, m_spec in models:
        add_header_styled(doc, m_name, 2)
        doc.add_paragraph(m_spec)
        
    add_header_styled(doc, "3. Core REST API Endpoints Specification", 1)
    
    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_hdrs = ["Method & Endpoint", "Auth Role", "Payload Highlights", "Success Response", "Description & Logic"]
    for i, h in enumerate(api_hdrs):
        c = table.rows[0].cells[i]
        c.text = h
        set_cell_background(c, "1A365D")
        set_cell_margins(c, 100, 100, 80, 80)
        p = c.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.size = Pt(8.5)
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    api_data = [
        ("POST /api/auth/register", "Public", "{ email, password, fullName, phone, role }", "201 Created { user, token }", "Registers user; role defaults to customer unless owner onboarding applied."),
        ("POST /api/auth/login", "Public", "{ email, password }", "200 OK { user, token, refreshToken }", "Validates password hash via bcrypt, issues JWT access and refresh tokens."),
        ("GET /api/restaurants", "Public", "Query: ?cuisine, ?mode, ?search, ?lat, ?lng", "200 OK { restaurants: [...] }", "Multi-parameter discovery filter with geo-distance calculation."),
        ("GET /api/restaurants/:id", "Public", "None", "200 OK { restaurant, menuByCategory, tables }", "Returns complete restaurant profile, operational mode, and in-stock menu."),
        ("POST /api/orders/calculate", "Public / User", "{ restaurantId, items: [{ menuItemId, qty, variant, modifiers }] }", "200 OK { subtotal, deliveryFee, packagingFee, gst, platformFee, total }", "Deterministic server-side fee recalculation; ignores client pricing."),
        ("POST /api/orders", "Customer", "{ restaurantId, items, orderType, deliveryAddress, tip, couponCode }", "201 Created { order, paymentIntent }", "Creates order in PLACED state; emits Socket.IO event to restaurant kitchen room."),
        ("POST /api/reservations/check", "Public", "{ restaurantId, date, timeSlot, guestCount }", "200 OK { availableTables: [...], isAvailable: true }", "Checks table inventory against existing bookings for requested 90-min window."),
        ("POST /api/reservations", "Customer", "{ restaurantId, date, timeSlot, guestCount, tableId, specialRequests }", "201 Created { reservation, qrCodeToken }", "Atomic slot booking; assigns QR pass; triggers reminder queue."),
        ("PATCH /api/owner/orders/:id/status", "Owner", "{ status: 'CONFIRMED'|'PREPARING'|'READY_FOR_PICKUP'|'OUT_FOR_DELIVERY'|'DELIVERED' }", "200 OK { order }", "Updates order lifecycle; pushes real-time status update to customer room."),
        ("POST /api/owner/ai/query", "Owner", "{ prompt: String }", "200 OK { response, toolOutputs, suggestedAction }", "Executes isolated read tools on restaurant DB aggregates; generates insights."),
        ("GET /api/admin/metrics", "Admin", "None", "200 OK { totalGrossRevenue, commissionEarned, activeOrders, pendingKyc }", "Platform-wide governance metrics and commission health monitoring.")
    ]
    
    for r_idx, (ep, auth, pay, succ, desc) in enumerate(api_data):
        row = table.add_row()
        for ci, val in enumerate([ep, auth, pay, succ, desc]):
            c = row.cells[ci]
            c.text = val
            bg = "F7FAFC" if r_idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, bg)
            set_cell_margins(c, 70, 70, 70, 70)
            p = c.paragraphs[0]
            p.runs[0].font.name = "Calibri"
            p.runs[0].font.size = Pt(8)
            p.runs[0].font.color.rgb = RGBColor(0x2D, 0x37, 0x48)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    add_header_styled(doc, "4. Concurrency Control & Double Booking Prevention", 1)
    doc.add_paragraph(
        "A critical vulnerability in dining reservation platforms is the double-booking race condition, wherein two diners "
        "attempt to reserve Table #4 for 8:00 PM simultaneously. GourmetFleet enforces strict two-layer concurrency control:"
    )
    doc.add_paragraph(
        "1. Compound Unique Index: A unique compound sparse index on { restaurantId: 1, tableId: 1, reservationDate: 1, timeSlot: 1 } "
        "for active reservation statuses (excluding CANCELLED and NO_SHOW).\n"
        "2. Atomic Conditional Updates: During reservation creation, the query evaluates:\n"
        "   Reservation.findOne({ restaurantId, tableId, reservationDate, timeSlot, status: { $in: ['PENDING', 'CONFIRMED', 'SEATED'] } })\n"
        "   If a collision is detected within the 90-minute service window, the transaction aborts with HTTP 409 Conflict, "
        "   and the user is offered alternate time slots or waitlist placement."
    )
    
    add_header_styled(doc, "5. Real-Time Socket.IO Channel Architecture", 1)
    doc.add_paragraph(
        "Real-time state synchronization is managed via segmented Socket.IO rooms ensuring zero cross-tenant message leakage:\n"
        "• Room 'restaurant:<restaurantId>': Subscribed by owner kitchen displays to receive new orders, status modifications, and cancellation alerts.\n"
        "• Room 'order:<orderId>': Subscribed by the customer to receive sub-second live progress updates ('PREPARING', 'OUT_FOR_DELIVERY', etc.).\n"
        "• Room 'table:<restaurantId>': Subscribed by the owner floor manager to observe live table occupancy changes."
    )
    
    doc.save(filepath)
    print(f"Successfully generated {filepath}")

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "Technical_Architecture_and_API_Documentation.docx"
    build_tech_doc(target)
