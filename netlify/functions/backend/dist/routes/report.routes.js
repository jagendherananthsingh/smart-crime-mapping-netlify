"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, report_controller_1.ReportController.getReport);
router.post('/generate', auth_middleware_1.authenticate, report_controller_1.ReportController.generate);
exports.default = router;
