# 🧪 Testing Guide - The Local Loop Sign-Up Flow

## 🚀 How to Start Testing

### Step 1: Start the Frontend
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm install
npm run dev
```
**Opens at:** http://localhost:3000/register

### Step 2: (Optional) Start AI Agents for Area Validation
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
pip install -r requirements.txt
echo "OPENAI_API_KEY=your_openai_key_here" > .env
python main.py
```
**Note:** Without AI agents running, you can still test steps 1-3 and 5-6. Step 4 (AI validation) will show an error.

---

## 📝 Test Data Sets

### Test Case 1: Customer Registration (Area 1 - APPROVED ✅)

**Step 1: Basic Information**
- Name: `Rajesh Kumar`
- Email: `rajesh.kumar@example.com`
- Phone: `9876543210`

**Step 2: Role Selection**
- Select: **Customer** 🛒

**Step 3: Address**
- Street Address: `Lokhandwala Complex, Building A-101`
- Landmark: `Near Lokhandwala Market`
- City: `Mumbai`
- Pincode: `400053` ⭐ (Area 1 - Will be APPROVED)

**Step 4: AI Validation**
- Should show: ✅ "You're in Area 1!"
- Confidence: ~90-95%

**Step 5: Additional Details**
- (No additional fields for customer)

**Step 6: Password**
- Password: `SecurePass123`
- Confirm Password: `SecurePass123`

---

### Test Case 2: Vendor Registration (Area 1 - APPROVED ✅)

**Step 1: Basic Information**
- Name: `Priya Sharma`
- Email: `priya.shop@example.com`
- Phone: `9876543211`

**Step 2: Role Selection**
- Select: **Vendor** 🏪

**Step 3: Address**
- Street Address: `Versova, Shop No. 15, Main Road`
- Landmark: `Opposite Versova Metro Station`
- City: `Mumbai`
- Pincode: `400053` ⭐ (Area 1)

**Step 4: AI Validation**
- Should show: ✅ "You're in Area 1!"

**Step 5: Additional Details**
- Shop Name: `Priya's Fresh Mart`
- Shop Type: `Grocery Store`

**Step 6: Password**
- Password: `VendorPass123`
- Confirm Password: `VendorPass123`

---

### Test Case 3: Delivery Partner Registration (Area 1 - APPROVED ✅)

**Step 1: Basic Information**
- Name: `Amit Patel`
- Email: `amit.delivery@example.com`
- Phone: `9876543212`

**Step 2: Role Selection**
- Select: **Delivery** 🚴

**Step 3: Address**
- Street Address: `Four Bungalows, Near DN Nagar Metro`
- Landmark: `Behind McDonald's`
- City: `Mumbai`
- Pincode: `400053` ⭐ (Area 1)

**Step 4: AI Validation**
- Should show: ✅ "You're in Area 1!"

**Step 5: Additional Details**
- Vehicle Type: `Bike`

**Step 6: Password**
- Password: `DeliveryPass123`
- Confirm Password: `DeliveryPass123`

---

### Test Case 4: Outside Service Area (REJECTED ❌)

**Step 1: Basic Information**
- Name: `Neha Gupta`
- Email: `neha@example.com`
- Phone: `9876543213`

**Step 2: Role Selection**
- Select: **Customer** 🛒

**Step 3: Address**
- Street Address: `Bandra West, Hill Road`
- Landmark: `Near Linking Road`
- City: `Mumbai`
- Pincode: `400050` ⭐ (Outside Area 1)

**Step 4: AI Validation**
- Should show: ❌ "Not in Service Area"
- Message: "Sorry, we currently only serve Andheri West, Mumbai"

---

### Test Case 5: Edge Case - Uncertain Area (MANUAL REVIEW ⚠️)

**Step 1: Basic Information**
- Name: `Vikram Singh`
- Email: `vikram@example.com`
- Phone: `9876543214`

**Step 2: Role Selection**
- Select: **Vendor** 🏪

**Step 3: Address**
- Street Address: `Oshiwara, Near Link Road`
- Landmark: `Close to Andheri border`
- City: `Mumbai`
- Pincode: `400102` ⭐ (Border area)

**Step 4: AI Validation**
- Should show: ⚠️ "Manual Review Required"
- Message: "We need to manually verify your location"

