"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("../services/reports/report.service");
const response_1 = require("../utils/response");
const audit_1 = require("../utils/audit");
class ReportController {
    static async generate(req, res) {
        try {
            const filters = req.body || {};
            const report = await report_service_1.ReportService.generateAcademicReport(filters);
            await (0, audit_1.logAudit)('REPORT_GENERATE', 'Report', {
                userId: req.user?.userId,
                userEmail: req.user?.email,
            });
            (0, response_1.sendSuccess)(res, report, 'Academic crime report generated successfully');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message, 500);
        }
    }
    static async getReport(req, res) {
        try {
            const report = await report_service_1.ReportService.generateAcademicReport(req.query);
            (0, response_1.sendSuccess)(res, report, 'Report retrieved');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message, 500);
        }
    }
}
exports.ReportController = ReportController;
