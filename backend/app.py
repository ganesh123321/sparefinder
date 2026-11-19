import os
import uuid
import json
import re
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from database import get_db, init_db

app = Flask(__name__)
app.secret_key = "sparefinder_secret_2024"
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

# ─── HEALTH CHECK ──────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "SPARE FINDER API is running"})

# ─── SEARCH ────────────────────────────────────────────────────────
@app.route('/api/search', methods=['GET'])
def search_parts():
    query = request.args.get('q', '').strip()
    brand = request.args.get('brand', '').strip()
    category = request.args.get('category', '').strip()
    vehicle_model = request.args.get('model', '').strip()
    part_number = request.args.get('part_number', '').strip()

    conn = get_db()
    c = conn.cursor()

    sql = "SELECT * FROM spare_parts WHERE 1=1"
    params = []

    if query:
        sql += " AND (name LIKE ? OR description LIKE ? OR part_number LIKE ?)"
        like = f"%{query}%"
        params += [like, like, like]
    if brand:
        sql += " AND brand LIKE ?"
        params.append(f"%{brand}%")
    if category:
        sql += " AND category LIKE ?"
        params.append(f"%{category}%")
    if vehicle_model:
        sql += " AND (vehicle_model LIKE ? OR vehicle_make LIKE ?)"
        like = f"%{vehicle_model}%"
        params += [like, like]
    if part_number:
        sql += " AND part_number LIKE ?"
        params.append(f"%{part_number}%")

    rows = c.execute(sql, params).fetchall()
    parts = rows_to_list(rows)

    # Parse JSON specs
    for p in parts:
        try:
            p['specifications'] = json.loads(p['specifications']) if p.get('specifications') else {}
        except:
            p['specifications'] = {}
        p['compatible_parts'] = p.get('compatible_parts', '').split(',') if p.get('compatible_parts') else []

    conn.close()
    return jsonify({"results": parts, "count": len(parts)})

# ─── AI SUBSTITUTION ───────────────────────────────────────────────
@app.route('/api/substitutes/<int:part_id>', methods=['GET'])
def get_substitutes(part_id):
    conn = get_db()
    c = conn.cursor()

    # Get the original part
    original = c.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone()
    if not original:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    original = row_to_dict(original)
    try:
        original['specifications'] = json.loads(original['specifications']) if original.get('specifications') else {}
    except:
        original['specifications'] = {}

    # Get compatible parts listed in original
    compat_numbers = []
    if original.get('compatible_parts'):
        compat_numbers = original['compatible_parts'].split(',')

    substitutes = []
    if compat_numbers:
        placeholders = ','.join('?' * len(compat_numbers))
        rows = c.execute(f"SELECT * FROM spare_parts WHERE part_number IN ({placeholders})", compat_numbers).fetchall()
        substitutes = rows_to_list(rows)

    # Also find parts in same category with same vehicle compatibility
    if len(substitutes) < 3:
        category = original.get('category')
        vehicle_make = original.get('vehicle_make')
        extra = c.execute('''
            SELECT * FROM spare_parts
            WHERE category = ? AND id != ?
            AND (vehicle_make LIKE ? OR vehicle_make = 'Universal')
            LIMIT 5
        ''', (category, part_id, f"%{vehicle_make}%")).fetchall()
        existing_ids = {s['id'] for s in substitutes}
        for row in extra:
            d = row_to_dict(row)
            if d['id'] not in existing_ids:
                substitutes.append(d)

    for s in substitutes:
        try:
            s['specifications'] = json.loads(s['specifications']) if s.get('specifications') else {}
        except:
            s['specifications'] = {}
        savings = original.get('price', 0) - s.get('price', 0)
        s['savings'] = round(max(savings, 0), 2)
        s['savings_percent'] = round((savings / original['price'] * 100) if original['price'] > 0 else 0, 1)
        s['compatibility_score'] = 95 if s['part_number'] in compat_numbers else 78
        s['compatible_parts'] = s.get('compatible_parts', '').split(',') if s.get('compatible_parts') else []

    conn.close()
    return jsonify({
        "original": original,
        "substitutes": substitutes,
        "total_substitutes": len(substitutes)
    })