---

## 🎯 Area 1 Valid Pincodes (Will be APPROVED)

Use these pincodes for successful registration:
- `400053` - Andheri West (Lokhandwala, Versova)
- `400058` - Andheri West (Four Bungalows, DN Nagar)
- `400102` - Andheri West (Oshiwara)

---

## ❌ Test Invalid Inputs

### Invalid Email
- Email: `notanemail` ❌
- Should show: "Please enter a valid email"

### Invalid Phone
- Phone: `123` ❌
- Should show: "Please enter a valid 10-digit phone number"

### Invalid Pincode
- Pincode: `12345` ❌ (5 digits)
- Should show: "Please enter a valid 6-digit pincode"

### Password Mismatch
- Password: `Pass123`
- Confirm Password: `Pass456` ❌
- Should show: "Passwords do not match"

### Weak Password
- Password: `weak` ❌
- Should show: "Password must be at least 8 characters"

---

## 🔍 What to Check During Testing

### Step 1: Basic Information
- ✅ All fields are required
- ✅ Email validation works
- ✅ Phone must be 10 digits
- ✅ Can't proceed without filling all fields

### Step 2: Role Selection
- ✅ Can select only one role
- ✅ Selected card highlights with brand color
- ✅ Hover effect works
- ✅ Can't proceed without selecting a role

### Step 3: Address
- ✅ All required fields validated
- ✅ Pincode must be 6 digits
- ✅ Landmark is optional
- ✅ Clean form layout

### Step 4: AI Validation
- ✅ Shows loading spinner during validation
- ✅ Displays result with confidence score
- ✅ Different messages for approved/rejected/uncertain
- ✅ Can go back to change address if rejected

### Step 5: Role-Specific Details
- ✅ Shows different fields based on role
- ✅ Vendor: Shop name and type required
- ✅ Delivery: Vehicle type required
- ✅ Customer: No additional fields

### Step 6: Password
- ✅ Password strength indicator works
- ✅ Shows green checkmarks for met requirements
- ✅ Passwords must match
- ✅ Minimum 8 characters enforced

### Overall
- ✅ Progress bar updates correctly
- ✅ Step numbers highlight properly
- ✅ Previous button works (except on step 4)
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Brand color (#00a0af) used throughout

---

## 🐛 Known Limitations (Expected Behavior)

1. **AI Validation Error:** If AI agents service is not running, step 4 will show connection error. This is expected.

2. **No Backend:** Registration completes with alert message but doesn't save to database (backend not implemented yet).

3. **No Login:** After registration, there's no login page yet (to be built).

---

## 📸 Expected UI Screenshots

### Step 1: Basic Information
- Clean white form
- Emoji icons (👤 📧 📱)
- Teal input focus borders

### Step 2: Role Selection
- Three cards side by side
- Selected card has teal background
- Hover effect on cards

### Step 3: Address
- Two-column layout for City/Pincode
- All fields with proper labels

### Step 4: AI Validation
- Loading spinner with message
- Success: Green background with ✅
- Rejected: Red background with ❌
- Uncertain: Orange background with ⚠️

### Step 5: Role Details
- Different forms for each role
- Dropdown for shop type/vehicle type

### Step 6: Password
- Password strength checklist
- Green checkmarks for met requirements

---

## 🎉 Success Criteria

**Registration is successful when:**
1. All 6 steps completed
2. Form validation passed
3. Area validation approved (if AI service running)
4. Alert shows: "🎉 Registration successful!"
5. Form data logged to console

---

## 💡 Tips for Testing

1. **Test on different browsers:** Chrome, Firefox, Safari
2. **Test on mobile:** Resize browser window
3. **Test with/without AI service:** See both scenarios
4. **Try all three roles:** Customer, Vendor, Delivery
5. **Test validation errors:** Try invalid inputs
6. **Check console:** Look for any errors

---

## 🆘 Troubleshooting

**Frontend won't start?**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**AI validation always fails?**
- Check if AI service is running at http://localhost:8000
- Verify OpenAI API key in `.env` file
- Check browser console for errors

**Styling looks broken?**
- Clear browser cache
- Check if `index.css` file exists
- Restart dev server

---

**Happy Testing! 🚀**

For questions, check [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md)