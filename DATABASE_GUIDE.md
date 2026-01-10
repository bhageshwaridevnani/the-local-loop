# 🗄️ Database Guide - How to Check Your Data

## Your Database Setup

You're using **SQLite** database located at:
```
the-local-loop/backend/prisma/dev.db
```

## 3 Ways to View Your Database

---

## ✅ Method 1: Prisma Studio (EASIEST - Recommended)

Prisma Studio is a visual database browser that comes with Prisma.

### Steps:
```bash
# Open a new terminal
cd the-local-loop/backend

# Launch Prisma Studio
npx prisma studio
```

This will open a browser at `http://localhost:5555` where you can:
- ✅ View all tables (User, Vendor, Product, Order, Delivery)
- ✅ See all records with nice formatting
- ✅ Edit data directly
- ✅ Add new records
- ✅ Delete records
- ✅ Filter and search

**This is the BEST way for beginners!**

---

## ✅ Method 2: SQLite Command Line

Use SQLite's built-in CLI to query the database.

### Steps:
```bash
# Open a new terminal
cd the-local-loop/backend/prisma

# Open the database
sqlite3 dev.db
```

### Useful SQLite Commands:
```sql
-- List all tables
.tables

-- View table structure
.schema users

-- View all users
SELECT * FROM users;

-- View all vendors
SELECT * FROM vendors;

-- View all products
SELECT * FROM products;

-- View all orders
SELECT * FROM orders;

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- View recent registrations
SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10;

-- Exit SQLite
.quit
```

---

## ✅ Method 3: VS Code Extension (If you have it)

If you have the **SQLite Viewer** extension in VS Code:

1. Install extension: "SQLite Viewer" by Florian Klampfer
2. Open `the-local-loop/backend/prisma/dev.db` in VS Code
3. Right-click → "Open Database"
4. Browse tables visually

---

## 📊 Quick Database Queries

### Check if your registration worked:
```bash
cd the-local-loop/backend/prisma
sqlite3 dev.db "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### Check vendor data:
```bash
sqlite3 dev.db "SELECT v.shop_name, v.category, u.name, u.email FROM vendors v JOIN users u ON v.user_id = u.id;"
```

### Check all tables and record counts:
```bash
sqlite3 dev.db "SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'vendors', COUNT(*) FROM vendors
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'deliveries', COUNT(*) FROM deliveries;"
```

---

## 🔧 Database Management Commands

### Reset Database (Delete all data):
```bash
cd the-local-loop/backend
rm prisma/dev.db
npx prisma migrate dev --name init
```

### View Migration History:
```bash
cd the-local-loop/backend
npx prisma migrate status
```

### Generate Prisma Client (after schema changes):
```bash
cd the-local-loop/backend
npx prisma generate
```

---

## 📝 Current Database Schema

### Tables:
1. **users** - All users (customers, vendors, delivery partners)
2. **vendors** - Vendor-specific information
3. **products** - Products sold by vendors
4. **orders** - Customer orders
5. **order_items** - Individual items in orders
6. **deliveries** - Delivery information

### Relationships:
- User → Vendor (one-to-one)
- Vendor → Products (one-to-many)
- User → Orders (one-to-many)
- Order → OrderItems (one-to-many)
- Order → Delivery (one-to-one)

---

## 🎯 Quick Start: View Your Data NOW

**Run this command to see all your registered users:**
```bash
cd the-local-loop/backend && npx prisma studio
```

Then open http://localhost:5555 in your browser! 🚀

---

## 💡 Pro Tips

1. **Keep Prisma Studio open** while developing - it auto-refreshes
2. **Use SQLite Browser** for complex queries
3. **Backup your database** before major changes:
   ```bash
   cp the-local-loop/backend/prisma/dev.db the-local-loop/backend/prisma/dev.db.backup
   ```
4. **Check logs** in your backend terminal to see SQL queries

---

## 🆘 Troubleshooting

### "Database locked" error:
- Close Prisma Studio
- Stop your backend server
- Try again

### Can't find dev.db:
```bash
cd the-local-loop/backend
npx prisma migrate dev --name init
```

### Want to start fresh:
```bash
cd the-local-loop/backend
rm prisma/dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

