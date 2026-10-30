const path = require('path');
const dotenv = require('dotenv');

// Load environment variables across possible deployment directories
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config();

let app;
try {
  const appModule = require('./backend/dist/app');
  app = appModule.default || appModule;
} catch (e1) {
  try {
    const appModule = require('../../backend/dist/app');
    app = appModule.default || appModule;
  } catch (e2) {
    try {
      const appModule = require('../backend/dist/app');
      app = appModule.default || appModule;
    } catch (e3) {
      console.error('[Netlify Serverless] Error initializing application:', e1, e2, e3);
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

const serverless = require('serverless-http');
const serverlessHandler = serverless(app, {
  binary: [
    'image/*',
    'application/pdf',
    'application/octet-stream',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
});

exports.handler = async (event, context) => {
  // Prevent AWS Lambda / Netlify runtime from hanging on background DB connection pools
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  // Set Netlify environment flag dynamically
  process.env.NETLIFY = 'true';

  // Normalize path if Netlify invokes with function route prefix
  // e.g. /.netlify/functions/api/health -> /api/health
  // e.g. /.netlify/functions/api -> /api
  // e.g. /.netlify/functions/api/auth/login -> /api/auth/login
  if (event.path) {
    if (event.path.startsWith('/.netlify/functions/api')) {
      const stripped = event.path.replace(/^\/\.netlify\/functions\/api/, '');
      event.path = stripped ? (stripped.startsWith('/') ? `/api${stripped}` : `/api/${stripped}`) : '/api';
    }
  }

  // Ensure request headers include client IP for rate limiting and logging
  if (event.headers) {
    const clientIp =
      event.headers['x-nf-client-connection-ip'] ||
      event.headers['client-ip'] ||
      event.headers['x-forwarded-for'] ||
      (event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) ||
      '127.0.0.1';
    
    if (!event.headers['x-forwarded-for']) {
      event.headers['x-forwarded-for'] = clientIp;
    }
  }

  try {
    const response = await serverlessHandler(event, context);
    return response;
  } catch (err) {
    console.error('[Netlify Serverless Handler Exception]', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'SERVERLESS_INVOCATION_ERROR',
        message: err?.message || 'Server error during Netlify serverless invocation'
      })
    };
  }
};

