# ⚡ Quick Start Guide

## 🎯 3-Step Startup

### Step 1: Install MongoDB (if not already done)
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Then start MongoDB service
mongod
```

### Step 2: Configure Backend
Edit `src/backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/handcrafted_goods
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET=any-random-secret-key
PORT=5000
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Create Razorpay API keys in your Razorpay Dashboard and begin with **Test Mode** credentials. The key secret must stay in `src/backend/.env`; never place it in frontend code or commit it. Checkout opens Razorpay for card, UPI, and other methods enabled on your account, and the backend confirms payment using Razorpay's signature and payment status before confirming the order. After payment is confirmed, the marketplace emails an order receipt with the order ID, amount paid, delivery address, and an estimated delivery date seven days later. If email delivery is temporarily unavailable, the checkout confirmation offers a retry action. Configure `SMTP_USER` and a Gmail app password in `src/backend/.env` for email delivery. Without both Razorpay keys, online checkout is unavailable.

### Step 3: Run the Application

**Choose ONE of these options:**

#### Option A: Interactive Menu (Easiest)
```bash
# Windows Batch
start-dev.bat

# PowerShell
.\start-dev.ps1
```

#### Option B: Command Line

```bash
# Start BOTH backend and frontend (RECOMMENDED)
npm run dev

# OR start backend only
npm run dev:backend

# OR start frontend only  
npm run dev:frontend
```

---

## 🌐 Access Application

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| API Test | http://localhost:5000/test-email | 5000 |

---

## ✅ What's Changed

- ✅ "Chethan" → "Ayush" in all data files
- ✅ Users data updated
- ✅ Orders data updated
- ✅ README updated
- ✅ All dependencies installed
- ✅ Ready to run immediately

---

## 📁 Important Files

```
📦 Project Root
├── 📄 SETUP_GUIDE.md          ← Full setup instructions
├── 📄 QUICK_START.md          ← This file
├── 📄 CHANGES_SUMMARY.md      ← What was changed
├── 🚀 start-dev.bat           ← Windows startup (interactive)
├── 🚀 start-dev.ps1           ← PowerShell startup (interactive)
├── 📂 src/
│   ├── 📂 backend/
│   │   ├── 📄 .env            ← Configuration file
│   │   ├── 📁 node_modules    ← Installed ✅
│   │   └── 🚀 server.js       ← Entry point
│   ├── 📂 frontend/
│   │   ├── 📁 node_modules    ← Installed ✅
│   │   └── 🚀 App.js
│   └── 📂 database/
│       ├── 📄 users.json      ← Updated: Only Ayush
│       ├── 📄 orders.json     ← Updated: Ayush emails
│       └── 📄 products.json
└── 📄 package.json            ← Root scripts
```

---

## 🎬 First Time Setup

```bash
# 1. Navigate to project
cd chethan_jira/PESU_RR_CSE_C_P30_Online_Marketplace_for_Handcrafted_Goods_TOTAL-CODERS

# 2. Start MongoDB (in another terminal)
mongod

# 3. Start application
npm run dev
```

That's it! 🎉

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process |
| MongoDB not found | Install MongoDB or use MongoDB Atlas |
| npm not found | Install Node.js from nodejs.org |
| Dependencies missing | Run `npm install` in root and `src/backend` and `src/frontend` |

---

## 📚 Full Documentation

For detailed information, see:
- **Setup Instructions**: `SETUP_GUIDE.md`
- **API Documentation**: `docs/api.md`
- **Developer Guide**: `docs/developer-guide.md`
- **Changes Made**: `CHANGES_SUMMARY.md`

---

## ✨ Features Ready to Use

- ✅ User Authentication (Register/Login)
- ✅ Product Catalog
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Email OTP Verification
- ✅ Password Reset
- ✅ Admin Dashboard (if applicable)

---

## 🚀 Next Steps

1. ✅ **Download**: Already done!
2. ✅ **Install**: Already done!
3. ⏭️ **Configure**: Edit `src/backend/.env` (optional)
4. ⏭️ **Start MongoDB**: Run `mongod`
5. ⏭️ **Run App**: Execute startup script or `npm run dev`
6. ⏭️ **Open Browser**: Go to `http://localhost:3000`

---

## 💡 Pro Tips

- Keep both backend and frontend running together for full functionality
- Check terminal output for error messages
- Use browser DevTools (F12) to debug frontend issues
- Use Postman to test API endpoints
- All data is in `src/database/` - modify as needed

---

**Ready to code?** 🎯

Pick your startup method and get going! 🚀

Questions? Check `SETUP_GUIDE.md` for detailed help.

---

**Team**: TOTAL-CODERS | **Project**: Online Marketplace for Handcrafted Goods
