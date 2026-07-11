# GearUp — Sports & Outdoor Gear Rental Platform

GearUp is a backend API for a peer-to-peer sports and outdoor gear rental platform (an "Airbnb for sports gear"). It allows **Customers** to browse and rent gear, **Providers** to list and manage their gear inventory, and **Admins** to oversee the platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT (JSON Web Tokens)
- **Payments:** Stripe / SSLCommerz

## User Roles

| Role | Description |
|------|--------------|
| Customer | Browses gear, places rental orders, makes payments, leaves reviews |
| Provider | Lists gear, manages inventory, handles incoming rental orders |
| Admin | Manages users, oversees all gear listings and rental orders |

## Rental Status Flow

```
PLACED → CONFIRMED / CANCELLED → PAID → PICKED_UP → RETURNED
```

## Project Structure

```
src/
├── config/           # Prisma client, environment config
├── errors/           # Custom AppError class, global error handler
├── middlewares/       # auth, validateRequest, etc.
├── utils/             # catchAsync, sendResponse
└── modules/
    ├── auth/
    ├── category/
    ├── gearItem/
    ├── rentalOrder/
    ├── payment/
    ├── provider/
    ├── review/
    └── admin/
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation

```bash
git clone <repo-url>
cd gearup
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gearup"
PORT=5000
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

# Payment gateway (choose one)
STRIPE_SECRET_KEY=your_stripe_secret_key
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run the Server

```bash
npm run dev
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/auth/register | Register new user (customer/provider) |
| POST | /api/auth/login | Login user, return JWT |
| GET | /api/auth/me | Get current authenticated user |

### Gear (Public)

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/gear | Get all gear with filters (category, price, brand) |
| GET | /api/gear/:id | Get gear details |
| GET | /api/categories | Get all gear categories |

### Rental Orders

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/rentals | Create new rental order |
| GET | /api/rentals | Get user's rental orders |
| GET | /api/rentals/:id | Get rental order details |

### Payments

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/payments/create | Create a payment intent/session for a rental order |
| POST | /api/payments/confirm | Confirm/verify payment (webhook or callback) |
| GET | /api/payments | Get user's payment history |
| GET | /api/payments/:id | Get payment details |

### Provider Management

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/provider/gear | Add gear to inventory |
| PUT | /api/provider/gear/:id | Update gear listing |
| DELETE | /api/provider/gear/:id | Remove gear from inventory |
| GET | /api/provider/orders | Get provider's incoming orders |
| PATCH | /api/provider/orders/:id | Update rental order status |

### Reviews

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | /api/reviews | Create review (after rental return) |
| GET | /api/reviews/gear/:gearItemId | Get reviews for a gear item |

### Admin

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | /api/admin/users | Get all users |
| PATCH | /api/admin/users/:id | Update user status (suspend/activate) |
| GET | /api/admin/gear | Get all gear listings |
| GET | /api/admin/rentals | Get all rental orders |

## Error Handling

All errors are handled centrally through a custom `AppError` class (`src/errors/AppError.ts`) and a global error handler, returning consistent error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here"
}
```

## Validation

All request bodies are validated using **Zod** schemas via a `validateRequest` middleware before reaching the controller layer.

## Author

Built by Shiblo as a university/course backend assignment project.
