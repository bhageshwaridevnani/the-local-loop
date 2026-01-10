# 🤖 Google Gemini Setup Guide

## ✅ Good News!

Your project now supports **Google Gemini AI** (which has a free tier)!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Gemini API Key (FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Get API Key"**
3. Click **"Create API key in new project"**
4. Copy your API key

**Note:** Gemini has a generous free tier - perfect for testing!

---

### Step 2: Install Dependencies

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Google Generative AI (Gemini)
- Other dependencies

---

### Step 3: Add Your API Key

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents

# Create .env file
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

**Replace `your_actual_api_key_here` with your real API key!**

---

### Step 4: Start the AI Service

```bash
python main.py
```

You should see:
```
🚀 Starting The Local Loop AI Agents Service
✅ Google Gemini API Key found
```

The service runs at: **http://localhost:8000**

---

### Step 5: Test Your Registration Flow

1. **Keep the AI service running** (don't close the terminal)

2. **Open a NEW terminal** and start the frontend:
   ```bash
   cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
   npm run dev
   ```

3. **Open browser:** http://localhost:3000/register

4. **Use test data:**
   - Name: Rajesh Kumar
   - Email: rajesh.kumar@example.com
   - Phone: 9876543210
   - Role: Customer
   - Address: Lokhandwala Complex, Building A-101
   - City: Mumbai
   - Pincode: **400053** ⭐
   - Password: SecurePass123

5. **Watch the magic!** 🎉
   - Step 4 will now show AI validation
   - You'll see: "✅ You're in Area 1!"
   - Confidence score will be displayed

---

## 🎯 What Happens Now?

When you enter your address and click "Next" on Step 3:

1. **Frontend** sends address to AI service
2. **Gemini AI** analyzes:
   - Is the pincode in Area 1? (400053, 400058, 400102)
   - Does the address mention Area 1 landmarks?
   - Is it likely in Andheri West, Mumbai?
3. **AI returns:**
   - ✅ Approved (confidence >= 75%)
   - ❌ Rejected (confidence < 40%)
   - ⚠️ Uncertain (needs manual review)

---

## 🆚 Gemini vs OpenAI

| Feature | Google Gemini | OpenAI GPT-4 |
|---------|--------------|--------------|
| **Free Tier** | ✅ Yes (60 requests/min) | ❌ No |
| **Cost** | Free for testing | $0.01 per 1K tokens |
| **Speed** | Fast | Fast |
| **Quality** | Excellent | Excellent |
| **Setup** | Easy | Easy |

**Recommendation:** Use Gemini for development/testing, consider OpenAI for production.

---

## 🐛 Troubleshooting

### Error: "No API key found"

**Solution:**
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
cat .env
```

Make sure it shows:
```
GEMINI_API_KEY=your_actual_key_here
```

---

### Error: "Import google.generativeai could not be resolved"

**Solution:**
```bash
pip install google-generativeai
```

---

### Frontend still shows "Unable to validate area"

**Checklist:**
1. ✅ Is AI service running? Check http://localhost:8000
2. ✅ Does .env file have GEMINI_API_KEY?
3. ✅ Did you restart the AI service after adding the key?
4. ✅ Is the API key valid? Test at https://makersuite.google.com

---

### AI service won't start

**Solution:**
```bash
# Check Python version (need 3.9+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --upgrade

# Try running with verbose output
python main.py
```

---

## 📊 Testing Different Scenarios

### ✅ Approved (Area 1)
Use pincodes: **400053**, **400058**, **400102**

### ❌ Rejected (Outside Area 1)
Use pincode: **400050** (Bandra)

### ⚠️ Uncertain (Border Area)
Use address near boundaries

---

## 🎉 Success Checklist

- [ ] Got Gemini API key from Google
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Created .env file with GEMINI_API_KEY
- [ ] Started AI service (`python main.py`)
- [ ] Saw "✅ Google Gemini API Key found"
- [ ] Started frontend (`npm run dev`)
- [ ] Tested registration with pincode 400053
- [ ] Saw "✅ You're in Area 1!" message

---

## 💡 Pro Tips

1. **Keep AI service running** in one terminal
2. **Run frontend** in another terminal
3. **Check browser console** for any errors (F12)
4. **Test all 3 roles:** Customer, Vendor, Delivery
5. **Try different pincodes** to see different results

---

## 🔗 Useful Links

- **Get Gemini API Key:** https://makersuite.google.com/app/apikey
- **Gemini Documentation:** https://ai.google.dev/docs
- **Project README:** [README.md](./README.md)
- **Testing Guide:** [TESTING.md](./TESTING.md)

---

**You're all set! Start testing! 🚀**