"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    console.error('[Error Middleware]', err);
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        (0, response_1.sendError)(res, `Duplicate value for ${field}. Must be unique.`, 409);
        return;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        (0, response_1.sendError)(res, 'Database validation error', 400, errors);
        return;
    }
    // Multer file upload error
    if (err.name === 'MulterError') {
        (0, response_1.sendError)(res, `File upload error: ${err.message}`, 400);
        return;
    }
    // Generic message in production, error message in development
    const message = err.message || 'Internal server error';
    (0, response_1.sendError)(res, message, err.statusCode || 500, env_1.env.NODE_ENV === 'development' ? [err.stack] : []);
};
exports.errorHandler = errorHandler;
