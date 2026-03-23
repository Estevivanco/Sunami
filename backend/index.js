import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './db/connection.js';
import routes from './routes/api.js';
import { config } from './config/env.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = config.port;

// Loggnings-middleware
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// CORS middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 100, // Max 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Striktare rate limit för auth-routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 5, // Max 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Applicera auth rate limiter på login- och register-routes
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Routes
app.use('/', routes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Music App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler - måste vara efter alla routes
app.use(notFoundHandler);

// Global error handler - måste vara sista middleware
app.use(errorHandler);

// Starta server-funktion
const startServer = async () => {
  try {
    // Anslut till MongoDB
    await connectDB();
    
    // Börja lyssna
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Hantera ohanterade promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Hantera outhanterade undantag
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Initiera server
startServer();
