# Inventory & Order Management System

Full-stack app: **FastAPI** + **React** + **PostgreSQL**, fully containerized with Docker.

---

## Project Structure

```
inventory-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/index.js     # Axios API client
│   │   ├── components/      # Layout + UI components
│   │   └── pages/           # Dashboard, Products, Customers, Orders
│   ├── Dockerfile           # Multi-stage: Vite build → nginx
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
└── .env
```

---

## Option A — Run with Docker Compose (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd inventory-app

# 2. Create environment file (already provided, adjust passwords if needed)
cp .env .env  # or edit .env directly

# 3. Build and start all services (db + backend + frontend)
docker compose up --build

# App is now running:
#   Frontend  →  http://localhost:80
#   Backend   →  http://localhost:8000
#   API Docs  →  http://localhost:8000/docs
```

### Common Docker commands

```bash
# Run in background (detached)
docker compose up --build -d

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Stop and delete volumes (wipes DB data)
docker compose down -v

# Rebuild a single service
docker compose up --build backend

# Shell into backend container
docker compose exec backend bash

# Shell into db container
docker compose exec db psql -U postgres -d inventorydb
```

---

## Option B — Run Locally (No Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# OR: venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variable (point to your local Postgres)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventorydb"

# Create the database first (PostgreSQL must be running)
psql -U postgres -c "CREATE DATABASE inventorydb;"

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API available at: http://localhost:8000
# Swagger docs:     http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set API URL
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev

# App at: http://localhost:5173
```

---

## API Reference

### Products
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /products         | Create product       |
| GET    | /products         | List all products    |
| GET    | /products/{id}    | Get product by ID    |
| PUT    | /products/{id}    | Update product       |
| DELETE | /products/{id}    | Delete product       |

### Customers
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /customers        | Create customer      |
| GET    | /customers        | List all customers   |
| GET    | /customers/{id}   | Get customer by ID   |
| DELETE | /customers/{id}   | Delete customer      |

### Orders
| Method | Endpoint                   | Description        |
|--------|----------------------------|--------------------|
| POST   | /orders                    | Create order       |
| GET    | /orders                    | List all orders    |
| GET    | /orders/{id}               | Get order by ID    |
| DELETE | /orders/{id}               | Cancel order       |
| GET    | /orders/dashboard/stats    | Dashboard stats    |

---

## Example API Calls (curl)

```bash
# Create a product
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","sku":"LAP-001","price":999.99,"quantity":50}'

# Create a customer
curl -X POST http://localhost:8000/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Ravi Kumar","email":"ravi@example.com","phone":"+91 9876543210"}'

# Create an order (deducts stock automatically)
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":2}]}'

# Dashboard stats
curl http://localhost:8000/orders/dashboard/stats
```

---

## Deployment

### Backend → Render / Railway

1. Push `backend/` folder to GitHub
2. On Render: New → Web Service → connect repo
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add env var: `DATABASE_URL` → your Render Postgres internal URL
3. Add a Postgres database on Render (free tier) → copy Internal Database URL

### Frontend → Vercel / Netlify

1. Push `frontend/` folder to GitHub
2. On Vercel: New Project → import repo
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add env var: `VITE_API_URL` → your deployed backend URL

### Docker Hub (for backend image)

```bash
# Build image
docker build -t yourusername/inventory-backend:latest ./backend

# Push to Docker Hub
docker login
docker push yourusername/inventory-backend:latest
```

---

## Business Logic Summary

| Rule | Implementation |
|------|---------------|
| Unique SKU | DB unique constraint + 400 error on duplicate |
| Unique email | DB unique constraint + 400 error on duplicate |
| Non-negative quantity | Pydantic validator raises 422 |
| Insufficient stock check | Pre-order validation → 400 with clear message |
| Stock deduction | Atomic: order creation deducts stock in same transaction |
| Auto total calculation | Backend sums `price × qty` for all items |
| Cancel order restores stock | DELETE /orders/{id} adds quantity back |
