# 🏪 The Local Loop

**AI-Powered Hyperlocal Commerce Platform**

A revolutionary hyperlocal marketplace connecting local vendors, customers, and delivery partners through AI autonomous agents. Built for hackathon with focus on solving real local commerce problems.

## 🎯 Problem Statement

- Local vendors lack online presence
- Manual ordering is inefficient
- Delivery partners need consistent work
- High commission fees on existing platforms

## 💡 Solution

An AI-first hyperlocal platform where:
- **Area-based commerce** (one specific locality at a time)
- **AI Autonomous Agents** manage order orchestration, vendor optimization, and delivery assignment
- **Three user roles**: Vendors, Customers, Delivery Partners
- **Transparent pricing**: Fixed ₹10 delivery fee, low vendor commission

## 🤖 AI Agents Architecture

### 1. Area Intelligence Agent
- Validates user locality
- Prevents cross-area ordering
- Auto-expands to new areas

### 2. Vendor Optimization Agent
- Price suggestions based on demand
- Stock refill alerts
- Offer recommendations

### 3. Customer Recommendation Agent
- Personalized shop suggestions
- Best offers based on location & time
- Frequently bought items

### 4. Order Orchestration Agent (Core)
- Auto-assigns vendors based on availability & distance
- Intelligent delivery partner matching
- Real-time decision making

### 5. Delivery Assignment Agent
- Optimal route planning
- Performance-based assignment
- Availability tracking

### 6. Finance & Settlement Agent
- Daily earnings calculation
- Fraud detection
- Revenue prediction

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Redux
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcrypt
- **Payments**: Razorpay
- **Real-time**: Socket.io
- **Validation**: Joi

### Database
- **Primary DB**: PostgreSQL 15
- **Cache**: Redis
- **ORM**: Prisma / Sequelize

### AI Layer
- **LLM**: OpenAI GPT-4o
- **Agent Framework**: LangGraph / CrewAI
- **Language**: Python 3.11+
- **Vector DB**: FAISS (optional)

## 📁 Project Structure

```
the-local-loop/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Context providers
│   │   ├── services/     # API services
│   │   ├── utils/        # Helper functions
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Custom middleware
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Entry point
│   ├── prisma/           # Database schema
│   └── package.json
│
├── ai-agents/            # Python AI agents
│   ├── agents/           # Individual agents
│   ├── tools/            # Agent tools
│   ├── workflows/        # LangGraph workflows
│   ├── main.py           # Entry point
│   └── requirements.txt
│
└── docs/                 # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis (optional for caching)

### Installation

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd the-local-loop
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

#### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

#### 4. Setup AI Agents
```bash
cd ai-agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/localloop
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
REDIS_URL=redis://localhost:6379
AI_AGENT_URL=http://localhost:8000
```

### AI Agents (.env)
```
OPENAI_API_KEY=your-openai-key
DATABASE_URL=postgresql://user:password@localhost:5432/localloop
BACKEND_URL=http://localhost:5000
```

## 👥 User Roles

### 1. Customer
- Browse local shops
- Search products by category/brand
- Add items to cart
- Place orders
- Track delivery
- Rate vendors & delivery partners

### 2. Vendor
- Manage product inventory
- Update prices & stock
- Receive orders
- Track earnings
- View analytics

### 3. Delivery Partner
- View available orders
- Accept delivery requests
- Update delivery status
- Track earnings
- View performance metrics

## 📊 Database Schema

### Core Tables
- **users** (id, name, email, role, area_id, phone)
- **vendors** (id, user_id, shop_name, address, commission_rate)
- **products** (id, vendor_id, name, brand, price, stock, category)
- **orders** (id, customer_id, vendor_id, delivery_id, status, total)
- **order_items** (id, order_id, product_id, quantity, price)
- **deliveries** (id, order_id, delivery_partner_id, status, pickup_time)
- **areas** (id, name, pincode, active)

## 🎨 Customer UI Features (Your Focus)

### Shop Browsing
- Grid/List view of local shops
- Filter by category, rating, distance
- Search functionality
- Shop details with product catalog

### Product Display
- Product cards with image, name, brand, price
- Stock availability indicator
- Add to cart button
- Quick view modal

### Shopping Cart
- Cart summary with item count
- Quantity adjustment
- Remove items
- Price breakdown (items + delivery)
- Checkout button

### Order Placement
- Delivery address confirmation
- Payment method selection
- Order summary
- Place order confirmation

## 🛠️ Development Workflow

### Team Division (4 Members)

**Member 1: Customer UI (Your Focus)**
- Shop listing page
- Product catalog
- Cart functionality
- Order placement flow

**Member 2: Vendor & Delivery UI**
- Vendor dashboard
- Inventory management
- Delivery partner app
- Order tracking

**Member 3: Backend API**
- REST API endpoints
- Authentication & authorization
- Database models
- Payment integration

**Member 4: AI Agents**
- Agent development
- Order orchestration logic
- Recommendation system
- Analytics & insights

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `GET /api/products/vendor/:vendorId` - Get vendor products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/vendors/products` - Add product

## 🏆 Hackathon Presentation Tips

### Demo Flow
1. Show area validation (AI)
2. Customer browses shops
3. Add items to cart
4. Place order
5. AI assigns vendor & delivery partner (show logs)
6. Track order in real-time
7. Show vendor & delivery dashboards
8. Display analytics & AI insights

### Key Talking Points
- **Real problem solving** for local communities
- **AI autonomy** in decision making
- **Social impact** (local employment)
- **Scalability** (area-by-area expansion)
- **Low cost** (transparent pricing)

## 📈 Future Enhancements

- WhatsApp bot for vendors
- Voice ordering for customers
- Offline-first vendor UI
- Demand heatmap
- Multi-language support
- Subscription plans for frequent users

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - feel free to use for hackathon and beyond!

## 👨‍💻 Team

- **Member 1**: Customer UI Development
- **Member 2**: Vendor & Delivery UI
- **Member 3**: Backend API Development
- **Member 4**: AI Agents Development

---

**Built with ❤️ for local communities**

*Empowering local vendors, one area at a time* 🚀