# 🧪 Testing Guide - Customer UI

Complete guide to test the Customer UI pages you've built.

## 🚀 Quick Start Testing

### Step 1: Start the Development Server

```bash
cd the-local-loop/frontend
npm install
npm run dev
```

The frontend will start on: **http://localhost:3000**

---

## 📍 Customer UI Pages & URLs

### 1. **Home Page**
- **URL**: http://localhost:3000/
- **What to see**: Landing page with Login/Register buttons
- **Test**: Click buttons to navigate

### 2. **Register Page**
- **URL**: http://localhost:3000/register
- **What to test**:
  - Fill in registration form
  - Select "Customer" role
  - Submit form
- **Note**: Backend needs to be running for actual registration

### 3. **Login Page**
- **URL**: http://localhost:3000/login
- **What to test**:
  - Enter email and password
  - Submit login form
- **Note**: Backend needs to be running for actual login

### 4. **Browse Shops** ⭐ (Your Main Work)
- **URL**: http://localhost:3000/shops
- **What to see**:
  - Grid of local shops
  - Search bar
  - Category filter dropdown
  - Shop cards with ratings
- **What to test**:
  - Search for shops by name
  - Filter by category
  - Click on a shop card
- **Note**: Requires authentication (login first)

### 5. **Shop Details** ⭐ (Your Main Work)
- **URL**: http://localhost:3000/shops/:id
- **Example**: http://localhost:3000/shops/123
- **What to see**:
  - Shop information (name, address, rating)
  - Product grid
  - Search products
  - Filter by brand
  - Add to cart buttons
- **What to test**:
  - Search products
  - Filter by brand
  - Click "Add to Cart"
  - See cart count increase in navbar
- **Note**: Requires authentication

### 6. **Shopping Cart** ⭐ (Your Main Work)
- **URL**: http://localhost:3000/cart
- **What to see**:
  - List of cart items
  - Quantity controls (+/-)
  - Remove item button
  - Order summary
  - Checkout button
- **What to test**:
  - Increase/decrease quantity
  - Remove items
  - See total update
  - Click "Proceed to Checkout"
- **Note**: Requires authentication

### 7. **My Orders** ⭐ (Your Main Work)
- **URL**: http://localhost:3000/orders
- **What to see**:
  - List of past orders
  - Order status badges
  - Filter tabs (all, pending, delivered, etc.)
- **What to test**:
  - Filter orders by status
  - View order details
- **Note**: Requires authentication

---

## 🎨 Testing Without Backend (Frontend Only)

Since the backend isn't running yet, you can test the UI in two ways:

### Option 1: Mock Data Testing (Recommended for UI Development)

Create a mock data file to test UI without backend:

```bash
# Create mock data file
touch the-local-loop/frontend/src/utils/mockData.js
```

Add this content to `mockData.js`:

```javascript
export const mockShops = [
  {
    id: '1',
    shop_name: 'Fresh Mart',
    address: '123 Main Street',
    category: 'grocery',
    rating: 4.5,
    reviews: 120
  },
  {
    id: '2',
    shop_name: 'Tech Store',
    address: '456 Tech Avenue',
    category: 'electronics',
    rating: 4.8,
    reviews: 85
  },
  {
    id: '3',
    shop_name: 'Fashion Hub',
    address: '789 Style Road',
    category: 'clothing',
    rating: 4.3,
    reviews: 200
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Fresh Milk',
    brand: 'Amul',
    price: 60,
    stock: 50,
    category: 'dairy'
  },
  {
    id: '2',
    name: 'Bread',
    brand: 'Britannia',
    price: 40,
    stock: 30,
    category: 'bakery'
  },
  {
    id: '3',
    name: 'Rice',
    brand: 'India Gate',
    price: 500,
    stock: 100,
    category: 'grains'
  }
];
```

Then temporarily modify your pages to use mock data instead of API calls.

### Option 2: Test with Full Stack Running

```bash
# Terminal 1 - Backend
cd the-local-loop/backend
npm install
npm run dev

# Terminal 2 - Frontend
cd the-local-loop/frontend
npm install
npm run dev
```

---

## 🔍 Visual Testing Checklist

### ✅ Shops Page (`/shops`)
- [ ] Page loads without errors
- [ ] Search bar is visible and functional
- [ ] Category dropdown works
- [ ] Shop cards display properly
- [ ] Shop cards have hover effect
- [ ] Ratings and reviews show correctly
- [ ] "View Products" button works
- [ ] Responsive on mobile/tablet

