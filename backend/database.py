import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'sparefinder.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Spare Parts table
    c.execute('''
        CREATE TABLE IF NOT EXISTS spare_parts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            category TEXT NOT NULL,
            vehicle_model TEXT NOT NULL,
            vehicle_make TEXT NOT NULL,
            year_range TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL,
            description TEXT,
            function_desc TEXT,
            specifications TEXT,
            common_problems TEXT,
            maintenance_tips TEXT,
            image_url TEXT,
            weight TEXT,
            dimensions TEXT,
            material TEXT,
            warranty TEXT,
            is_oem INTEGER DEFAULT 1,
            compatible_parts TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Shops table
    c.execute('''
        CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            rating REAL DEFAULT 4.0,
            opening_hours TEXT,
            latitude REAL,
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Stock table
    c.execute('''
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            selling_price REAL NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (part_id) REFERENCES spare_parts(id),
            FOREIGN KEY (shop_id) REFERENCES shops(id)
        )
    ''')

    # Reservations table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reservation_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            part_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (part_id) REFERENCES spare_parts(id),
            FOREIGN KEY (shop_id) REFERENCES shops(id)
        )
    ''')

    # Sales table
    c.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            sale_price REAL NOT NULL,
            sale_date TEXT NOT NULL,
            FOREIGN KEY (part_id) REFERENCES spare_parts(id),
            FOREIGN KEY (shop_id) REFERENCES shops(id)
        )
    ''')

    # Admin table
    c.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")
