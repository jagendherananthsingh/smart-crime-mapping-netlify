const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config();

let app;
try {
  const appModule = require('./backend/dist/app');
  app = appModule.default || appModule;
} catch (e1) {
  try {
    const appModule = require('../backend/dist/app');
    app = appModule.default || appModule;
  } catch (e2) {
    try {
      const appModule = require('./app');
      app = appModule.default || appModule;
    } catch (e3) {
      console.error('[Vercel Serverless] Failed to load application:', e1, e2, e3);
      const express = require('express');
      app = express();
      app.all('*', (req, res) => {
        res.status(500).json({
          success: false,
          error: 'INITIALIZATION_FAILED',
          message: 'Backend serverless module failed to initialize',
          details: { e1: e1?.message, e2: e2?.message, e3: e3?.message }
        });
      });
    }
  }
}

// Serverless Handler with Async Lifecycle Promise Lock
// Ensures Vercel runtime waits until Express has completely flushed the HTTP response
module.exports = (req, res) => {
  // Ensure socket remoteAddress exists for serverless environments
  if (!req.socket) {
    req.socket = { remoteAddress: (req.headers['x-forwarded-for'] || '127.0.0.1') };
  } else if (!req.socket.remoteAddress) {
    req.socket.remoteAddress = (req.headers['x-forwarded-for'] || '127.0.0.1');
  }

  // Restore client-requested path from Vercel proxy headers
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-real-url'] || req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (forwardedUri && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  }

  return new Promise((resolve) => {
    res.once('finish', resolve);
    res.once('close', resolve);
    res.once('error', (err) => {
      console.error('[Vercel Serverless Response Stream Error]', err);
      resolve();
    });

    try {
      app(req, res);
    } catch (err) {
      console.error('[Vercel Serverless Execution Error]', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
      }
      resolve();
    }
  });
};