### ✅ Shop Details Page (`/shops/:id`)
- [ ] Shop header displays correctly
- [ ] Shop info (address, phone, rating) visible
- [ ] Product grid displays
- [ ] Product search works
- [ ] Brand filter works
- [ ] Product cards show price and stock
- [ ] "Add to Cart" button works
- [ ] Cart count updates in navbar
- [ ] Toast notification appears on add to cart

### ✅ Cart Page (`/cart`)
- [ ] Cart items display correctly
- [ ] Product images/icons show
- [ ] Quantity controls work (+/-)
- [ ] Remove button works
- [ ] Subtotal calculates correctly
- [ ] Delivery fee shows (₹10)
- [ ] Total amount is correct
- [ ] "Proceed to Checkout" button visible
- [ ] Empty cart message shows when cart is empty

### ✅ Orders Page (`/orders`)
- [ ] Order list displays
- [ ] Status badges show correct colors
- [ ] Filter tabs work
- [ ] Order details are readable
- [ ] Date formatting is correct
- [ ] Empty state shows when no orders

---

## 🎯 Component Testing

### Test Individual Components:

```bash
# In browser console (F12)
# Check if contexts are working:
localStorage.getItem('cart')  // Should show cart data
localStorage.getItem('token')  // Should show auth token after login
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Solution**: Backend not running or API endpoint doesn't exist yet. Use mock data.

### Issue: "Network Error"
**Solution**: Check if backend is running on port 5000.

### Issue: Cart not persisting
**Solution**: Check browser localStorage in DevTools > Application > Local Storage

### Issue: Protected routes redirect to login
**Solution**: This is correct behavior. Login first to access protected pages.

### Issue: Styles not loading
**Solution**: 
```bash
cd frontend
npm install
# Restart dev server
npm run dev
```

---

## 📱 Responsive Testing

Test on different screen sizes:

1. **Desktop**: Full width (1920px+)
2. **Laptop**: Medium width (1024px)
3. **Tablet**: Small width (768px)
4. **Mobile**: Extra small (375px)

Use Chrome DevTools (F12) > Toggle Device Toolbar (Ctrl+Shift+M)

---

## 🎨 UI/UX Testing Points

### Colors & Theme
- [ ] Primary color (blue) used consistently
- [ ] Secondary color (purple) for accents
- [ ] Success (green), Warning (yellow), Danger (red) badges work
- [ ] Text is readable on all backgrounds

### Typography
- [ ] Headings are clear and hierarchical
- [ ] Body text is readable (not too small)
- [ ] Font weights are appropriate

### Spacing & Layout
- [ ] Consistent padding/margins
- [ ] Cards have proper spacing
- [ ] Grid layouts are balanced
- [ ] No overlapping elements

### Interactions
- [ ] Buttons have hover states
- [ ] Links change color on hover
- [ ] Loading states show when needed
- [ ] Toast notifications appear and disappear

---

## 🚀 Quick Test Commands

```bash
# Start frontend only (for UI testing)
cd the-local-loop/frontend && npm run dev

# Start with backend (for full testing)
# Terminal 1
cd the-local-loop/backend && npm run dev

# Terminal 2
cd the-local-loop/frontend && npm run dev

# Build for production (test if build works)
cd the-local-loop/frontend && npm run build
```

---

## 📊 Browser Testing

Test in multiple browsers:
- ✅ Chrome (primary)
- ✅ Firefox
- ✅ Safari (if on Mac)
- ✅ Edge

---

## 🎥 Demo Flow for Presentation

1. **Start**: Home page → Click Register
2. **Register**: Fill form → Select Customer role → Submit
3. **Login**: Enter credentials → Login
4. **Browse**: View shops grid → Search → Filter
5. **Shop Details**: Click shop → View products → Search products
6. **Add to Cart**: Click "Add to Cart" → See notification → Cart count increases
7. **Cart**: View cart → Adjust quantities → See total update
8. **Checkout**: Click "Proceed to Checkout"
9. **Orders**: View order history → Filter by status

---

## 📝 Testing Notes Template

Use this to document your testing:

```
Date: ___________
Page Tested: ___________
Browser: ___________
Screen Size: ___________

✅ Working:
- 
- 

❌ Issues Found:
- 
- 

💡 Improvements Needed:
- 
- 
```

---

## 🎯 Next Steps After Testing

1. Fix any bugs found
2. Enhance UI based on feedback
3. Add loading skeletons
4. Improve error handling
5. Add animations/transitions
6. Optimize performance
7. Add accessibility features

---

**Happy Testing! 🧪**

Need help? Check the browser console (F12) for error messages.