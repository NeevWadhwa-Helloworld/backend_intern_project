const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Load configurations
dotenv.config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const swaggerSpec = require('./swagger');
const { errorHandler, APIError } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize database connection
connectDB();

const app = express();

app.set('trust proxy', 1);

// 1. Basic security headers
app.use(helmet());

// 2. Setup Morgan request logging using Winston streams
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.info(message.trim()) }
  })
);

// 3. CORS configuration (allowing credential passing for JWT cookies)
const allowedOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.ALLOW_ALL_ORIGINS === 'true') {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Enables cookie passing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
app.use(cors(corsOptions));

// 4. Body parsers & cookie parser
app.use(express.json({ limit: '10kb' })); // Prevents large payload DOS attacks
app.use(cookieParser());

// 5. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 6. Rate limiting (General API: 150 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use('/api', generalLimiter);

// 7. Stricter Rate Limiting for Auth routes (Login/Register: 20 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 8. Swagger Documentation route (Served at /api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 9. API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Health check for deployment platforms
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route welcome check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Secure Task Management REST API is running. Documentation is available at /api-docs'
  });
});

// 10. Fallback for undefined routes
app.all('*', (req, res, next) => {
  next(new APIError(`Route ${req.originalUrl} not found on this server`, 404));
});

// 11. Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Unhandled Promise Rejections & Exception safety netting
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
