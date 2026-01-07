# 🎯 QUICKSTART.md - Gold Loan Management SaaS

## Get Running in 5 Minutes! ⚡

### System Requirements
- ✅ Node.js 18 or higher
- ✅ npm 9 or higher
- ✅ Any modern web browser

---

## 🚀 SETUP STEPS

### Step 1: Extract Package
```bash
tar -xzf goldloan-saas-complete.tar.gz
cd webapp
```

### Step 2: Setup Backend (2 minutes)
```bash
cd backend

# Install dependencies
npm install

# Initialize database
npm run db:migrate

# Build backend
npm run build

# Start backend server
npm start
```

✅ Backend now running at **http://localhost:5000**

### Step 3: Setup Frontend (2 minutes)
Open a **new terminal window**:

```bash
cd webapp/frontend

# Install dependencies
npm install --legacy-peer-deps

# Build frontend
npm run build

# Start development server
npm run dev
```

✅ Frontend now running at **http://localhost:5173**

### Step 4: Open Application
Open your browser and navigate to: **http://localhost:5173**

---

## 👤 FIRST TIME USE

### 1. Register Your Shop
- Click "Register Now"
- Fill in shop details
- Set default interest rate (e.g., 2% per month)
- Set default tenure (e.g., 90 days)
- Create account

### 2. Login
- Use your email and password
- Access the dashboard

### 3. Create First Customer
- Go to "Customers" page
- Click "Add Customer"
- Enter customer details
- Save

### 4. Create First Loan
- Go to "Loans" page
- Click "New Loan"
- Select customer
- Enter gold details:
  - Gross weight
  - Stone weight
  - Purity (22K, 24K, etc.)
  - Rate per gram
- System calculates net weight and gold value
- Enter loan amount (max 75% of gold value)
- Set interest rate and tenure
- Create loan

### 5. Record Payment
- Open loan details
- Click "Add Payment"
- Enter amount
- Select payment mode
- Record payment

### 6. Generate PDF
- From loan details page
- Click "Download PDF"
- Get professional loan sanction letter

### 7. Export Data
- Go to "Reports" page
- Export loans, payments, or customers
- CSV file downloads automatically

---

## 📊 WHAT YOU CAN DO

### ✅ Customer Management
- Add unlimited customers
- Search and filter
- View customer history

### ✅ Loan Management
- Create loans with live calculations
- Track active/overdue/closed loans
- Auto-calculate interest
- Generate PDF documents

### ✅ Payment Processing
- Record payments (cash, UPI, bank, cheque)
- Auto-allocate to interest first
- Auto-close loans when fully paid

### ✅ Business Intelligence
- Dashboard with real-time stats
- Active loans count
- Total gold in custody
- Overdue tracking
- Today's collections

### ✅ Reports & Export
- Export all data to CSV
- Open in Excel/Google Sheets
- Complete audit trail

---

## 🔧 TROUBLESHOOTING

### Backend Won't Start
```bash
cd backend
rm -rf node_modules
npm install
npm run db:migrate
npm run build
npm start
```

### Frontend Won't Build
```bash
cd frontend
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
npm run dev
```

### Database Issues
```bash
cd backend
rm -rf data/
npm run db:migrate
```

### Port Already in Use
```bash
# Kill backend process
fuser -k 5000/tcp

# Kill frontend process
fuser -k 5173/tcp
```

---

## 📁 IMPORTANT FILES

### Backend
- `backend/.env` - Configuration
- `backend/data/database.sqlite` - Database (backup this!)
- `backend/dist/` - Compiled code

### Frontend
- `frontend/.env` - API URL configuration
- `frontend/dist/` - Production build

---

## 🎓 TYPICAL WORKFLOW

1. **Morning**: Check dashboard for overdue loans
2. **Customer Arrives**: 
   - Add to customer database (if new)
   - Create loan with gold details
   - Generate and print PDF
3. **Payment Received**:
   - Open loan details
   - Record payment
   - Print payment receipt
4. **End of Day**:
   - Review today's collections
   - Export data for records

---

## 💡 TIPS

1. **Backup Daily**: `cp backend/data/database.sqlite backup-$(date +%Y%m%d).sqlite`
2. **Gold Rate**: Update daily for accurate valuations
3. **Interest Rate**: Set default in settings
4. **Customer Info**: Complete address for legal purposes
5. **PDF Storage**: Save loan PDFs for records

---

## 🔒 SECURITY

- ✅ Passwords are encrypted
- ✅ JWT tokens expire after 7 days
- ✅ Rate limiting enabled
- ✅ Data isolated per shop

**Change in production**: Update `JWT_SECRET` in `backend/.env`

---

## 📞 SUPPORT

### Common Questions

**Q: Can I use PostgreSQL instead of SQLite?**
A: Yes! Update `DATABASE_PATH` in `.env` and connection code.

**Q: How do I backup my data?**
A: Copy `backend/data/database.sqlite` regularly.

**Q: Can multiple users access simultaneously?**
A: Yes! System supports concurrent users.

**Q: Mobile responsive?**
A: Yes! Works on all devices.

**Q: Can I customize interest calculation?**
A: Yes! Edit `backend/src/utils/calculations.ts`

---

## 🎯 NEXT STEPS

1. ✅ Setup complete
2. ✅ First loan created
3. ⏳ Configure production environment
4. ⏳ Setup automatic backups
5. ⏳ Deploy to production server

---

## 📈 PRODUCTION DEPLOYMENT

For production deployment, see **DEPLOYMENT.md**

Key points:
- Use PM2 for backend
- Use Nginx for frontend
- Enable HTTPS
- Setup backups
- Monitor logs

---

**That's it! You're ready to manage gold loans! 🏦**

Need help? Check README.md for complete documentation.

---

**Built with ❤️ for Indian Jewellery Shops 🇮🇳**
