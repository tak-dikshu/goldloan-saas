import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { initializeDatabase } from './database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import loanRoutes from './routes/loanRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import pdfRoutes from './routes/pdfRoutes';
import exportRoutes from './routes/exportRoutes';
import shopRoutes from './routes/shopRoutes';

// Initialize database
initializeDatabase();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: true, // allow dynamic origins (Netlify, custom domains)
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/shop', shopRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, config.host, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏦 Gold Loan Management System - Backend');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✓ Server running on http://${config.host}:${config.port}`);
  console.log(`✓ Environment: ${config.nodeEnv}`);
  console.log(`✓ Database: ${config.databasePath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;
