# SPARE FINDER – AI-Powered Spare Substitution & Availability System

**Technology for Social Good** · B.Tech IT Final Year Project

SPARE FINDER is a modern, responsive full-stack automobile spare-parts platform designed to combat counterfeit components, reduce vehicle maintenance costs, and connect vehicle owners with verified local spare parts retailers.

---

## 🌟 Key Features

1. **Intelligent Part Search**: Multi-filter catalog search by part name, part number, brand, vehicle make/model, and category.
2. **AI Spare Substitution Engine**: Smart cross-referencing to find 100% compatible OEM and aftermarket alternatives with physical fit validation and customer savings percentage calculation.
3. **Know Your Spare**: Comprehensive technical specifications, part functions, common failure symptoms, and maintenance tips.
4. **Image OCR Recognition**: Upload photos of parts or part labels to extract part numbers using Tesseract OCR and automatically match them against database inventory.
5. **Nearby Shop Availability**: Real-time stock levels, addresses, phone numbers, and ratings across automotive retail partners.
6. **Zero-Payment Reservation**: 48-hour reserve-and-collect workflow generating unique reservation tokens without requiring upfront credit card details.
7. **Admin Analytics Dashboard**:
   - Executive KPIs: Total Parts, Partner Shops, Active Reservations, Gross Revenue, Low-Stock Warnings.
   - Interactive Recharts: Monthly Sales Revenue AreaChart & Category Demand BarChart.
   - Live Inventory & Reservation Management with status updates and restock controls.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6
- **Backend**: Python 3.13, Flask REST API, Flask-CORS, Werkzeug, Pillow, PyTesseract
- **Database**: SQLite3 (`backend/sparefinder.db`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python database.py
python seed_data.py
python app.py
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔐 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## 📄 License
MIT License
