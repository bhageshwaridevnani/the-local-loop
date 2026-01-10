# 🧪 How to Test The Local Loop

## 📋 What's Currently Working

✅ **Registration System** with AI Area Validation
✅ **Vertex AI** running on port 8000
✅ **Area-based Database Schema** designed

---

## 🚀 Quick Start Testing

### Prerequisites Check

1. **Check if AI Service is Running:**
   ```bash
   curl http://localhost:8000
   ```
   Expected: Should return a response (not "connection refused")

2. **Check if Frontend is Running:**
   ```bash
   curl http://localhost:5173
   ```
   Expected: Should return HTML (not "connection refused")

---

## 🧪 Test 1: Registration with Valid Address (Should PASS ✅)

### Step 1: Start Services

**Terminal 1 - AI Service:**
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
python main.py
```
You should see:
```
🤖 Using Google Vertex AI (GCP)
✅ GCP Project: the-local-loop-483914
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm run dev
```
You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Step 2: Test Registration via Browser

1. **Open Browser:** http://localhost:5173

2. **Fill Registration Form:**

   **Step 1 - Basic Info:**
   - Name: `Raj Patel`
   - Email: `raj.test@example.com`
   - Phone: `9876543210`
   - Click "Next"

   **Step 2 - Select Role:**
   - Choose: `Customer` (or Vendor/Delivery)
   - Click "Next"

   **Step 3 - Address:**
   - Address: `352/353, Silver Oak University, Gota Gam`
   - City: `Ahmedabad`
   - Pincode: `382481`
   - Click "Validate Area"

   **Expected Result:** ✅
   ```
   ✅ Welcome! You're in our service area: Gota, Ahmedabad
   ```

   **Step 4 - Role Details:**
   - If Customer: Skip
   - If Vendor: Enter shop name
   - If Delivery: Enter vehicle details
   - Click "Next"

   **Step 5 - Password:**
   - Password: `Test@123`
   - Confirm: `Test@123`
   - Click "Complete Registration"

   **Expected Result:** ✅
   ```
   Registration successful!
   ```

---

## 🧪 Test 2: Registration with Invalid Address (Should FAIL ❌)

### Test with Mumbai Address

**Step 3 - Address:**
- Address: `123, Andheri West`
- City: `Mumbai`
- Pincode: `400053`
- Click "Validate Area"

**Expected Result:** ❌
```
❌ Sorry, we're not in your area yet. We'll notify you when we expand!
```

**Why?** Because only Gota, Ahmedabad (382481) is configured as valid area.

---

## 🧪 Test 3: API Testing (Without Browser)

### Test Area Validation API

**Valid Address (Gota, Ahmedabad):**
```bash
curl -X POST http://localhost:8000/agents/area-validation \
  -H "Content-Type: application/json" \
  -d '{
    "address": "352/353, Silver Oak University, Gota Gam",
    "pincode": "382481",
    "city": "Ahmedabad"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "status": "approved",
    "confidence": 0.85,
    "message": "Welcome! You're in our service area: Gota, Ahmedabad",
    "area_name": "Gota, Ahmedabad",
    "scores": {
      "pincode": 1.0,
      "address": 1.0,
      "geolocation": 0.5
    }
  }
}
```

**Invalid Address (Mumbai):**
```bash
curl -X POST http://localhost:8000/agents/area-validation \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123, Andheri West",
    "pincode": "400053",
    "city": "Mumbai"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "status": "rejected",
    "confidence": 0.9,
    "message": "Sorry, we're not in your area yet...",
    "area_name": "Gota, Ahmedabad"
  }
}
```

---

## 🧪 Test 4: Different Roles

### Test Customer Registration
- Role: Customer
- Address: Gota, Ahmedabad
- Expected: ✅ Approved

### Test Vendor Registration
- Role: Vendor
- Shop Name: `Fresh Vegetables`
- Shop Category: `Grocery`
- Address: Gota, Ahmedabad
- Expected: ✅ Approved

### Test Delivery Registration
- Role: Delivery
- Vehicle Type: `Bike`
- Vehicle Number: `GJ01AB1234`
- Address: Gota, Ahmedabad
- Expected: ✅ Approved

---

## 🧪 Test 5: Check Terminal Logs

### AI Service Terminal Should Show:

**Successful Validation:**
```
INFO: 127.0.0.1:xxxxx - "POST /agents/area-validation HTTP/1.1" 200 OK
```

**CORS Working:**
```
INFO: 127.0.0.1:xxxxx - "OPTIONS /agents/area-validation HTTP/1.1" 200 OK
```

### Frontend Terminal Should Show:

**Development Server Running:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🐛 Troubleshooting

### Problem 1: "Failed to fetch" Error

**Symptoms:**
- Frontend shows: `Area validation error: TypeError: Failed to fetch`

**Solution:**
```bash
# Check if AI service is running
curl http://localhost:8000

