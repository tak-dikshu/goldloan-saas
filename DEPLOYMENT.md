# 🚀 DEPLOYMENT GUIDE - Gold Loan Management SaaS

## PRODUCTION DEPLOYMENT CHECKLIST

### ✅ PRE-DEPLOYMENT

1. **Security**
   - [ ] Change JWT_SECRET to a strong random string
   - [ ] Use environment variables (never hardcode secrets)
   - [ ] Enable HTTPS in production
   - [ ] Set up firewall rules
   - [ ] Configure rate limiting appropriately

2. **Database**
   - [ ] Backup strategy in place
   - [ ] Consider PostgreSQL for scale
   - [ ] Set up automated backups
   - [ ] Test database migrations

3. **Testing**
   - [ ] Test all API endpoints
   - [ ] Verify PDF generation
   - [ ] Test payment calculations
   - [ ] Verify interest calculations
   - [ ] Test with real scenarios

---

## 🖥️ BACKEND DEPLOYMENT

### Option 1: VPS (Digital Ocean, AWS EC2, Linode)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone/upload your code
scp -r webapp user@your-server-ip:/home/user/

# 4. Install dependencies
cd /home/user/webapp/backend
npm install --production

# 5. Set up environment
cp .env.example .env
nano .env  # Edit with production values

# 6. Build
npm run build

# 7. Migrate database
npm run db:migrate

# 8. Install PM2
sudo npm install -g pm2

# 9. Start with PM2
pm2 start dist/server.js --name goldloan-backend

# 10. Setup PM2 startup
pm2 startup
pm2 save

# 11. Setup Nginx reverse proxy
sudo apt install nginx

# /etc/nginx/sites-available/goldloan
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/goldloan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 12. Setup SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Railway.app (Easy deployment)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd backend
railway init
railway up

# 4. Add environment variables in Railway dashboard
```

### Option 3: Render.com

1. Connect GitHub repository
2. Select backend folder as root
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in dashboard

---

## 🎨 FRONTEND DEPLOYMENT

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Set environment variables
vercel env add VITE_API_URL production
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Set environment variables in Netlify dashboard
```

### Option 3: Static hosting (Nginx)

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Copy to server
scp -r dist/* user@server:/var/www/goldloan/

# 3. Configure Nginx
server {
    listen 80;
    server_name frontend.your-domain.com;
    root /var/www/goldloan;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🗄️ DATABASE BACKUP

### Automated Backup Script

```bash
#!/bin/bash
# backup-goldloan.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
DB_PATH="/home/user/webapp/backend/data/goldloan.db"

mkdir -p $BACKUP_DIR

# Backup database
cp $DB_PATH "$BACKUP_DIR/goldloan_$DATE.db"

# Compress
gzip "$BACKUP_DIR/goldloan_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "goldloan_*.db.gz" -mtime +30 -delete

echo "Backup completed: goldloan_$DATE.db.gz"
```

### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/user/backup-goldloan.sh
```

---

## 🔒 SECURITY HARDENING

### 1. Firewall Setup

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Fail2Ban (Brute force protection)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Application Security

- Use strong JWT secrets (32+ characters)
- Implement rate limiting
- Sanitize all inputs
- Use HTTPS only in production
- Regular security updates
- Monitor logs for suspicious activity

---

## 📊 MONITORING

### PM2 Monitoring

```bash
# View logs
pm2 logs goldloan-backend

# Monitor resources
pm2 monit

# List processes
pm2 list

# Restart
pm2 restart goldloan-backend
```

### Log Monitoring

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/goldloan

/home/user/webapp/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 🔄 UPDATE PROCESS

```bash
# 1. Backup database
cp backend/data/goldloan.db backend/data/goldloan.db.backup

# 2. Pull latest code
git pull origin main

# 3. Update backend
cd backend
npm install
npm run build
npm run db:migrate

# 4. Restart
pm2 restart goldloan-backend

# 5. Update frontend
cd ../frontend
npm install --legacy-peer-deps
npm run build

# 6. Deploy frontend build
# (copy dist/ to hosting or redeploy)
```

---

## 🧪 PRODUCTION TESTING

### Test Checklist

```bash
# Health check
curl https://api.your-domain.com/health

# Register test account
curl -X POST https://api.your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Shop","email":"test@shop.com","password":"Test@12345"}'

# Login
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@shop.com","password":"Test@12345"}'

# Test PDF generation
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.your-domain.com/api/pdf/loan/1 \
  --output test-loan.pdf
```

---

## 🚨 TROUBLESHOOTING

### Backend won't start

```bash
# Check logs
pm2 logs goldloan-backend --lines 100

# Check port
sudo lsof -i :5000

# Check database
ls -la backend/data/

# Restart
pm2 restart goldloan-backend
```

### Database corruption

```bash
# Check integrity
sqlite3 backend/data/goldloan.db "PRAGMA integrity_check;"

# Restore from backup
cp backend/data/goldloan.db.backup backend/data/goldloan.db
```

### High memory usage

```bash
# Check PM2 stats
pm2 monit

# Restart if needed
pm2 restart goldloan-backend

# Consider upgrading server resources
```

---

## 📈 SCALING

### When to scale:
- More than 100 concurrent users
- Database size > 2GB
- Response time > 1 second

### Scaling options:
1. **Vertical**: Upgrade server (more CPU/RAM)
2. **Horizontal**: Multiple app instances + load balancer
3. **Database**: Migrate to PostgreSQL with read replicas
4. **Caching**: Add Redis for frequently accessed data

---

## 💾 DATA MIGRATION

### SQLite to PostgreSQL

```bash
# 1. Export SQLite data
sqlite3 goldloan.db .dump > goldloan.sql

# 2. Install PostgreSQL
sudo apt install postgresql

# 3. Create database
sudo -u postgres createdb goldloan

# 4. Import data (with modifications)
# Edit goldloan.sql to fix PostgreSQL compatibility
psql goldloan < goldloan.sql

# 5. Update backend config
# Install pg: npm install pg
# Update config to use PostgreSQL connection
```

---

## 📞 SUPPORT CONTACTS

- **Technical Issues**: Check logs first
- **Database Issues**: Restore from backup
- **Security Issues**: Review audit logs
- **Performance Issues**: Check PM2 monitoring

---

## ✅ DEPLOYMENT COMPLETE

Once deployed, verify:
- [ ] Backend health endpoint responding
- [ ] Authentication working
- [ ] Database accessible
- [ ] PDFs generating correctly
- [ ] CSV exports working
- [ ] All APIs responding
- [ ] HTTPS enabled
- [ ] Backups running
- [ ] Monitoring active

---

**Remember**: Always test in staging before production!

**Backup**: Before any changes, backup your database!

**Monitor**: Keep an eye on logs and resources!
