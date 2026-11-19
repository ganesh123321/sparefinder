import sqlite3
import os
import uuid
import random
from database import get_db, init_db, DB_PATH

def seed():
    # Remove existing DB for fresh seed
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    init_db()

    conn = get_db()
    c = conn.cursor()

    # ── SPARE PARTS ──────────────────────────────────────────────
    parts = [
        ("OIL-FILT-001", "Engine Oil Filter", "Bosch", "Filters", "Swift, Alto, WagonR", "Maruti Suzuki", "2010-2024", 350, 420,
         "High-performance oil filter that removes contaminants from engine oil.",
         "Filters engine oil to remove metal particles, dirt, and sludge, protecting engine components.",
         '{"thread_size":"M20x1.5","height":"90mm","diameter":"76mm","filter_efficiency":"98%"}',
         "Reduced oil pressure, engine knocking, dirty exhaust smoke",
         "Replace every 10,000 km or 6 months. Use genuine oil for best results.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "250g", "90x76mm", "Steel/Paper", "1 year", 1,
         "OIL-FILT-002,OIL-FILT-003"),

        ("OIL-FILT-002", "Universal Oil Filter", "Mann-Filter", "Filters", "Swift, Baleno, Ciaz", "Maruti Suzuki", "2015-2024", 290, 420,
         "Universal fit oil filter compatible with multiple Maruti models.",
         "Filters engine oil efficiently with synthetic filter media.",
         '{"thread_size":"M20x1.5","height":"87mm","diameter":"76mm","filter_efficiency":"96%"}',
         "Oil leaks, excessive oil consumption",
         "Replace every 10,000 km with oil change.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "240g", "87x76mm", "Steel/Synthetic", "1 year", 0,
         "OIL-FILT-001,OIL-FILT-003"),

        ("OIL-FILT-003", "Premium Oil Filter", "Purolator", "Filters", "Innova, Fortuner, Hilux", "Toyota", "2010-2024", 480, 550,
         "Heavy-duty oil filter for Toyota diesel and petrol engines.",
         "Advanced filtration for high-performance and commercial vehicles.",
         '{"thread_size":"M20x1.5","height":"102mm","diameter":"83mm","filter_efficiency":"99%"}',
         "Oil pressure drop, engine overheating",
         "Replace every 15,000 km for diesel engines.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "290g", "102x83mm", "Steel/Glass Fiber", "2 years", 1,
         "OIL-FILT-001"),

        ("BRAKE-PAD-001", "Front Disc Brake Pad Set", "Brembo", "Brakes", "City, Amaze, Jazz", "Honda", "2014-2024", 1200, 1500,
         "High-performance ceramic brake pads for Honda City front disc brakes.",
         "Converts kinetic energy to heat via friction to slow the vehicle. Provides consistent stopping power.",
         '{"type":"ceramic","thickness":"12mm","width":"120mm","height":"55mm","slots":"yes"}',
         "Squealing noise, reduced braking efficiency, brake fade, vibration",
         "Inspect every 20,000 km. Replace when thickness < 3mm. Bed in new pads gradually.",
         "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400", "800g", "120x55x12mm", "Ceramic Composite", "1 year", 1,
         "BRAKE-PAD-002,BRAKE-PAD-003"),

        ("BRAKE-PAD-002", "Semi-Metallic Brake Pad", "Minda", "Brakes", "City, Amaze, CR-V", "Honda", "2012-2024", 850, 1500,
         "Semi-metallic brake pads for reliable stopping performance.",
         "Provides strong braking force with good heat dissipation.",
         '{"type":"semi-metallic","thickness":"11mm","width":"118mm","height":"53mm"}',
         "Brake noise, uneven wear",
         "Replace every 30,000-40,000 km. Check rotor condition simultaneously.",
         "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400", "750g", "118x53x11mm", "Semi-Metallic", "6 months", 0,
         "BRAKE-PAD-001,BRAKE-PAD-003"),

        ("BRAKE-PAD-003", "Rear Brake Pad Set", "TVS Girling", "Brakes", "i20, Creta, Verna", "Hyundai", "2015-2024", 950, 1200,
         "OEM-spec rear brake pads for Hyundai vehicles.",
         "Delivers precise braking pressure for rear wheel stopping.",
         '{"type":"ceramic","thickness":"10mm","width":"110mm","height":"50mm"}',
         "Grinding noise, long stopping distance",
         "Replace every 40,000 km. Inspect brake fluid level.",
         "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400", "680g", "110x50x10mm", "Ceramic", "1 year", 1,
         "BRAKE-PAD-001,BRAKE-PAD-002"),

        ("SPARK-PLG-001", "Iridium Spark Plug", "NGK", "Ignition", "Swift, Alto, Baleno", "Maruti Suzuki", "2010-2024", 450, 600,
         "Long-life iridium spark plugs for superior ignition performance.",
         "Creates the electrical spark that ignites the air-fuel mixture in combustion chamber.",
         '{"heat_range":"5","thread":"M14x1.25","reach":"19mm","gap":"0.9mm","electrode":"iridium"}',
         "Hard starting, misfires, poor fuel economy, rough idle",
         "Replace every 80,000-100,000 km. Never overtighten. Check gap before installation.",
         "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400", "50g", "M14x19mm", "Iridium/Ceramic", "80,000 km", 1,
         "SPARK-PLG-002,SPARK-PLG-003"),

        ("SPARK-PLG-002", "Double Platinum Spark Plug", "Denso", "Ignition", "City, Jazz, Brio", "Honda", "2011-2024", 380, 600,
         "Platinum tip spark plugs for consistent ignition.",
         "Provides reliable spark under high compression conditions.",
         '{"heat_range":"20","thread":"M14x1.25","reach":"19mm","gap":"1.1mm","electrode":"platinum"}',
         "Engine misfires, increased fuel consumption",
         "Replace every 60,000 km. Inspect ignition coil simultaneously.",
         "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400", "48g", "M14x19mm", "Platinum/Ceramic", "60,000 km", 1,
         "SPARK-PLG-001,SPARK-PLG-003"),

        ("SPARK-PLG-003", "Standard Copper Spark Plug", "Champion", "Ignition", "Innova, Fortuner", "Toyota", "2005-2020", 180, 300,
         "Reliable copper core spark plugs for older Toyota engines.",
         "Classic copper electrode for consistent spark delivery.",
         '{"heat_range":"14","thread":"M14x1.25","reach":"26mm","gap":"0.8mm","electrode":"copper"}',
         "Rough idle, poor acceleration, failed emissions test",
         "Replace every 20,000-30,000 km. Part of routine tune-up.",
         "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400", "45g", "M14x26mm", "Copper/Ceramic", "30,000 km", 0,
         "SPARK-PLG-001"),

        ("AIR-FILT-001", "Engine Air Filter", "K&N", "Filters", "Fortuner, Innova Crysta", "Toyota", "2016-2024", 2200, 2800,
         "High-flow washable cotton gauze air filter for maximum performance.",
         "Prevents dust and debris from entering the engine while maximizing airflow.",
         '{"type":"washable","flow_rate":"high","filtration":"99%","dimensions":"320x235x50mm"}',
         "Reduced acceleration, black exhaust smoke, poor fuel economy",
         "Clean every 30,000 km with K&N filter cleaner. Replace every 100,000 km.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "400g", "320x235x50mm", "Cotton Gauze", "Million miles", 0,
         "AIR-FILT-002"),

        ("AIR-FILT-002", "Paper Air Filter", "Bosch", "Filters", "Swift, Baleno, Ertiga", "Maruti Suzuki", "2010-2024", 350, 420,
         "OEM-replacement paper air filter for Maruti engines.",
         "Standard paper filtration for engine air intake system.",
         '{"type":"disposable","filtration":"98%","dimensions":"280x200x40mm"}',
         "Engine knocking, excessive fuel consumption",
         "Replace every 15,000 km or when dirty. Do not wash paper filters.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "250g", "280x200x40mm", "Pleated Paper", "15,000 km", 1,
         "AIR-FILT-001"),

        ("BATT-001", "Car Battery 55Ah", "Exide", "Electrical", "City, Amaze, Jazz", "Honda", "2014-2024", 4500, 5000,
         "Maintenance-free calcium battery with 55Ah capacity.",
         "Provides electrical power to start the engine and powers all electrical systems.",
         '{"capacity":"55Ah","voltage":"12V","CCA":"500A","type":"AGM","terminal":"top"}',
         "Slow cranking, electrical failures, warning light",
         "Check terminals every 6 months. Replace every 3-4 years. Avoid deep discharge.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "15kg", "242x175x190mm", "Lead Acid/AGM", "3 years", 1,
         "BATT-002"),

        ("BATT-002", "Car Battery 45Ah", "Amaron", "Electrical", "Alto, WagonR, Swift", "Maruti Suzuki", "2010-2022", 3800, 4200,
         "High-performance 45Ah battery with silver alloy technology.",
         "Start-stop compatible battery for small to medium vehicles.",
         '{"capacity":"45Ah","voltage":"12V","CCA":"400A","type":"EFB","terminal":"top"}',
         "Battery not holding charge, dim headlights",
         "Keep terminals clean and tight. Charge if unused for 2+ weeks.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "12kg", "207x175x190mm", "Lead Acid/EFB", "4 years", 1,
         "BATT-001"),

        ("WIPER-001", "Front Wiper Blade Set", "Bosch", "Wipers", "i20, Creta, Verna", "Hyundai", "2015-2024", 650, 800,
         "Aerodynamic flat wiper blades for streak-free wiping.",
         "Clears rain, dust, and debris from windshield for safe visibility.",
         '{"driver_side":"650mm","passenger_side":"400mm","type":"flat","connection":"hook"}',
         "Streaking, skipping, chatter, reduced visibility",
         "Replace every 12 months or when streaking. Clean blades monthly.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "300g", "650+400mm", "Natural Rubber", "1 year", 1,
         "WIPER-002"),

        ("WIPER-002", "Universal Wiper Blade", "Trico", "Wipers", "Swift, Alto, Baleno, City", "Multi-brand", "2010-2024", 450, 800,
         "Universal fit wiper blades with multi-adapter system.",
         "Provides reliable windshield clearing in various weather conditions.",
         '{"length":"550mm","type":"traditional","connection":"multi-adapter"}',
         "Poor contact with windshield, noise during operation",
         "Replace every 6-12 months. Use windshield washer fluid.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "250g", "550mm", "EPDM Rubber", "6 months", 0,
         "WIPER-001"),

        ("COOLANT-001", "Engine Coolant 1L", "Shell", "Fluids", "All Vehicles", "Universal", "2000-2024", 320, 400,
         "Long-life OAT coolant for all petrol and diesel engines.",
         "Regulates engine temperature, prevents freezing and boiling, inhibits corrosion.",
         '{"type":"OAT","dilution":"50:50","boiling_point":"130°C","freezing_point":"-37°C","volume":"1L"}',
         "Engine overheating, coolant leaks, white exhaust smoke",
         "Replace every 2 years or 40,000 km. Never mix coolant types.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "1.1kg", "1L bottle", "Ethylene Glycol", "2 years", 0,
         "COOLANT-002"),

        ("COOLANT-002", "Engine Coolant 5L", "Havoline", "Fluids", "All Vehicles", "Universal", "2000-2024", 1400, 1600,
         "5-litre antifreeze coolant for extended cooling system life.",
         "Provides superior corrosion protection for aluminum components.",
         '{"type":"IAT","dilution":"ready-to-use","boiling_point":"128°C","volume":"5L"}',
         "Corrosion in cooling system, thermostat failure",
         "Flush cooling system before adding new coolant. Check hoses for cracks.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "5.5kg", "5L bottle", "Ethylene Glycol", "2 years", 0,
         "COOLANT-001"),

        ("BELT-001", "Timing Belt Kit", "Gates", "Engine", "City, Jazz, Amaze", "Honda", "2008-2018", 2800, 3500,
         "Complete timing belt kit with belt, tensioner, and idler pulley.",
         "Synchronizes crankshaft and camshaft rotation to ensure correct valve timing.",
         '{"length":"142 teeth","width":"25mm","material":"HNBR","includes":"tensioner,idler"}',
         "Engine noise, rough running, engine failure (if belt breaks)",
         "Replace every 90,000 km or 5 years. Never reuse old timing belt.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "600g", "Kit", "HNBR Rubber", "90,000 km", 1,
         "BELT-002"),

        ("BELT-002", "Serpentine Drive Belt", "Continental", "Engine", "Swift, Ertiga, Ciaz", "Maruti Suzuki", "2012-2024", 850, 1100,
         "Multi-rib serpentine belt for auxiliary drive systems.",
         "Drives alternator, power steering pump, AC compressor, and water pump.",
         '{"ribs":"6","length":"1800mm","type":"EPDM","width":"21mm"}',
         "Squealing noise, battery not charging, AC failure, overheating",
         "Inspect every 30,000 km. Replace every 60,000-80,000 km or if cracked.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "350g", "1800x21mm", "EPDM Rubber", "80,000 km", 1,
         "BELT-001"),

        ("SHOCK-001", "Front Shock Absorber", "Monroe", "Suspension", "i20, Creta", "Hyundai", "2015-2024", 3200, 4000,
         "Gas-charged front shock absorber for superior ride control.",
         "Controls spring oscillation and maintains tire contact with road surface.",
         '{"type":"twin-tube gas","stroke":"165mm","compressed_length":"340mm","extended_length":"505mm"}',
         "Excessive bouncing, nose dive under braking, uneven tire wear",
         "Replace in pairs every 50,000-80,000 km. Check mounting hardware.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "3.2kg", "505x60mm", "Steel/Aluminum", "2 years", 1,
         "SHOCK-002"),

        ("SHOCK-002", "Rear Shock Absorber", "Gabriel", "Suspension", "City, Amaze", "Honda", "2014-2022", 2400, 3200,
         "Ultra gas rear shock absorber for Honda City/Amaze.",
         "Maintains vehicle stability and passenger comfort over rough roads.",
         '{"type":"monotube gas","stroke":"145mm","compressed_length":"320mm"}',
         "Vehicle sway, uneven wear, knocking sounds from rear",
         "Inspect boot seal for cracks. Replace when leaking or bouncy.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "2.8kg", "465x55mm", "Steel", "2 years", 1,
         "SHOCK-001"),

        ("FUELP-001", "Fuel Pump Assembly", "Bosch", "Fuel System", "Swift, Baleno, Vitara Brezza", "Maruti Suzuki", "2015-2024", 4800, 6000,
         "Complete fuel pump module with sender unit.",
         "Delivers pressurized fuel from tank to fuel injectors at correct pressure.",
         '{"flow_rate":"60L/hr","pressure":"3.5 bar","voltage":"12V","includes":"sender_unit"}',
         "Engine stalling, difficulty starting, fuel pressure loss",
         "Replace fuel filter every 30,000 km. Use quality fuel to extend pump life.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "800g", "Kit", "Steel/Plastic", "1 year", 1,
         "FUELP-002"),

        ("FUELP-002", "Fuel Pump Module", "Delphi", "Fuel System", "City, Amaze, CR-V", "Honda", "2012-2024", 4200, 6000,
         "High-pressure fuel pump module for Honda fuel injection systems.",
         "Maintains constant fuel rail pressure for precise fuel delivery.",
         '{"flow_rate":"55L/hr","pressure":"3.8 bar","voltage":"12V"}',
         "Engine hesitation, poor fuel economy, check engine light",
         "Only use recommended fuel octane rating. Avoid running tank empty.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "750g", "Module", "Steel/Polymer", "1 year", 1,
         "FUELP-001"),

        ("RADIAT-001", "Radiator Assembly", "Denso", "Cooling", "Innova Crysta, Fortuner", "Toyota", "2016-2024", 8500, 10000,
         "Full aluminum core radiator for Toyota diesel engines.",
         "Dissipates engine heat by passing coolant through aluminum fins.",
         '{"core_type":"aluminum","rows":"2","width":"650mm","height":"400mm","inlet":"38mm","outlet":"38mm"}',
         "Engine overheating, coolant leaks, steam from hood",
         "Flush every 2 years. Check for bent fins. Keep free of debris.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "5kg", "650x400x28mm", "Aluminum/Plastic", "2 years", 1,
         "RADIAT-002"),

        ("RADIAT-002", "Radiator Core", "Modine", "Cooling", "City, Civic, CR-V", "Honda", "2012-2022", 6500, 10000,
         "Replacement radiator for Honda vehicles with aluminum construction.",
         "High-efficiency heat exchange for petrol Honda engines.",
         '{"core_type":"aluminum","rows":"1","width":"580mm","height":"360mm"}',
         "Overheating, coolant loss, corrosion",
         "Check hose connections during oil changes. Replace if severely corroded.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "4kg", "580x360x26mm", "Aluminum", "1 year", 0,
         "RADIAT-001"),

        ("ALTERN-001", "Alternator 70A", "Bosch", "Electrical", "Swift, Alto, WagonR", "Maruti Suzuki", "2010-2024", 5500, 7000,
         "Remanufactured 70A alternator for Maruti K-series engines.",
         "Charges the battery and powers electrical systems while engine is running.",
         '{"output":"70A","voltage":"14V","rotation":"CW","pulley":"6-groove"}',
         "Battery warning light, dim lights, dead battery",
         "Check belt tension every 30,000 km. Test output voltage at 14V.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "4.5kg", "165x135mm", "Aluminum/Copper", "1 year", 0,
         "ALTERN-002"),

        ("ALTERN-002", "Alternator 90A", "Valeo", "Electrical", "City, Civic, Accord", "Honda", "2012-2024", 7200, 9000,
         "High-output 90A alternator for Honda petrol engines.",
         "Powers heavy electrical loads including AC, audio, and charging systems.",
         '{"output":"90A","voltage":"14.4V","rotation":"CW","pulley":"7-groove"}',
         "Electrical system failures, overcharging or undercharging",
         "Inspect brushes and bearings every 60,000 km.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "5kg", "180x145mm", "Aluminum/Copper", "1 year", 0,
         "ALTERN-001"),

        ("THERM-001", "Engine Thermostat 82°C", "Gates", "Cooling", "Swift, Baleno, Ertiga", "Maruti Suzuki", "2010-2024", 280, 350,
         "Precision thermostat for optimal engine operating temperature.",
         "Regulates coolant flow to maintain ideal engine temperature of 82°C.",
         '{"opening_temp":"82°C","full_open_temp":"97°C","diameter":"54mm","type":"wax"}',
         "Engine overheating or running too cold, heater not working",
         "Replace whenever the cooling system is opened. Use fresh gasket.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "150g", "54mm dia", "Brass/Rubber", "2 years", 1,
         "THERM-002"),

        ("THERM-002", "Engine Thermostat 88°C", "Wahler", "Cooling", "City, Amaze, Jazz", "Honda", "2014-2024", 320, 420,
         "OEM-spec thermostat for Honda VTEC engines.",
         "Controls engine warm-up time and maintains fuel efficiency.",
         '{"opening_temp":"88°C","full_open_temp":"103°C","diameter":"46mm"}',
         "Engine taking long to warm up, poor fuel economy",
         "Always replace housing gasket/O-ring with thermostat.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "140g", "46mm dia", "Brass/Rubber", "2 years", 1,
         "THERM-001"),

        ("CABIN-001", "Cabin Air Filter", "Mann-Filter", "Filters", "i20, Creta, Tucson", "Hyundai", "2015-2024", 580, 700,
         "HEPA cabin air filter with activated carbon layer.",
         "Filters dust, pollen, bacteria, and exhaust gases from cabin air.",
         '{"type":"carbon","dimensions":"245x190x25mm","filtration":"99.5%","particle_size":"0.3 micron"}',
         "Weak AC airflow, musty smell inside cabin, allergies",
         "Replace every 15,000 km or 1 year. Inspect before monsoon season.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "180g", "245x190x25mm", "HEPA/Carbon", "1 year", 0,
         "CABIN-002"),

        ("CABIN-002", "Pollen Filter", "Bosch", "Filters", "Swift, Baleno, Brezza", "Maruti Suzuki", "2015-2024", 420, 700,
         "Standard pollen cabin filter for Maruti AC systems.",
         "Removes airborne allergens and particles from cabin ventilation.",
         '{"type":"pollen","dimensions":"220x175x20mm","filtration":"98%"}',
         "Reduced AC performance, foul odor",
         "Replace every year or when AC efficiency drops.",
         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "150g", "220x175x20mm", "Pleated Paper", "1 year", 0,
         "CABIN-001"),
    ]

    c.executemany('''
        INSERT OR IGNORE INTO spare_parts
        (part_number, name, brand, category, vehicle_model, vehicle_make, year_range,
         price, original_price, description, function_desc, specifications, common_problems,
         maintenance_tips, image_url, weight, dimensions, material, warranty, is_oem, compatible_parts)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', parts)

    # ── SHOPS ─────────────────────────────────────────────────────
    shops = [
        ("AutoZone Spares", "No. 12, Industrial Area Phase 1", "Chennai", "Tamil Nadu", "044-28561234", "autozone@gmail.com", 4.5, "Mon-Sat 9AM-8PM", 13.0827, 80.2707),
        ("Sharma Auto Parts", "Shop 5, GT Road", "Delhi", "Delhi", "011-23456789", "sharma.auto@gmail.com", 4.2, "Mon-Sun 8AM-9PM", 28.6139, 77.2090),
        ("Patel Spare World", "23, Ring Road", "Ahmedabad", "Gujarat", "079-26543210", "patelspares@gmail.com", 4.3, "Mon-Sat 9AM-7PM", 23.0225, 72.5714),
        ("Mumbai Auto Hub", "Unit 8, MIDC Complex", "Mumbai", "Maharashtra", "022-28956321", "mumbaiautohub@gmail.com", 4.6, "Mon-Sat 8AM-8PM", 19.0760, 72.8777),
        ("Bangalore Spare Mart", "No.45, Hosur Road", "Bangalore", "Karnataka", "080-25874123", "blrsparemart@gmail.com", 4.4, "Mon-Sun 9AM-9PM", 12.9716, 77.5946),
        ("Hyderabad Auto Bazaar", "14, Tolichowki", "Hyderabad", "Telangana", "040-23589632", "hydautobazaar@gmail.com", 4.1, "Mon-Sat 9AM-7PM", 17.3850, 78.4867),
        ("Kolkata Parts Center", "7, BT Road", "Kolkata", "West Bengal", "033-25413698", "klpartscenter@gmail.com", 3.9, "Mon-Sat 9AM-6PM", 22.5726, 88.3639),
        ("Pune Auto Essentials", "Plot 32, Pimpri", "Pune", "Maharashtra", "020-27456321", "puneauto@gmail.com", 4.3, "Mon-Sat 8AM-8PM", 18.5204, 73.8567),
        ("Jaipur Spare House", "Sindhi Camp, Station Road", "Jaipur", "Rajasthan", "0141-2365412", "jaipurspares@gmail.com", 4.0, "Mon-Sat 9AM-7PM", 26.9124, 75.7873),
        ("Coimbatore Car Parts", "Gandhipuram, Race Course Rd", "Coimbatore", "Tamil Nadu", "0422-2456789", "cbecarparts@gmail.com", 4.5, "Mon-Sun 8AM-8PM", 11.0168, 76.9558),
    ]

    c.executemany('''
        INSERT INTO shops (name, address, city, state, phone, email, rating, opening_hours, latitude, longitude)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    ''', shops)

    # ── STOCK ─────────────────────────────────────────────────────
    part_ids = [row[0] for row in c.execute("SELECT id FROM spare_parts").fetchall()]
    shop_ids = [row[0] for row in c.execute("SELECT id FROM shops").fetchall()]
    prices = {row[0]: row[1] for row in c.execute("SELECT id, price FROM spare_parts").fetchall()}

    for part_id in part_ids:
        for shop_id in shop_ids:
            if random.random() > 0.3:  # 70% chance shop has part
                qty = random.randint(2, 50)
                base_price = prices[part_id]
                selling_price = round(base_price * random.uniform(0.95, 1.15), 2)
                c.execute('''
                    INSERT INTO stock (part_id, shop_id, quantity, selling_price)
                    VALUES (?, ?, ?, ?)
                ''', (part_id, shop_id, qty, selling_price))

    # ── SALES (last 6 months) ─────────────────────────────────────
    months = ["2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11"]
    for month in months:
        for _ in range(random.randint(20, 50)):
            part_id = random.choice(part_ids)
            shop_id = random.choice(shop_ids)
            qty = random.randint(1, 10)
            price = prices[part_id] * random.uniform(1.0, 1.1)
            day = random.randint(1, 28)
            sale_date = f"{month}-{day:02d}"
            c.execute('''
                INSERT INTO sales (part_id, shop_id, quantity, sale_price, sale_date)
                VALUES (?, ?, ?, ?, ?)
            ''', (part_id, shop_id, qty, round(price, 2), sale_date))

    # ── ADMIN ─────────────────────────────────────────────────────
    c.execute("INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)", ("admin", "admin123"))

    # ── SAMPLE RESERVATIONS ───────────────────────────────────────
    statuses = ["pending", "confirmed", "completed", "cancelled"]
    names = ["Rahul Sharma", "Priya Patel", "Amit Kumar", "Sunita Rao", "Deepak Verma"]
    phones = ["9876543210", "9123456789", "9988776655", "9871234567", "9765432109"]
    for i in range(10):
        rid = f"RES{random.randint(100000,999999)}"
        part_id = random.choice(part_ids)
        shop_id = random.choice(shop_ids)
        name = names[i % len(names)]
        phone = phones[i % len(phones)]
        status = random.choice(statuses)
        c.execute('''
            INSERT INTO reservations (reservation_id, customer_name, customer_phone, part_id, shop_id, quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (rid, name, phone, part_id, shop_id, random.randint(1,3), status))

    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