# If not running, start it:
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
python main.py
```

### Problem 2: "Cannot GET /" on localhost:5173

**Symptoms:**
- Browser shows: "This site can't be reached"

**Solution:**
```bash
# Check if frontend is running
curl http://localhost:5173

# If not running, start it:
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm install  # First time only
npm run dev
```

### Problem 3: "npm: command not found"

**Symptoms:**
- Terminal shows: `/bin/sh: npm: command not found`

**Solution:**
```bash
# Install Node.js first
brew install node

# Then try again
npm run dev
```

### Problem 4: AI Service Shows "API key not valid"

**Symptoms:**
- Terminal shows: `400 API key not valid`

**Solution:**
- Check `.env` file has correct `GCP_PROJECT_ID`
- Check `gcp-key.json` exists in `ai-agents/` folder
- Restart AI service

---

## ✅ Success Checklist

Before demo, verify:

- [ ] AI service running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can register with Gota, Ahmedabad address ✅
- [ ] Cannot register with Mumbai address ❌
- [ ] All 3 roles work (Customer, Vendor, Delivery)
- [ ] Terminal shows 200 OK responses
- [ ] No CORS errors in browser console

---

## 📊 Test Results Table

| Test Case | Address | Expected | Status |
|-----------|---------|----------|--------|
| Valid - Gota | 352/353, Silver Oak University, 382481 | ✅ Approved | ✅ |
| Invalid - Mumbai | 123, Andheri West, 400053 | ❌ Rejected | ✅ |
| Valid - Gota Circle | Gota Circle, Ahmedabad, 382481 | ✅ Approved | ✅ |
| Invalid - Surat | Any address, Surat | ❌ Rejected | ✅ |

---

## 🎥 Demo Script

### For Hackathon Judges:

1. **Show Registration:**
   - "Let me register as a customer in Gota, Ahmedabad"
   - Fill form with valid address
   - Show AI validation success ✅

2. **Show Area Restriction:**
   - "Now let me try with a Mumbai address"
   - Fill form with Mumbai address
   - Show AI rejection ❌
   - "This ensures only local users can register"

3. **Show Different Roles:**
   - Register as Vendor
   - Register as Delivery
   - "All must be in Gota to participate"

4. **Explain Architecture:**
   - Show `AREA_BASED_ARCHITECTURE.md`
   - Explain area_id concept
   - Show database schema

---

## 📞 Quick Commands Reference

```bash
# Start AI Service
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
python main.py

# Start Frontend
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm run dev

# Test API
curl -X POST http://localhost:8000/agents/area-validation \
  -H "Content-Type: application/json" \
  -d '{"address":"352/353, Silver Oak University","pincode":"382481","city":"Ahmedabad"}'

# Check Services
curl http://localhost:8000  # AI Service
curl http://localhost:5173  # Frontend
```

---

**You're ready to test and demo! 🚀**