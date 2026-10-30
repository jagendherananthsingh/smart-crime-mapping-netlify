"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                (0, response_1.sendError)(res, 'Validation error', 400, errors);
                return;
            }
            (0, response_1.sendError)(res, 'Invalid request data', 400);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                (0, response_1.sendError)(res, 'Validation error in query parameters', 400, errors);
                return;
            }
            (0, response_1.sendError)(res, 'Invalid query parameters', 400);
        }
    };
};
exports.validateQuery = validateQuery;
