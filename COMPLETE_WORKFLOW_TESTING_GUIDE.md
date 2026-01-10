# 🎯 Complete Workflow Testing Guide

## Overview
This guide will walk you through testing the complete delivery workflow from start to finish.

---

## 📋 Prerequisites

### Required Accounts:
1. **Delivery Partner Account** (Role: DELIVERY)
2. **Vendor Account** (Role: VENDOR) with products
3. **Customer Account** (Role: CUSTOMER)

### Setup:
- Backend running on: `http://localhost:5000`
- Frontend running on: `http://127.0.0.1:3001`
- All three accounts registered and ready

---

## 🔄 Complete Workflow Steps

### **Step 1: Delivery Partner Goes Online** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. Open browser (Browser 1)
2. Go to `http://127.0.0.1:3001`
3. Login with delivery partner credentials
4. You'll be redirected to `/delivery/dashboard`
5. **Check Profile:**
   - See your rating (default: 4.5)
   - See total deliveries count
   - See vehicle info (if set)
   - See working hours (if set)

6. **Set Profile (if not done):**
   - Click "Edit Profile" button
   - Select vehicle type (e.g., "Bike")
   - Enter vehicle number (e.g., "DL01AB1234")
   - Set working hours (e.g., 09:00 AM to 09:00 PM)
   - Click "Save Changes"
   - ✅ Profile updated successfully

7. **Go Online:**
   - Find the availability toggle button (top right)
   - Currently shows: "⚫ Offline"
   - Click the button
   - ✅ Changes to: "🟢 Available"
   - ✅ System marks you as available

**What Happens:**
- `isAvailable` field in database set to `true`
- You can now receive delivery requests
- Pending requests section becomes active

**Verification:**
- Button shows "🟢 Available" (green)
- Pending Requests section shows: "Waiting for you"
- No warning message about being offline

---

### **Step 2: Customer Places Order** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. Open new browser/incognito window (Browser 2)
2. Go to `http://127.0.0.1:3001`
3. Login with customer credentials
4. **Browse & Add to Cart:**
   - Click "Browse Shops"
   - Select a vendor/shop
   - Browse products
   - Click "Add to Cart" on products
   - ✅ Items added to cart

5. **Go to Checkout:**
   - Click cart icon (shows item count)
   - Review cart items
   - Click "Proceed to Checkout"

6. **Place Order:**
   - Enter delivery address (e.g., "123 Main Street, Apartment 4B")
   - Select payment method (COD is default)
   - Review order summary
   - Click "Place Order"

**Expected Results:**

**IF Delivery Partner is Available (Online):**
- ✅ Success message: "Order placed successfully! A delivery partner has been notified."
- ✅ Order created in database
- ✅ Delivery request created (status: PENDING)
- ✅ Stock reduced for products
- ✅ Redirected to orders page after 3 seconds

**IF No Delivery Partner Available (Offline):**
- ❌ Error message: "No delivery partner is currently available. Please try again later or contact the vendor directly."
- ❌ Order NOT created
- ❌ Stock NOT reduced
- ❌ Customer stays on checkout page

**Verification:**
- Check customer's "My Orders" page
- Should see new order with status "PENDING"
- Order should have delivery address
- Total amount = items total + ₹10 delivery fee

---

### **Step 3: Delivery Partner Sees Request** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. Switch back to Browser 1 (Delivery Partner)
2. Dashboard auto-refreshes every 30 seconds
3. **Or manually refresh** the page

**What You Should See:**

**Statistics Cards Updated:**
- "Pending Requests" count increased by 1
- Shows number of available delivery requests

**Pending Delivery Requests Section:**
- New order card appears
- Shows:
  ```
  New Request                    ₹10
  
  Pickup:
  [Vendor Shop Name]
  
  Deliver to:
  [Customer Name]
  [Delivery Address]
  
  Items: 3 | Total: ₹500
  
  [Accept]  [Reject]
  ```

**Click on Card for Details:**
- Modal opens showing:
  - **Pickup Location:**
    - Vendor shop name
    - Shop address
    - Contact person name
    - Phone number (clickable)
  
  - **Delivery Location:**
    - Customer name
    - Delivery address
    - Phone number (clickable)
  
  - **Items to Deliver:**
    - List of all products
    - Quantities
    - Prices
  
  - **Payment Information:**
    - Order total
    - Delivery fee
    - Total to collect from customer
    - Your earning: ₹10

**Verification:**
- Request card visible in grid
- All information displayed correctly
- Accept and Reject buttons present
- Modal opens on click

---

### **Step 4: Delivery Partner Accepts** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. In delivery partner dashboard
2. Find the pending request
3. **Option A: Quick Accept**
   - Click "Accept" button on card
   - ✅ Confirmation: "Delivery accepted successfully!"

