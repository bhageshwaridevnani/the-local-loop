# 🚀 Setup Guide - The Local Loop

Complete setup instructions for all team members to get the project running locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

## 🗂️ Project Structure

```
the-local-loop/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma
├── ai-agents/         # Python + FastAPI + LangGraph
└── docs/              # Documentation
```

---

## 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd the-local-loop
```

---

## 2️⃣ Database Setup

### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE localloop;

# Create user (optional)
CREATE USER localloop_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE localloop TO localloop_user;

# Exit
\q
```

---

## 3️⃣ Backend Setup (Node.js)

### Navigate to backend directory
```bash
cd backend
```

### Install dependencies
```bash
npm install
```

### Setup environment variables
```bash
cp .env.example .env
```

### Edit `.env` file with your configuration:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/localloop
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

### Run Prisma migrations
```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Start backend server
```bash
npm run dev
```

Backend should now be running on `http://localhost:5000`

---

## 4️⃣ Frontend Setup (React)

### Open new terminal and navigate to frontend
```bash
cd frontend
```

### Install dependencies
```bash
npm install
```

### Setup environment variables
```bash
cp .env.example .env
```

### Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Start frontend development server
```bash
npm run dev
```

Frontend should now be running on `http://localhost:3000`

---

## 5️⃣ AI Agents Setup (Python)

### Open new terminal and navigate to ai-agents
```bash
cd ai-agents
```

### Create virtual environment
```bash
python -m venv venv
```

### Activate virtual environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Setup environment variables
```bash
cp .env.example .env
```

### Edit `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://username:password@localhost:5432/localloop
BACKEND_URL=http://localhost:5000
PORT=8000
```

### Start AI agents service
```bash
python main.py
```

AI Agents should now be running on `http://localhost:8000`

---

## 6️⃣ Verify Installation

### Check all services are running:

1. **Backend API**: http://localhost:5000/health
2. **Frontend**: http://localhost:3000
3. **AI Agents**: http://localhost:8000/health

### Test the application:

1. Open browser to `http://localhost:3000`
2. Register a new account
3. Login and explore the platform

---

## 🔧 Common Issues & Solutions

### Issue: Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database connection failed

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env files
- Ensure database exists: `psql -U postgres -l`

### Issue: Prisma migration errors

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_schema
```

### Issue: Python packages not installing

**Solution:**
```bash
# Upgrade pip
pip install --upgrade pip

# Install packages one by one
pip install fastapi
pip install uvicorn
# etc.
```

### Issue: Node modules errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Optional: Seed Database with Sample Data

```bash
cd backend
npm run seed
```

This will create:
- Sample areas
- Test vendors
- Sample products
- Demo users

---

## 🎯 Team Member Specific Setup

### Member 1: Customer UI Developer
Focus on:
- `frontend/src/pages/Shops.jsx`
- `frontend/src/pages/ShopDetails.jsx`
- `frontend/src/pages/Cart.jsx`
- `frontend/src/components/`

### Member 2: Vendor & Delivery UI Developer
Focus on:
- Vendor dashboard pages
- Delivery partner pages
- Order management UI

### Member 3: Backend Developer
Focus on:
- `backend/src/routes/`
- `backend/src/controllers/`
- `backend/src/middleware/`
- Database schema

### Member 4: AI Agents Developer
Focus on:
- `ai-agents/agents/`
- `ai-agents/workflows/`
- LangGraph implementation

---

## 🔄 Development Workflow

### 1. Pull latest changes
```bash
git pull origin main
```

### 2. Create feature branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make changes and test

### 4. Commit changes
```bash
git add .
git commit -m "Description of changes"
```

### 5. Push to remote
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request on GitHub

---

## 📚 Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run migrate      # Run database migrations
npx prisma studio    # Open Prisma Studio (DB GUI)
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### AI Agents
```bash
python main.py       # Start AI agents service
pip freeze > requirements.txt  # Update dependencies
```

---

## 🐛 Debugging Tips

### Enable detailed logging

**Backend (.env):**
```env
NODE_ENV=development
DEBUG=*
```

**Frontend:**
- Open browser DevTools (F12)
- Check Console and Network tabs

**AI Agents:**
- Check terminal output
- Add print statements for debugging

---

## 🎓 Learning Resources

- **React**: https://react.dev/
- **Express.js**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **LangGraph**: https://langchain-ai.github.io/langgraph/

---

## 💬 Need Help?

- Check existing issues on GitHub
- Ask in team chat
- Review documentation in `/docs` folder
- Check API documentation at `/api/docs` (when backend is running)

---

## ✅ Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Prisma migrations run
- [ ] Backend server running (port 5000)
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Frontend server running (port 3000)
- [ ] Python virtual environment created
- [ ] AI agents dependencies installed
- [ ] AI agents .env configured
- [ ] AI agents server running (port 8000)
- [ ] All health checks passing
- [ ] Can register and login

---

**Happy Coding! 🚀**

*Last updated: 2026-01-10*