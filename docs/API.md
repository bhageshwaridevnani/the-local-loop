# API Documentation - The Local Loop

## Base URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **AI Agents:** http://localhost:8000

---

## AI Agents API

### 1. Area Validation

**Endpoint:** `POST /agents/area-validation`

**Description:** Validates if a user's address is in the service area (Area 1)

**Request Body:**
```json
{
  "address": "Lokhandwala Complex",
  "pincode": "400053",
  "city": "Mumbai",
  "coordinates": {
    "latitude": 19.1334,
    "longitude": 72.8267
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "approved",
    "confidence": 0.92,
    "message": "Great! You're in Andheri West, Mumbai. We deliver to your area!",
    "area_name": "Andheri West, Mumbai",
    "reasoning": "Pincode: 1.00, Address: 0.85, Geo: 0.90",
    "scores": {
      "pincode": 1.0,
      "address": 0.85,
      "geolocation": 0.9
    }
  }
}
```

**Status Values:**
- `approved` - User is in service area (confidence >= 0.75)
- `rejected` - User is outside service area (confidence < 0.4)
- `uncertain` - Manual review needed (0.4 <= confidence < 0.75)

---

## Backend API (To be implemented)

### Authentication

#### Register User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "role": "customer",
  "address": "Lokhandwala Complex",
  "landmark": "Near Metro Station",
  "city": "Mumbai",
  "pincode": "400053",
  "state": "Maharashtra",
  "areaValidation": {
    "status": "approved",
    "confidence": 0.92
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

---

### Vendors

#### Get All Vendors
**Endpoint:** `GET /api/vendors`

**Query Parameters:**
- `area` - Filter by area
- `category` - Filter by shop type
- `isOpen` - Filter by open status

#### Get Vendor Products
**Endpoint:** `GET /api/vendors/:vendorId/products`

---

### Orders

#### Create Order
**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "vendorId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "deliveryAddress": "Full address",
  "deliveryInstructions": "Ring the bell"
}
```

#### Get User Orders
**Endpoint:** `GET /api/orders/user/:userId`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- **AI Agents:** 100 requests per minute per IP
- **Backend:** 1000 requests per hour per user

---

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <jwt_token>
```

---

**For more details, see the main [README.md](../README.md)**