4. **Option B: Detailed Accept**
   - Click on card to open modal
   - Review all details
   - Click "✓ Accept Delivery" button
   - ✅ Confirmation: "Delivery accepted successfully!"

**What Happens:**
- Delivery status changes: PENDING → ACCEPTED
- Order status changes: PENDING → ACCEPTED_BY_DELIVERY
- Delivery partner ID assigned to delivery
- `acceptedAt` timestamp recorded
- Request disappears from "Pending Requests"
- Request appears in "Active Deliveries"

**Verification:**
- "Pending Requests" count decreased by 1
- "Active Deliveries" count increased by 1
- Order visible in "Active Deliveries" section
- Shows three columns:
  1. Pickup info (vendor)
  2. Delivery info (customer)
  3. Order details & actions

---

### **Step 5: Delivery Partner Goes to Vendor** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. In "Active Deliveries" section
2. Find your accepted delivery
3. **Review Pickup Information:**
   - Vendor shop name
   - Shop address
   - Contact person
   - Phone number (click to call)

4. **Go to Vendor Location** (in real scenario)
5. **Mark as Picked Up:**
   - Click "✓ Mark as Picked Up" button
   - ✅ Confirmation: "Marked as picked up successfully!"

**What Happens:**
- Delivery status changes: ACCEPTED → PICKED_UP
- Order status changes: ACCEPTED_BY_DELIVERY → OUT_FOR_DELIVERY
- `pickupTime` timestamp recorded
- Button changes to "✓ Complete Delivery"

**Verification:**
- Status badge shows "PICKED_UP" (blue)
- Button text changed
- Order still in "Active Deliveries"
- Pickup time recorded in database

---

### **Step 6: Vendor Confirms Pickup** ⏳

**Status:** PENDING IMPLEMENTATION

**What Needs to be Implemented:**

**Backend API:**
```javascript
// POST /api/orders/:orderId/confirm-pickup
// Vendor confirms delivery partner picked up order
```

**Vendor UI:**
- Show orders with status "OUT_FOR_DELIVERY"
- Show delivery partner information
- Button: "Confirm Pickup"
- Confirmation modal

**Workflow:**
1. Vendor sees order status changed to "OUT_FOR_DELIVERY"
2. Delivery partner arrives at shop
3. Vendor hands over order
4. Vendor clicks "Confirm Pickup"
5. System records vendor confirmation
6. Delivery partner can proceed to customer

**Database Changes:**
- Add `vendorConfirmedPickup` boolean field to Delivery model
- Add `vendorConfirmedAt` timestamp

**This step is OPTIONAL** - Current flow works without it, but adds extra verification.

---

### **Step 7: Delivery to Customer** ✅

**Status:** FULLY IMPLEMENTED

**How to Test:**
1. In "Active Deliveries" section
2. Find delivery with "PICKED_UP" status
3. **Review Delivery Information:**
   - Customer name
   - Delivery address
   - Phone number (click to call)
   - Amount to collect

4. **Go to Customer Location** (in real scenario)
5. **Deliver Order:**
   - Hand over products to customer
   - Collect payment (if COD)

6. **Complete Delivery:**
   - Click "✓ Complete Delivery" button
   - Popup asks: "Has the customer paid (COD)?"
   - Click "OK" if payment received
   - ✅ Confirmation: "Delivery completed! ₹10 earned."

**What Happens:**
- Delivery status changes: PICKED_UP → DELIVERED
- Order status changes: OUT_FOR_DELIVERY → DELIVERED
- Payment status changes: pending → completed
- `deliveryTime` timestamp recorded
- Delivery partner's `totalDeliveries` count increased
- Earnings updated (+₹10)
- Delivery removed from "Active Deliveries"

**Verification:**
- "Active Deliveries" count decreased by 1
- "Today's Earnings" increased by ₹10
- "Total Earnings" increased by ₹10
- "Today's Deliveries" count increased by 1
- Order visible in delivery history

---

## 🧪 Complete Test Scenario

### **Full End-to-End Test:**

**Setup (5 minutes):**
1. Register 3 accounts (customer, vendor, delivery partner)
2. Vendor adds products
3. Delivery partner sets profile

**Test Flow (10 minutes):**

