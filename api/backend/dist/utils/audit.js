"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const AuditLog_1 = require("../models/AuditLog");
const database_1 = require("../config/database");
const logAudit = async (action, resource, options) => {
    if (!(0, database_1.isDbConnected)())
        return;
    try {
        await AuditLog_1.AuditLog.create({
            action,
            resource,
            userId: options?.userId,
            userEmail: options?.userEmail,
            resourceId: options?.resourceId,
            metadata: options?.metadata,
            timestamp: new Date(),
        });
    }
    catch (error) {
        console.error('[AuditLog] Failed to record audit log:', error);
    }
};
exports.logAudit = logAudit;
