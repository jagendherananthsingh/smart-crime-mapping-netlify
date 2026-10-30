"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const response_1 = require("./utils/response");
const database_1 = require("./config/database");
const app = (0, express_1.default)();
// Trust proxy headers for Netlify, Vercel, and reverse proxies
app.set('trust proxy', 1);
// Security Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allows flexible tile loading for Leaflet maps
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true, // Dynamically mirror request origin for Netlify, Vercel, localhost, and custom domains
    credentials: true,
}));
// Payload Compression
app.use((0, compression_1.default)());
// Logging (development only; avoid serverless socket inspection issues)
if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY && !process.env.VERCEL) {
    app.use((0, morgan_1.default)('dev'));
}
// Body Parsers
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Auth rate limiting (100 requests per 15 min with serverless-safe key generator)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return (req.headers['x-nf-client-connection-ip'] ||
            req.headers['client-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.ip ||
            '127.0.0.1');
    },
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
    },
});
app.use(['/api/auth/login', '/auth/login', '/.netlify/functions/api/auth/login'], authLimiter);
app.use(['/api/auth/register', '/auth/register', '/.netlify/functions/api/auth/register'], authLimiter);
// Health Check (handles /api/health, /health, /api, /api/index, Netlify functions, and root ping)
app.get(['/api/health', '/health', '/api', '/api/index', '/.netlify/functions/api', '/.netlify/functions/api/health', '/'], (req, res) => {
    (0, response_1.sendSuccess)(res, {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        institution: 'Geethanjali Institute of Science & Technology (Autonomous)',
        department: 'Department of CSE (Data Science)',
        platform: process.env.NETLIFY ? 'Netlify Functions' : (process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Express'),
        dbConnected: (0, database_1.isDbConnected)(),
    }, 'Smart Crime Mapping API is healthy and operational');
});
// On-demand database connection for all data routes
app.use(async (req, res, next) => {
    if (!(0, database_1.isDbConnected)()) {
        try {
            await (0, database_1.connectDatabase)();
        }
        catch (dbErr) {
            console.warn('[DB Middleware Connect Notice]', dbErr?.message || dbErr);
        }
    }
    next();
});
// API Routes (supports direct /api, Netlify function prefix, and root routes)
app.use('/api', routes_1.default);
app.use('/.netlify/functions/api', routes_1.default);
app.use('/', routes_1.default);
// 404 Route Handler
app.use((req, res) => {
    (0, response_1.sendError)(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