```
Time    | Actor              | Action                           | Expected Result
--------|--------------------|---------------------------------|------------------
00:00   | Delivery Partner   | Login & go online               | Status: 🟢 Available
00:30   | Customer           | Browse shops                    | See products
01:00   | Customer           | Add 3 items to cart             | Cart count: 3
01:30   | Customer           | Go to checkout                  | See order summary
02:00   | Customer           | Enter address & place order     | Success message
02:05   | Delivery Partner   | Refresh dashboard               | See new request
02:30   | Delivery Partner   | Click on request card           | Modal opens
03:00   | Delivery Partner   | Review details                  | All info visible
03:30   | Delivery Partner   | Click "Accept Delivery"         | Moves to active
04:00   | Delivery Partner   | Review pickup location          | Vendor info shown
04:30   | Delivery Partner   | Click "Mark as Picked Up"       | Status: PICKED_UP
05:00   | Delivery Partner   | Review delivery location        | Customer info shown
05:30   | Delivery Partner   | Click "Complete Delivery"       | Confirm payment
06:00   | Delivery Partner   | Confirm payment received        | Delivery completed
06:05   | Delivery Partner   | Check earnings                  | +₹10 earned
06:10   | Customer           | Check "My Orders"               | Status: DELIVERED
```

---

## ✅ Verification Checklist

### **After Each Step:**

**Step 1 - Delivery Partner Online:**
- [ ] Profile shows correct information
- [ ] Availability toggle works
- [ ] Status shows "🟢 Available"
- [ ] No offline warning message

**Step 2 - Customer Places Order:**
- [ ] Order created successfully
- [ ] Delivery request created
- [ ] Stock reduced
- [ ] Customer sees order in "My Orders"

**Step 3 - Delivery Partner Sees Request:**
- [ ] Request appears in dashboard
- [ ] All information visible
- [ ] Modal opens with full details
- [ ] Phone numbers are clickable

**Step 4 - Delivery Partner Accepts:**
- [ ] Request moves to active deliveries
- [ ] Status updated correctly
- [ ] Timestamps recorded
- [ ] Counts updated

**Step 5 - Mark as Picked Up:**
- [ ] Status changes to PICKED_UP
- [ ] Order status updated
- [ ] Button text changes
- [ ] Pickup time recorded

**Step 7 - Complete Delivery:**
- [ ] Delivery completed
- [ ] Earnings updated
- [ ] Order status: DELIVERED
- [ ] Payment status: completed
- [ ] Counts updated

---

## 🐛 Common Issues & Solutions

### **Issue 1: "No delivery partner available"**
**Solution:** Make sure delivery partner is online (🟢 Available)

### **Issue 2: Request not showing**
**Solution:** Refresh dashboard or wait 30 seconds for auto-refresh

### **Issue 3: Can't accept delivery**
**Solution:** Check if another partner already accepted it

### **Issue 4: Button not working**
**Solution:** Check browser console for errors, verify backend is running

### **Issue 5: CORS errors**
**Solution:** Backend CORS is configured for localhost:3001 and 127.0.0.1:3001

---

## 📊 Database Verification

### **Check Order Status:**
```sql
SELECT id, status, paymentStatus, createdAt 
FROM orders 
ORDER BY createdAt DESC 
LIMIT 5;
```

### **Check Delivery Status:**
```sql
SELECT d.id, d.status, d.acceptedAt, d.pickupTime, d.deliveryTime,
       o.id as orderId, u.name as deliveryPartner
FROM deliveries d
JOIN orders o ON d.orderId = o.id
LEFT JOIN users u ON d.deliveryPartnerId = u.id
ORDER BY d.createdAt DESC
LIMIT 5;
```

### **Check Delivery Partner Earnings:**
```sql
SELECT u.name, dp.totalDeliveries, dp.rating, dp.isAvailable
FROM delivery_profiles dp
JOIN users u ON dp.userId = u.id;
```

---

## 🎯 Success Criteria

**All Steps Working When:**
- ✅ Delivery partner can go online/offline
- ✅ Customer can place order only when delivery partner available
- ✅ Delivery partner sees request immediately
- ✅ Accept/Reject functionality works
- ✅ Pickup marking works
- ✅ Delivery completion works
- ✅ Earnings calculated correctly
- ✅ All statuses update properly
- ✅ Database records accurate

---

## 📝 Notes

- **Auto-refresh:** Dashboard refreshes every 30 seconds
- **Manual refresh:** Press F5 or Cmd+R to refresh immediately
- **Phone numbers:** Click to initiate call (if device supports)
- **Timestamps:** All actions are timestamped in database
- **Earnings:** Fixed ₹10 per delivery
- **Payment:** COD is default, online payment can be added later

---

## 🚀 Next Steps

After verifying all steps work:
1. Add vendor pickup confirmation (Step 6)
2. Implement real-time notifications
3. Add rating system
4. Add delivery history page
5. Add analytics dashboard

---

**Last Updated:** 2026-01-10
**Version:** 1.0
**Status:** Steps 1-5 and 7 Complete, Step 6 Pending