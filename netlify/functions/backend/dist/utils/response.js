"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
    const body = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(body);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
    const body = {
        success: false,
        message,
        errors,
    };
    return res.status(statusCode).json(body);
};
exports.sendError = sendError;
