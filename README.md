# E-Commerce REST API

A comprehensive REST API for an e-commerce platform built with Node.js, Express.js, TypeScript, and PostgreSQL. Features include user authentication, product management, shopping cart, and order processing with persistent pricing.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Admin/Customer)
  - Secure password hashing with bcrypt

- **Product Management**
  - CRUD operations for products (Admin only)
  - Image upload to Cloudinary
  - Category assignment
  - Advanced filtering (category, price range, search)
  - Pagination support

- **Category Management**
  - CRUD operations for categories (Admin only)

- **Shopping Cart**
  - Add/remove/update cart items
  - Persistent cart pricing (price locked when added to cart)
  - Real-time cart total calculation

- **Order Management**
  - Create orders from cart
  - Persistent order pricing (price locked at order time)
  - Order history for customers
  - Admin view of all orders

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API explorer at `/api-docs`

- **Security**
  - Helmet for security headers
  - CORS configuration
  - Input validation with express-validator
  - Environment variable management

- **Testing**
  - Comprehensive test suite with Jest
  - Tests for authentication, products, cart, and orders

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Validation**: express-validator
- **Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Cloudinary account (for image uploads)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interview-projects
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_URL=postgresql://user:password@localhost:5432/ecommerce_db
DB_SSL=false

# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. Set up the database:
```bash
# Run migrations
npm run db:migrate

# (Optional) Seed initial data (creates admin user and sample data)
npm run db:seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Production Mode
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Categories (Admin only for write operations)
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category (Admin)
- `PUT /api/v1/categories/:id` - Update category (Admin)
- `DELETE /api/v1/categories/:id` - Delete category (Admin)

### Products
- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (Admin)
- `PATCH /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Shopping Cart (Authenticated)
- `GET /api/v1/cart` - Get cart items
- `POST /api/v1/cart` - Add item to cart
- `PATCH /api/v1/cart/:id` - Update cart item quantity
- `DELETE /api/v1/cart/:id` - Remove item from cart
- `DELETE /api/v1/cart` - Clear cart

### Orders (Authenticated)
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/all` - List all orders (Admin)
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create order from cart

## Database Migrations

Create a new migration:
```bash
npx sequelize-cli migration:generate --name migration-name
```

Run migrations:
```bash
npm run db:migrate
```

Rollback last migration:
```bash
npm run db:migrate:undo
```

## Database Seeders

Run all seeders:
```bash
npm run db:seed
```

Undo all seeders:
```bash
npm run db:seed:undo
```

**Default Admin User** (created by seeder):
- Email: `admin@example.com`
- Password: `Admin123!`
- Role: `admin`

## Project Structure

```
├── src/
│   ├── config/          # Configuration files (database, JWT, env)
│   ├── database/        # Database models, migrations, seeders, and scripts
│   │   ├── migrations/  # Database migration files
│   │   ├── models/      # Sequelize models
│   │   ├── seeders/     # Database seeders
│   │   ├── run-migrations.ts    # Migration runner script
│   │   ├── undo-migrations.ts   # Migration undo script
│   │   ├── run-seeders.ts       # Seeder runner script
│   │   └── undo-seeders.ts      # Seeder undo script
│   ├── docs/            # Swagger documentation
│   ├── middlewares/     # Express middlewares
│   ├── modules/         # Feature modules (auth, products, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── dist/                # Compiled JavaScript (generated)
└── docs/                # Project documentation
```

## Environment Variables

See `env.example` for all required environment variables.

## Security Best Practices

- Passwords are hashed using bcrypt
- JWT tokens with expiration
- Refresh token rotation
- Input validation on all endpoints
- SQL injection protection via Sequelize ORM
- CORS and Helmet for security headers
- Environment variables for sensitive data

## Persistent Pricing

The API implements persistent pricing for both cart items and orders:
- **Cart Items**: Price is locked when an item is added to the cart (`priceAtAdd`)
- **Order Items**: Price is locked when an order is created (`priceAtTime`)

This ensures that price changes don't affect items already in the cart or completed orders.

## License

MIT

## Author
Sharath Devadiga

