# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Automated Installation (Recommended)

### For macOS/Linux:

```bash
# Make the script executable
chmod +x install.sh

# Run the installation script
./install.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Setup database
- ✅ Install all dependencies
- ✅ Configure environment variables
- ✅ Run database migrations
- ✅ Create start scripts

### Start All Services:

```bash
./start-all.sh
```

Or start individually:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - AI Agents
cd ai-agents && source venv/bin/activate && python main.py
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Agents**: http://localhost:8000

## 📝 Manual Installation

If automated installation doesn't work, follow [SETUP.md](./SETUP.md) for detailed manual instructions.

## 🎯 What to Do Next

### For Customer UI Developer:
1. Open `frontend/src/pages/Shops.jsx`
2. Start building the shop browsing interface
3. Test with: http://localhost:3000/shops

### For Vendor/Delivery UI Developer:
1. Create vendor dashboard pages
2. Create delivery partner pages
3. Implement order management

### For Backend Developer:
1. Implement API controllers in `backend/src/controllers/`
2. Add validation middleware
3. Test endpoints with Postman

### For AI Agents Developer:
1. Implement agent logic in `ai-agents/agents/`
2. Create LangGraph workflows
3. Test AI endpoints

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check if ports are available
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :8000  # AI Agents
```

### Database connection issues?
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

### Need help?
Check [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [API Documentation](./docs/API.md) - API endpoints

---

**Ready to build? Let's go! 🚀**