# 🛒 Ecommerce API

A production-ready RESTful API for e-commerce applications built with Node.js, Express.js, MongoDB, and Redis.

## ✨ Features

- **JWT Authentication** with Redis token blacklisting
- **Role-based Access Control** (User, Manager, Admin)
- **Complete Product Management** (Categories, Sub-categories, Brands, Products)
- **Image Upload & Processing** with Sharp
- **Search, Filter & Pagination**
- **Email Service** with Gmail SMTP
- **Docker Support** with docker-compose

## 🛠️ Tech Stack

- **Backend**: Node.js 18+, Express.js 5.1.0
- **Database**: MongoDB with Mongoose
- **Cache**: Redis for session management
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer + Sharp
- **Email**: Nodemailer
- **DevOps**: Docker, AWS ECR

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Docker & Docker Compose
- Gmail account with App Password

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/ecommerce-api.git
cd ecommerce-api

# Install dependencies
npm install

# Setup environment
cp config.env.example config.env
# Edit config.env with your settings

# Start development server
npm run start:dev
```

## 🔧 Environment Variables

```bash
NODE_ENV=development
PORT=8000
DB_URI=mongodb://localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

## 📚 API Endpoints

### Authentication
```http
POST /api/v1/auth/signup      # Register user
POST /api/v1/auth/login       # Login user
POST /api/v1/auth/logout      # Logout user
POST /api/v1/auth/refresh     # Refresh token
```

### Products
```http
GET    /api/v1/products       # Get all products
GET    /api/v1/products/:id   # Get product by ID
POST   /api/v1/products       # Create product (Admin)
PUT    /api/v1/products/:id   # Update product (Admin)
DELETE /api/v1/products/:id   # Delete product (Admin)
```

### Categories
```http
GET    /api/v1/categories     # Get all categories
POST   /api/v1/categories     # Create category (Admin)
PUT    /api/v1/categories/:id # Update category (Admin)
DELETE /api/v1/categories/:id # Delete category (Admin)
```

### Query Examples
```http
# Filter by price range
GET /api/v1/products?price[gte]=1000&price[lte]=5000

# Search and sort
GET /api/v1/products?keyword=iphone&sort=-createdAt

# Pagination
GET /api/v1/products?page=2&limit=10
```

## 🐳 Docker Deployment

```bash
# Quick start with Docker
docker-compose up -d

# View logs
docker-compose logs -f ecommerce-api

# Stop services
docker-compose down
```

### Production with pre-built image
```bash
docker run -d \
  --name ecommerce-api \
  -p 8000:8000 \
  -e DB_URI=your_mongodb_uri \
  -e REDIS_URL=your_redis_uri \
  -e JWT_SECRET=your_jwt_secret \
  public.ecr.aws/u9a7t5u9/ecommerce-api:latest
```

## 🏗️ Project Structure

```
ecommerce-api/
├── config/           # Database & Redis configuration
├── middlewares/      # Express middlewares
├── models/           # MongoDB schemas
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utilities & validators
├── uploads/          # File upload directory
├── docker-compose.yml
├── Dockerfile
└── server.js         # Entry point
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","passwordConfirm":"password123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚀 Production Deployment

### Cloud Platforms
- **Railway**: Connect GitHub → Add env vars → Deploy
- **Heroku**: `heroku create app-name` → Set config vars → Deploy
- **AWS ECS**: Use ECR image `public.ecr.aws/u9a7t5u9/ecommerce-api:latest`

### Environment Setup
```bash
NODE_ENV=production
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
REDIS_URL=redis://default:password@host:port
JWT_SECRET=super-secure-production-secret-key
```

## 📄 License

ISC License

---

**Built with ❤️ using Node.js, Express.js, MongoDB, Redis, and Docker**