# ─── SPARE DETAIL ──────────────────────────────────────────────────
@app.route('/api/spare/<int:part_id>', methods=['GET'])
def get_spare_detail(part_id):
    conn = get_db()
    c = conn.cursor()
    part = c.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone()
    if not part:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    part = row_to_dict(part)
    try:
        part['specifications'] = json.loads(part['specifications']) if part.get('specifications') else {}
    except:
        part['specifications'] = {}
    part['compatible_parts'] = part.get('compatible_parts', '').split(',') if part.get('compatible_parts') else []

    # Get stock availability
    stock = c.execute('''
        SELECT s.*, sh.name as shop_name, sh.city
        FROM stock s JOIN shops sh ON s.shop_id = sh.id
        WHERE s.part_id = ? AND s.quantity > 0
    ''', (part_id,)).fetchall()

    conn.close()
    return jsonify({
        "part": part,
        "availability": rows_to_list(stock),
        "total_shops": len(stock)
    })

# ─── IMAGE UPLOAD + OCR ────────────────────────────────────────────
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    extracted_text = ""
    part_numbers = []
    ocr_available = False

    try:
        import pytesseract
        from PIL import Image

        # Try common Tesseract paths on Windows
        tesseract_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'C:\Users\HP\AppData\Local\Programs\Tesseract-OCR\tesseract.exe',
        ]
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                break

        img = Image.open(filepath)
        extracted_text = pytesseract.image_to_string(img)
        ocr_available = True

        # Extract part numbers (alphanumeric patterns like OIL-FILT-001, ABC123)
        patterns = [
            r'\b[A-Z]{2,6}-[A-Z]{2,6}-\d{3,6}\b',
            r'\b[A-Z]{1,4}\d{4,10}\b',
            r'\b\d{4,10}[A-Z]{1,4}\b',
        ]
        for pat in patterns:
            found = re.findall(pat, extracted_text.upper())
            part_numbers.extend(found)
        part_numbers = list(set(part_numbers))

    except Exception as e:
        ocr_available = False
        extracted_text = f"OCR not available: {str(e)}"

    # Search DB for matching parts
    conn = get_db()
    c = conn.cursor()
    matched_parts = []

    if part_numbers:
        for pn in part_numbers:
            rows = c.execute(
                "SELECT * FROM spare_parts WHERE part_number LIKE ? OR name LIKE ?",
                (f"%{pn}%", f"%{pn}%")
            ).fetchall()
            matched_parts.extend(rows_to_list(rows))

    # Remove duplicates
    seen = set()
    unique_parts = []
    for p in matched_parts:
        if p['id'] not in seen:
            seen.add(p['id'])
            try:
                p['specifications'] = json.loads(p['specifications']) if p.get('specifications') else {}
            except:
                p['specifications'] = {}
            unique_parts.append(p)

    conn.close()
    return jsonify({
        "ocr_available": ocr_available,
        "extracted_text": extracted_text,
        "detected_part_numbers": part_numbers,
        "matched_parts": unique_parts,
        "filename": filename,
        "message": "Image processed successfully" if ocr_available else "OCR not configured; install Tesseract"
    })

# ─── AVAILABILITY ──────────────────────────────────────────────────
@app.route('/api/availability/<int:part_id>', methods=['GET'])
def get_availability(part_id):
    conn = get_db()
    c = conn.cursor()

    part = c.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone()
    if not part:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    rows = c.execute('''
        SELECT st.*, sh.name as shop_name, sh.address, sh.city, sh.state,
               sh.phone, sh.email, sh.rating, sh.opening_hours,
               sh.latitude, sh.longitude
        FROM stock st
        JOIN shops sh ON st.shop_id = sh.id
        WHERE st.part_id = ?
        ORDER BY st.quantity DESC
    ''', (part_id,)).fetchall()

    availability = rows_to_list(rows)
    for a in availability:
        a['in_stock'] = a['quantity'] > 0

    conn.close()
    return jsonify({
        "part": row_to_dict(part),
        "availability": availability,
        "shops_with_stock": sum(1 for a in availability if a['in_stock'])
    })

