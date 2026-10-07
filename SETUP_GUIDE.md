# 🚀 Setup Guide - Online Marketplace for Handcrafted Goods

Welcome to the Online Marketplace! This guide will help you get the application running locally.

---

## ✨ Recent Updates
- ✅ All references to "Chethan" have been replaced with "Ayush"
- ✅ Backend and Frontend dependencies are installed
- ✅ Environment configuration ready

---

## 📋 Prerequisites

Before getting started, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (local instance or MongoDB Atlas cloud)
- **Git** (optional, for version control)

---

## 🛠️ Installation Steps

### Step 1: Navigate to Project Root
```bash
cd chethan_jira/PESU_RR_CSE_C_P30_Online_Marketplace_for_Handcrafted_Goods_TOTAL-CODERS
```

### Step 2: Install Dependencies (Already Done!)
All dependencies for backend and frontend have been pre-installed:
- ✅ Root dependencies
- ✅ Backend dependencies (`src/backend/node_modules`)
- ✅ Frontend dependencies (`src/frontend/node_modules`)

If you need to reinstall, run:
```bash
npm run install:all
```

### Step 3: Configure Environment Variables

#### Backend Configuration
Edit or create `src/backend/.env` with the following:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/handcrafted_goods

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- For Gmail: Generate an [App-Specific Password](https://myaccount.google.com/apppasswords)
- Change `JWT_SECRET` to a secure random string
- Update `MONGO_URI` if using MongoDB Atlas or a different local port

#### Frontend Configuration
The frontend is already configured to connect to `http://localhost:5000` (backend API).

### Step 4: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`

---

## 🎯 Running the Application

### Option 1: Development Mode (Recommended)

Run both backend and frontend simultaneously:

```bash
npm run dev
```

This will:
- Start the **Backend** on `http://localhost:5000`
- Start the **Frontend** on `http://localhost:3000`

### Option 2: Run Backend Only

```bash
npm run dev:backend
```

Backend will be available at: `http://localhost:5000`

### Option 3: Run Frontend Only

```bash
npm run dev:frontend
```

Frontend will be available at: `http://localhost:3000`

### Option 4: Production Build

```bash
# Build frontend
cd src/frontend
npm run build

# Run backend in production
NODE_ENV=production npm start
```

---

## 📊 Database & Sample Data

### Initialize with Sample Data

The project includes sample data in `/src/database/`:
- `users.json` - Contains user data (including Ayush)
- `orders.json` - Contains order history
- `products.json` - Contains product catalog

### Seed Database (if needed)
```bash
cd src/database
node seed.js
```

---

## 🌐 Access the Application

Once everything is running:

- **Frontend**: Open your browser and go to `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Test Email**: Visit `http://localhost:5000/test-email`

---

## 📁 Project Structure

```
PESU_RR_CSE_C_P30_Online_Marketplace_for_Handcrafted_Goods_TOTAL-CODERS/
├── src/
│   ├── backend/               # Express.js server
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utilities (email, etc.)
│   │   ├── server.js         # Entry point
│   │   └── .env              # Environment variables
│   ├── frontend/             # React application
│   │   ├── public/
│   │   ├── src/
│   │   └── package.json
│   └── database/             # Sample data & seed scripts
├── docs/                     # Documentation
├── README.md
└── SETUP_GUIDE.md           # This file
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution**: Run `npm install` in the project root or specific folder

### Issue: "MongoDB connection failed"
**Solution**: 
- Ensure MongoDB is running (`mongod`)
- Check `MONGO_URI` in `.env`
- Try `mongodb://localhost:27017/handcrafted_goods`

### Issue: "Port 5000 already in use"
**Solution**: 
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Kill the process or change the port
set PORT=3001 && npm run dev:frontend
```

### Issue: "Email not sending"
**Solution**: 
- Verify Gmail credentials are correct
- Enable "Less secure app access" or use App Password
- Check `SMTP_USER` and `SMTP_PASS` in `.env`

---

## 📚 API Documentation

For detailed API endpoints, see `docs/api.md`

Common endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/otp` - Send OTP
- `GET /api/products` - Get all products

---

## 🧪 Testing

Run tests with:
```bash
npm test
```

---

## 📖 Additional Resources

- [Backend Developer Guide](docs/developer-guide.md)
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)

---

## ✅ All Chethan References Replaced!

The following have been updated to use "Ayush":
- ✅ `src/database/users.json` - User "Chethan MS" → "Ayush"
- ✅ `src/database/orders.json` - Orders updated to use Ayush's email
- ✅ `README.md` - GitHub team member reference updated

---

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd chethan_jira/PESU_RR_CSE_C_P30_Online_Marketplace_for_Handcrafted_Goods_TOTAL-CODERS

# Run development servers
npm run dev

# OR run backend only
npm run dev:backend

# OR run frontend only
npm run dev:frontend
```

---

## 💡 Tips

1. **Keep terminals open** - You'll need separate terminals for backend and frontend if running individually
2. **Check logs** - Backend logs will show database connections and errors
3. **React Hot Reload** - Frontend automatically reloads on file changes
4. **Use Postman** - Test API endpoints with [Postman](https://www.postman.com/)

---

## 📞 Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review the `docs/` folder
3. Check `README.md`

---

**Happy Coding! 🎉**

Built with ❤️ by TOTAL-CODERS
