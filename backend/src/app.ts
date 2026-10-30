import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess, sendError } from './utils/response';

import { connectDatabase, isDbConnected } from './config/database';

const app: Application = express();

// Trust proxy headers for Netlify, Vercel, and reverse proxies
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible tile loading for Leaflet maps
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true, // Dynamically mirror request origin for Netlify, Vercel, localhost, and custom domains
    credentials: true,
  })
);

// Payload Compression
app.use(compression());

// Logging (development only; avoid serverless socket inspection issues)
if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Auth rate limiting (100 requests per 15 min with serverless-safe key generator)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (
      (req.headers['x-nf-client-connection-ip'] as string) ||
      (req.headers['client-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      '127.0.0.1'
    );
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});
app.use(['/api/auth/login', '/auth/login', '/.netlify/functions/api/auth/login'], authLimiter);
app.use(['/api/auth/register', '/auth/register', '/.netlify/functions/api/auth/register'], authLimiter);

// Health Check (handles /api/health, /health, /api, /api/index, Netlify functions, and root ping)
app.get(
  ['/api/health', '/health', '/api', '/api/index', '/.netlify/functions/api', '/.netlify/functions/api/health', '/'],
  (req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        institution: 'Geethanjali Institute of Science & Technology (Autonomous)',
        department: 'Department of CSE (Data Science)',
        platform: process.env.NETLIFY ? 'Netlify Functions' : (process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Express'),
        dbConnected: isDbConnected(),
      },
      'Smart Crime Mapping API is healthy and operational'
    );
  }
);

// On-demand database connection for all data routes
app.use(async (req: Request, res: Response, next: any) => {
  if (!isDbConnected()) {
    try {
      await connectDatabase();
    } catch (dbErr: any) {
      console.warn('[DB Middleware Connect Notice]', dbErr?.message || dbErr);
    }
  }
  next();
});

// API Routes (supports direct /api, Netlify function prefix, and root routes)
app.use('/api', routes);
app.use('/.netlify/functions/api', routes);
app.use('/', routes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

export default app;
