# 🍽️ Restaurant Backend API

Node.js + Express + MongoDB backend for menu and order management.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your MongoDB URI
   ```

3. **Run in development**
   ```bash
   npm run dev
   ```

4. **Run in production**
   ```bash
   npm start
   ```

---

## API Reference

### 🥗 Menu — `/api/menu`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=mains` | Filter by category |
| GET | `/api/menu?available=true` | Filter by availability |
| GET | `/api/menu/:id` | Get single item |
| POST | `/api/menu` | Create menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |
| PATCH | `/api/menu/:id/availability` | Toggle availability |

**Categories:** `starters`, `mains`, `sides`, `desserts`, `drinks`, `specials`

**Create/Update body:**
```json
{
  "name": "Jollof Rice",
  "description": "Rich tomato-based rice dish",
  "price": 2500,
  "category": "mains",
  "image": "https://...",
  "available": true,
  "tags": ["spicy", "popular"]
}
```

---

### 📦 Orders — `/api/orders`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders?status=pending` | Filter by status |
| GET | `/api/orders?type=dine-in` | Filter by type |
| GET | `/api/orders?date=2024-01-15` | Filter by date |
| GET | `/api/orders/stats` | Today's summary stats |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Place new order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Cancel order |

**Order statuses:** `pending` → `confirmed` → `preparing` → `ready` → `delivered` / `cancelled`

**Order types:** `dine-in`, `takeaway`, `delivery`

**Place order body:**
```json
{
  "items": [
    { "menuItem": "<menuItemId>", "quantity": 2, "notes": "Extra spicy" }
  ],
  "type": "dine-in",
  "tableNumber": 5,
  "customerName": "John Doe",
  "customerPhone": "08012345678",
  "notes": "Allergy: nuts"
}
```

**Update status body:**
```json
{ "status": "preparing" }
```

---

### ❤️ Health Check

```
GET /api/health
```

---

## Notes

- Prices are always resolved from the DB when placing orders (client prices are never trusted)
- Tax rate is 7.5% (configurable in `orderController.js`)
- Order numbers are auto-generated: `ORD-0001`, `ORD-0002`, etc.
