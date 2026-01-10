# 🏪 The Local Loop - Hyperlocal AI-Powered Marketplace

A hyperlocal commerce platform where autonomous AI agents manage vendors, customers, and delivery - reducing costs and increasing local employment.

## 🎯 Project Overview

**Problem We're Solving:**
- Local vendors don't have online reach
- Customers know shops but ordering is manual
- Delivery boys don't get consistent work
- Big apps charge high commissions

**Our Solution:**
- Area-based marketplace (starting with Area 1)
- AI-powered order orchestration
- Fixed ₹10 delivery fee
- Small vendor commission (2-5%)
- Real-time delivery assignment

## 🤖 AI Autonomous Agents

### 1. Area Intelligence Agent ✅ IMPLEMENTED
**Purpose:** Validates whether user belongs to Area 1 (service area)

**AI Logic:**
- Pincode matching (40% weight)
- Address similarity analysis (30% weight)
- Geolocation clustering (30% weight)

**Returns:** Approved ✅ / Rejected ❌ / Manual Review ⚠️

### 2. Vendor Optimization Agent (Coming Soon)
- Price suggestions
- Stock alerts
- Demand prediction

### 3. Customer Recommendation Agent (Coming Soon)
- Personalized shop suggestions
- Best offers
- Frequently bought items

### 4. Order Orchestration Agent (Coming Soon)
- Vendor selection
- Delivery assignment
- Route optimization

### 5. Delivery Assignment Agent (Coming Soon)
- Auto-assigns orders to delivery partners
- Distance + availability scoring

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ (for frontend & backend)
- Python 3.9+ (for AI agents)
- PostgreSQL 14+ (for database)
- OpenAI API key

### 1. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. AI Agents Setup (Python + FastAPI)
```bash
cd ai-agents
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Start AI agents service
python main.py
# Runs at http://localhost:8000
```

### 3. Backend Setup (Node.js + Express)
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Configure database connection

npm start
# Runs at http://localhost:5000
```

### 4. Database Setup (PostgreSQL)
```bash
# Create database
createdb local_loop

# Run migrations
psql local_loop < database/schema.sql
```

## 📁 Project Structure

```
the-local-loop/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   └── Register.jsx    # 6-step sign-up with AI validation
│   │   ├── index.css           # Brand styling (#00a0af)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── ai-agents/            # Python + FastAPI
│   ├── agents/
│   │   └── area_intelligence_agent.py  # AI area validation
│   ├── main.py           # FastAPI server
│   ├── requirements.txt
│   └── .env.example
│
├── backend/              # Node.js + Express
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── server.js
│
├── database/             # PostgreSQL schemas
│   └── schema.sql
│
└── docs/                 # Documentation
```

## 🎨 Design System

**Brand Colors:**
- Primary: `#00a0af` (Teal/Cyan)
- Background: `#ffffff` (White)
- Gradient: `linear-gradient(135deg, #ffffff 0%, #e6f7f9 100%)`

**UI Features:**
- Clean white backgrounds
- Smooth animations
- Mobile responsive
- Emoji icons for better UX
- Progress indicators

## 📝 Sign-Up Flow (6 Steps)

1. **Basic Information** - Name, Email, Phone
2. **Role Selection** - Customer 🛒 / Vendor 🏪 / Delivery 🚴
3. **Address Details** - Street, City, Pincode
4. **AI Area Validation** 🤖 - Automatic verification
5. **Role-Specific Details** - Shop info / Vehicle type
6. **Password Creation** 🔒 - Secure password

## 🧪 Testing the Sign-Up Flow

1. Start frontend: `cd frontend && npm run dev`
2. Start AI agents: `cd ai-agents && python main.py`
3. Open http://localhost:3000/register
4. Fill in the form:
   - Use pincode: `400053` (Area 1 - Andheri West)
   - Address: Any address in Andheri West, Mumbai
5. Watch AI validate your area in real-time!

## 🔑 Environment Variables

### AI Agents (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
SERVICE_PORT=8000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/local_loop
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 👥 Team Roles

### Frontend Developer
- React components
- UI/UX implementation
- State management
- API integration

### Backend Developer
- REST API endpoints
- Authentication
- Business logic
- Database queries

### AI/ML Developer
- AI agents implementation
- OpenAI integration
- Area validation logic
- Recommendation systems

### Database/DevOps
- PostgreSQL setup
- Schema design
- Deployment
- CI/CD pipeline

## 📊 Current Status

✅ **Completed:**
- Project structure
- Frontend sign-up flow with 6 steps
- AI Area Intelligence Agent
- Brand styling (#00a0af)
- Area validation API endpoint
- Mobile responsive design

🚧 **In Progress:**
- Backend API integration
- Database schema implementation
- User authentication

📋 **To Do:**
- Vendor dashboard
- Customer ordering flow
- Delivery partner app
- Order orchestration agent
- Payment integration

## 🏆 Hackathon Pitch

**One-Line Pitch:**
> "We built an AI-powered hyperlocal commerce platform where autonomous agents manage vendors, customers, and delivery — reducing costs and increasing local employment."

**Key Differentiators:**
- ✅ AI-first approach (not just AI-powered)
- ✅ Solves real local problems
- ✅ Social impact (local employment)
- ✅ Scalable by area
- ✅ Low commission model

## 📚 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./database/schema.sql)
- [Team Workflow](./docs/TEAM_WORKFLOW.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Demo

**Live Demo:** Coming soon!

**Video Demo:** Coming soon!

---

**Built with ❤️ for the Hackathon**

**Tech Stack:** React, Node.js, Python, FastAPI, PostgreSQL, OpenAI GPT-4o

**Team:** 4 members (Frontend, Backend, AI/ML, Database/DevOps)