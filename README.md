# Ghareswad 🍲
### Ghar ka Khana, Aapke Paas

A **MERN stack** home-chef marketplace — like Zomato but for home mothers.  
Customers browse dishes, add to cart, and place orders. Chefs upload dishes, track orders, and see earnings.

---

## 🗂️ Project Structure
```
d:\IPM\
├── backend/          Express + MongoDB API
│   ├── src/
│   │   ├── config/   db.js, multer.js
│   │   ├── models/   User.js, Dish.js, Order.js
│   │   ├── middleware/ auth.js (JWT)
│   │   ├── controllers/ authController, dishController, orderController
│   │   └── routes/   auth.js, dishes.js, orders.js
│   ├── uploads/      Dish photos (local storage)
│   ├── .env          ← YOU MUST EDIT THIS
│   └── server.js
└── frontend/         Vite + React SPA
    └── src/
        ├── api/      Axios service
        ├── context/  AuthContext (JWT)
        ├── components/ Navbar
        └── pages/    LoginPage, CustomerPage, ChefPage
```

---

## ⚙️ Setup – Step by Step

### Step 1 — MongoDB Atlas (Free)
1. Go to **https://cloud.mongodb.com**
2. Create a free account → New Project → Build a Cluster (M0 Free)
3. Create a DB user (username + password)
4. Under **Network Access** → Add IP → **0.0.0.0/0** (allow all)
5. Click **Connect** → **Drivers** → copy the connection string
6. Open `backend/.env` and replace `MONGO_URI`:
```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/ghareswad?retryWrites=true&w=majority
```

### Step 2 — Run the Backend
```powershell
cd d:\IPM\backend
npm run dev
```
You should see: `✅ MongoDB connected` and `🍲 Ghareswad server running on http://localhost:5000`

### Step 3 — Run the Frontend
```powershell
cd d:\IPM\frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register customer or chef |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/dishes` | — | List all available dishes |
| POST | `/api/dishes` | Chef | Upload new dish (multipart) |
| GET | `/api/dishes/my` | Chef | Get my dishes |
| PATCH | `/api/dishes/:id/toggle` | Chef | Toggle availability |
| DELETE | `/api/dishes/:id` | Chef | Delete dish |
| POST | `/api/orders` | Customer | Place order from cart |
| GET | `/api/orders/my` | Customer | My order history |
| GET | `/api/orders/chef` | Chef | Orders received |
| GET | `/api/orders/chef/stats` | Chef | Earnings & order counts |
| PATCH | `/api/orders/:id/status` | Chef | Update order status |

---

## 🎨 Features
- ✅ Role-based login (Customer / Chef)
- ✅ JWT authentication (7-day token)
- ✅ Dish upload with photo (stored in `uploads/`)
- ✅ Customer dish grid with search & location filter
- ✅ Cart with quantity controls + 5% GST billing
- ✅ One-click order placement
- ✅ Chef dashboard: Orders count, Earnings, Pending, Delivered
- ✅ Order status management (pending → accepted → preparing → delivered)
