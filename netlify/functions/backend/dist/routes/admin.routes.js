"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect entire admin router for ADMIN role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']));
router.get('/users', admin_controller_1.AdminController.getUsers);
router.patch('/users/:id/role', admin_controller_1.AdminController.updateUserRole);
router.patch('/users/:id/status', admin_controller_1.AdminController.updateUserStatus);
router.get('/logs', admin_controller_1.AdminController.getAuditLogs);
router.get('/system-stats', admin_controller_1.AdminController.getSystemStats);
router.post('/reset-demo', admin_controller_1.AdminController.resetDemoData);
router.post('/reseed', admin_controller_1.AdminController.resetDemoData);
exports.default = router;
