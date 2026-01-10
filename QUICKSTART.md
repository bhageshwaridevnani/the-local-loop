# 🚀 Quick Start Guide - The Local Loop

Get your project running in 5 minutes!

## ✅ Step 1: Test the Frontend (Sign-Up Flow)

The frontend is **ready to run** right now!

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm install
npm run dev
```

**Open:** http://localhost:3000/register

You'll see a beautiful 6-step sign-up form with:
- ✅ Basic information
- ✅ Role selection (Customer/Vendor/Delivery)
- ✅ Address input
- ✅ AI area validation (will show error until AI service is running)
- ✅ Role-specific details
- ✅ Password creation

**Brand Color:** #00a0af (Teal/Cyan) with white backgrounds

---

## 🤖 Step 2: Start AI Agents (Area Validation)

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your_key_here" > .env

# Start the AI service
python main.py
```

**Runs at:** http://localhost:8000

**Test it:**
```bash
curl -X POST http://localhost:8000/agents/area-validation \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Lokhandwala Complex",
    "pincode": "400053",
    "city": "Mumbai"
  }'
```

---

## 🎯 Step 3: Test the Complete Flow

1. **Frontend running?** ✅ http://localhost:3000
2. **AI agents running?** ✅ http://localhost:8000

Now go to http://localhost:3000/register and:

1. Fill basic info (name, email, phone)
2. Select role (try "Customer")
3. Enter address:
   - Address: "Lokhandwala Complex, Andheri West"
   - City: "Mumbai"
   - Pincode: "400053"
4. Click "Next" → AI will validate your area! 🤖
5. If approved, continue to complete registration

---

## 📊 What's Working Now

✅ **Frontend:**
- Complete 6-step sign-up flow
- Beautiful UI with brand colors
- Form validation
- Progress indicator
- Mobile responsive

✅ **AI Agents:**
- Area Intelligence Agent
- Address validation using OpenAI GPT-4o
- Multi-factor scoring (pincode, address, geolocation)
- Returns: Approved/Rejected/Uncertain

---

## 🔧 Troubleshooting

### Frontend won't start?
```bash
# Make sure you're in the right directory
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend

# Check if package.json exists
ls -la package.json

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### AI agents error?
```bash
# Check if .env file exists
cat .env

# Make sure OpenAI API key is set
echo $OPENAI_API_KEY

# Check Python version (need 3.9+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

### Area validation not working?
- Make sure AI agents service is running at http://localhost:8000
- Check browser console for errors
- Verify OpenAI API key is valid
- Try using pincode "400053" (Area 1 - Andheri West)

---

## 🎨 Customization

### Change Service Area
Edit `/ai-agents/agents/area_intelligence_agent.py`:

```python
self.area_1_config = {
    "name": "Your Area Name",
    "pincodes": ["123456", "123457"],
    "landmarks": ["Landmark 1", "Landmark 2"],
}
```

### Change Brand Color
Edit `/frontend/src/index.css`:

```css
:root {
  --brand-primary: #00a0af;  /* Change this */
}
```

---

## 📝 Next Steps

1. **Backend:** Set up Node.js backend for user registration
2. **Database:** Configure PostgreSQL and run migrations
3. **Authentication:** Implement JWT-based auth
4. **Dashboards:** Create vendor/customer/delivery dashboards

---

## 🆘 Need Help?

Check the main [README.md](./README.md) for detailed documentation.

**Team Members:**
- Frontend: React sign-up flow ✅
- Backend: API endpoints (to do)
- AI/ML: Area validation ✅
- Database: Schema design (to do)

---

**Happy Coding! 🚀**