# ─── RESERVE ───────────────────────────────────────────────────────
@app.route('/api/reserve', methods=['POST'])
def create_reservation():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ['customer_name', 'customer_phone', 'part_id', 'shop_id', 'quantity']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing field: {field}"}), 400

    reservation_id = f"RES{uuid.uuid4().hex[:8].upper()}"

    conn = get_db()
    c = conn.cursor()

    # Check stock
    stock = c.execute(
        "SELECT * FROM stock WHERE part_id = ? AND shop_id = ?",
        (data['part_id'], data['shop_id'])
    ).fetchone()

    if not stock or stock['quantity'] < data['quantity']:
        conn.close()
        return jsonify({"error": "Insufficient stock at selected shop"}), 400

    # Create reservation
    c.execute('''
        INSERT INTO reservations (reservation_id, customer_name, customer_phone, customer_email, part_id, shop_id, quantity, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        reservation_id,
        data['customer_name'],
        data['customer_phone'],
        data.get('customer_email', ''),
        data['part_id'],
        data['shop_id'],
        data['quantity'],
        data.get('notes', '')
    ))

    # Reserve stock (reduce quantity)
    c.execute(
        "UPDATE stock SET quantity = quantity - ? WHERE part_id = ? AND shop_id = ?",
        (data['quantity'], data['part_id'], data['shop_id'])
    )

    # Get part and shop details for confirmation
    part = c.execute("SELECT name, part_number, price FROM spare_parts WHERE id = ?", (data['part_id'],)).fetchone()
    shop = c.execute("SELECT name, address, city, phone FROM shops WHERE id = ?", (data['shop_id'],)).fetchone()

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "reservation_id": reservation_id,
        "message": "Reservation created successfully!",
        "details": {
            "part_name": row_to_dict(part)['name'] if part else "",
            "part_number": row_to_dict(part)['part_number'] if part else "",
            "shop_name": row_to_dict(shop)['name'] if shop else "",
            "shop_address": f"{row_to_dict(shop)['address']}, {row_to_dict(shop)['city']}" if shop else "",
            "shop_phone": row_to_dict(shop)['phone'] if shop else "",
            "quantity": data['quantity'],
            "total_price": round(row_to_dict(part)['price'] * data['quantity'], 2) if part else 0
        }
    }), 201

# ─── STOCK MANAGEMENT ──────────────────────────────────────────────
@app.route('/api/stock', methods=['GET'])
def get_stock():
    conn = get_db()
    c = conn.cursor()

    rows = c.execute('''
        SELECT st.*, sp.name as part_name, sp.part_number, sp.category, sp.brand,
               sh.name as shop_name, sh.city
        FROM stock st
        JOIN spare_parts sp ON st.part_id = sp.id
        JOIN shops sh ON st.shop_id = sh.id
        ORDER BY st.quantity ASC
    ''').fetchall()

    stock = rows_to_list(rows)
    low_stock = [s for s in stock if s['quantity'] < 5]

    conn.close()
    return jsonify({
        "stock": stock,
        "total_items": len(stock),
        "low_stock_alerts": low_stock,
        "low_stock_count": len(low_stock)
    })

@app.route('/api/stock/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    data = request.get_json()
    if not data or 'quantity' not in data:
        return jsonify({"error": "Quantity required"}), 400

    conn = get_db()
    c = conn.cursor()

    existing = c.execute("SELECT * FROM stock WHERE id = ?", (stock_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Stock record not found"}), 404

    updates = []
    params = []
    if 'quantity' in data:
        updates.append("quantity = ?")
        params.append(data['quantity'])
    if 'selling_price' in data:
        updates.append("selling_price = ?")
        params.append(data['selling_price'])

    updates.append("last_updated = CURRENT_TIMESTAMP")
    params.append(stock_id)

    c.execute(f"UPDATE stock SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Stock updated"})

# ─── SHOPS ─────────────────────────────────────────────────────────
@app.route('/api/shops', methods=['GET'])
def get_shops():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute("SELECT * FROM shops ORDER BY rating DESC").fetchall()
    conn.close()
    return jsonify({"shops": rows_to_list(rows)})

@app.route('/api/shops', methods=['POST'])
def add_shop():
    data = request.get_json()
    required = ['name', 'address', 'city', 'state', 'phone']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing: {field}"}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO shops (name, address, city, state, phone, email, rating, opening_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (data['name'], data['address'], data['city'], data['state'],
          data['phone'], data.get('email', ''), data.get('rating', 4.0), data.get('opening_hours', 'Mon-Sat 9AM-6PM')))
    conn.commit()
    shop_id = c.lastrowid
    conn.close()
    return jsonify({"success": True, "id": shop_id}), 201

# ─── SALES ANALYTICS ───────────────────────────────────────────────
@app.route('/api/sales', methods=['GET'])
def get_sales():
    conn = get_db()
    c = conn.cursor()

    # Monthly sales
    monthly = c.execute('''
        SELECT strftime('%Y-%m', sale_date) as month,
               SUM(quantity) as total_units,
               SUM(sale_price * quantity) as total_revenue,
               COUNT(*) as transactions
        FROM sales
        GROUP BY month
        ORDER BY month
    ''').fetchall()

    # Category-wise sales
    category_sales = c.execute('''
        SELECT sp.category, SUM(s.quantity) as units, SUM(s.sale_price * s.quantity) as revenue
        FROM sales s JOIN spare_parts sp ON s.part_id = sp.id
        GROUP BY sp.category
        ORDER BY revenue DESC
    ''').fetchall()

    # Top selling parts
    top_parts = c.execute('''
        SELECT sp.name, sp.part_number, SUM(s.quantity) as total_sold,
               SUM(s.sale_price * s.quantity) as revenue
        FROM sales s JOIN spare_parts sp ON s.part_id = sp.id
        GROUP BY s.part_id
        ORDER BY total_sold DESC
        LIMIT 10
    ''').fetchall()

    # Summary stats
    total_parts = c.execute("SELECT COUNT(*) as cnt FROM spare_parts").fetchone()['cnt']
    total_shops = c.execute("SELECT COUNT(*) as cnt FROM shops").fetchone()['cnt']
    total_reservations = c.execute("SELECT COUNT(*) as cnt FROM reservations").fetchone()['cnt']
    pending_reservations = c.execute("SELECT COUNT(*) as cnt FROM reservations WHERE status='pending'").fetchone()['cnt']
    total_stock = c.execute("SELECT SUM(quantity) as total FROM stock").fetchone()['total'] or 0
    low_stock_count = c.execute("SELECT COUNT(*) as cnt FROM stock WHERE quantity < 5").fetchone()['cnt']
    total_revenue = c.execute("SELECT SUM(sale_price * quantity) as rev FROM sales").fetchone()['rev'] or 0

    conn.close()
    return jsonify({
        "monthly_sales": rows_to_list(monthly),
        "category_sales": rows_to_list(category_sales),
        "top_parts": rows_to_list(top_parts),
        "summary": {
            "total_parts": total_parts,
            "total_shops": total_shops,
            "total_reservations": total_reservations,
            "pending_reservations": pending_reservations,
            "total_stock": total_stock,
            "low_stock_count": low_stock_count,
            "total_revenue": round(total_revenue, 2)
        }
    })

# ─── ADMIN AUTH ────────────────────────────────────────────────────
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    conn = get_db()
    admin = conn.execute(
        "SELECT * FROM admins WHERE username = ? AND password = ?", (username, password)
    ).fetchone()
    conn.close()

    if admin:
        session['admin'] = username
        return jsonify({"success": True, "message": "Login successful"})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return jsonify({"success": True})

@app.route('/api/admin/check', methods=['GET'])
def admin_check():
    return jsonify({"logged_in": 'admin' in session})

# ─── SPARE PARTS CRUD ──────────────────────────────────────────────
@app.route('/api/parts', methods=['GET'])
def get_all_parts():
    conn = get_db()
    rows = conn.execute("SELECT * FROM spare_parts ORDER BY created_at DESC").fetchall()
    parts = rows_to_list(rows)
    for p in parts:
        try:
            p['specifications'] = json.loads(p['specifications']) if p.get('specifications') else {}
        except:
            p['specifications'] = {}
    conn.close()
    return jsonify({"parts": parts})

@app.route('/api/parts', methods=['POST'])
def add_part():
    data = request.get_json()
    required = ['part_number', 'name', 'brand', 'category', 'vehicle_model', 'vehicle_make', 'year_range', 'price']
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing: {field}"}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO spare_parts (part_number, name, brand, category, vehicle_model, vehicle_make,
                year_range, price, original_price, description, function_desc, warranty, is_oem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['part_number'], data['name'], data['brand'], data['category'],
              data['vehicle_model'], data['vehicle_make'], data['year_range'],
              data['price'], data.get('original_price', data['price']),
              data.get('description', ''), data.get('function_desc', ''),
              data.get('warranty', '1 year'), data.get('is_oem', 0)))
        conn.commit()
        pid = c.lastrowid
        conn.close()
        return jsonify({"success": True, "id": pid}), 201
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 400

@app.route('/api/parts/<int:part_id>', methods=['PUT'])
def update_part(part_id):
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    part = c.execute("SELECT * FROM spare_parts WHERE id = ?", (part_id,)).fetchone()
    if not part:
        conn.close()
        return jsonify({"error": "Part not found"}), 404

    allowed = ['name', 'brand', 'price', 'original_price', 'description', 'warranty']
    updates = []
    params = []
    for field in allowed:
        if field in data:
            updates.append(f"{field} = ?")
            params.append(data[field])

    if updates:
        params.append(part_id)
        c.execute(f"UPDATE spare_parts SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/parts/<int:part_id>', methods=['DELETE'])
def delete_part(part_id):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM stock WHERE part_id = ?", (part_id,))
    c.execute("DELETE FROM spare_parts WHERE id = ?", (part_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ─── RESERVATIONS (Admin) ──────────────────────────────────────────
@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    conn = get_db()
    rows = conn.execute('''
        SELECT r.*, sp.name as part_name, sp.part_number, sh.name as shop_name, sh.city
        FROM reservations r
        JOIN spare_parts sp ON r.part_id = sp.id
        JOIN shops sh ON r.shop_id = sh.id
        ORDER BY r.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify({"reservations": rows_to_list(rows)})

@app.route('/api/reservations/<int:res_id>', methods=['PUT'])
def update_reservation(res_id):
    data = request.get_json()
    status = data.get('status')
    if status not in ['pending', 'confirmed', 'completed', 'cancelled']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db()
    c = conn.cursor()
    res = c.execute("SELECT * FROM reservations WHERE id = ?", (res_id,)).fetchone()
    if not res:
        conn.close()
        return jsonify({"error": "Not found"}), 404

    # If cancelling, restore stock
    if status == 'cancelled' and row_to_dict(res)['status'] != 'cancelled':
        c.execute(
            "UPDATE stock SET quantity = quantity + ? WHERE part_id = ? AND shop_id = ?",
            (res['quantity'], res['part_id'], res['shop_id'])
        )

    c.execute("UPDATE reservations SET status = ? WHERE id = ?", (status, res_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    init_db()
    # Seed if DB is empty
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) as c FROM spare_parts").fetchone()['c']
    conn.close()
    if count == 0:
        from seed_data import seed
        seed()
    print("🚀 SPARE FINDER API running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
