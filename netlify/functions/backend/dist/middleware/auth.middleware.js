"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDataScope = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const User_1 = require("../models/User");
const PoliceDataRequest_1 = require("../models/PoliceDataRequest");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.sendError)(res, 'Authentication token required', 401);
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        // If MongoDB is connected and userId is a valid ObjectId, verify against database
        const { isDbConnected } = require('../config/database');
        const mongoose = require('mongoose');
        if (isDbConnected() && mongoose.Types.ObjectId.isValid(decoded.userId)) {
            try {
                const user = await User_1.User.findById(decoded.userId).select('name isActive role');
                if (user) {
                    if (!user.isActive) {
                        (0, response_1.sendError)(res, 'User account is inactive', 401);
                        return;
                    }
                    req.user = {
                        userId: user._id.toString(),
                        email: decoded.email,
                        role: user.role,
                        name: user.name,
                    };
                    next();
                    return;
                }
            }
            catch (dbErr) {
                // Fallback to token payload
            }
        }
        // Cryptographically verified token is valid; accept decoded session
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: (decoded.role || 'USER'),
            name: decoded.name || decoded.email?.split('@')[0] || 'User',
        };
        next();
    }
    catch (err) {
        (0, response_1.sendError)(res, 'Invalid or expired authentication token', 401);
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Authentication required', 401);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_1.sendError)(res, `Access denied. Requires one of the following roles: ${roles.join(', ')}`, 403);
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const applyDataScope = async (req, res, next) => {
    try {
        const { isDbConnected } = require('../config/database');
        if (req.user?.role === 'POLICE' && isDbConnected()) {
            const requests = await PoliceDataRequest_1.PoliceDataRequest.find({ userId: req.user.userId, status: 'APPROVED' });
            const allowedDistricts = new Set();
            requests.forEach(r => {
                if (Array.isArray(r.districts)) {
                    r.districts.forEach(d => allowedDistricts.add(d));
                }
                if (r.district && typeof r.district === 'string') {
                    allowedDistricts.add(r.district);
                }
            });
            const allowedArray = Array.from(allowedDistricts);
            if (req.query.district && req.query.district !== 'ALL') {
                const requested = Array.isArray(req.query.district) ? req.query.district : [req.query.district];
                const valid = requested.filter(d => allowedDistricts.has(d));
                req.query.district = valid.length > 0 ? valid : ['NONE_ALLOWED'];
            }
            else {
                req.query.district = allowedArray.length > 0 ? allowedArray : ['NONE_ALLOWED'];
            }
        }
        next();
    }
    catch (error) {
        // Gracefully proceed on database offline
        next();
    }
};
exports.applyDataScope = applyDataScope;
