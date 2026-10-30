"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRequestService = void 0;
const PoliceDataRequest_1 = require("../models/PoliceDataRequest");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_1 = require("../utils/email");
class DataRequestService {
    /**
     * Submit a new formal official data request
     */
    static async createRequest(userId, userEmail, payload) {
        if (!payload.statutoryDeclaration) {
            throw new Error('Statutory declaration and legal oath under the Indian Police Act is mandatory.');
        }
        if (!payload.idProofNumber || !payload.badgeNumber || !payload.firNumber) {
            throw new Error('Valid Badge Number, Official ID Proof, and FIR / Case Reference are strictly required.');
        }
        const request = new PoliceDataRequest_1.PoliceDataRequest({
            userId,
            userEmail,
            officerName: payload.officerName,
            badgeNumber: payload.badgeNumber,
            rank: payload.rank,
            policeStation: payload.policeStation,
            districts: payload.districts,
            contactPhone: payload.contactPhone,
            officialEmail: payload.officialEmail || userEmail,
            idProofType: payload.idProofType,
            idProofNumber: payload.idProofNumber,
            idProofAttachment: payload.idProofAttachment || 'officer_id_verification_token.pdf',
            firNumber: payload.firNumber,
            requestedDataScope: payload.requestedDataScope,
            purposeDescription: payload.purposeDescription,
            urgencyLevel: payload.urgencyLevel,
            statutoryDeclaration: true,
            status: 'PENDING',
        });
        await request.save();
        // Log security audit event
        await AuditLog_1.AuditLog.create({
            userId,
            userEmail,
            action: 'DATA_REQUISITION_SUBMITTED',
            resource: 'PoliceDataRequest',
            resourceId: request._id.toString(),
            metadata: {
                badgeNumber: payload.badgeNumber,
                rank: payload.rank,
                policeStation: payload.policeStation,
                districts: payload.districts,
                firNumber: payload.firNumber,
                urgency: payload.urgencyLevel,
            },
            timestamp: new Date(),
        });
        return request;
    }
    /**
     * Get all requests submitted by a specific user
     */
    static async getMyRequests(userId) {
        return PoliceDataRequest_1.PoliceDataRequest.find({ userId }).sort({ createdAt: -1 });
    }
    /**
     * Get all requests (Admin View) with optional filters
     */
    static async getAllRequests(filters = {}) {
        const query = {};
        if (filters.status && filters.status !== 'ALL') {
            query.status = filters.status;
        }
        if (filters.district && filters.district !== 'ALL') {
            query.districts = filters.district;
        }
        if (filters.urgency && filters.urgency !== 'ALL') {
            query.urgencyLevel = filters.urgency;
        }
        if (filters.search) {
            query.$or = [
                { officerName: { $regex: filters.search, $options: 'i' } },
                { badgeNumber: { $regex: filters.search, $options: 'i' } },
                { policeStation: { $regex: filters.search, $options: 'i' } },
                { firNumber: { $regex: filters.search, $options: 'i' } },
                { idProofNumber: { $regex: filters.search, $options: 'i' } },
            ];
        }
        return PoliceDataRequest_1.PoliceDataRequest.find(query).sort({ createdAt: -1 }).populate('userId', 'name email role');
    }
    /**
     * Get single request details
     */
    static async getRequestById(id) {
        return PoliceDataRequest_1.PoliceDataRequest.findById(id).populate('userId', 'name email role').populate('reviewedBy', 'name email');
    }
    /**
     * Review (Approve or Reject) a police data request (Admin Only)
     */
    static async reviewRequest(requestId, adminId, adminEmail, decision) {
        const request = await PoliceDataRequest_1.PoliceDataRequest.findById(requestId);
        if (!request) {
            throw new Error('Data requisition record not found');
        }
        request.status = decision.status;
        request.adminRemarks = decision.adminRemarks || (decision.status === 'APPROVED' ? 'Formal request verified and approved by Department Administrator.' : 'Request declined due to inadequate verification details.');
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();
        // If approved and grantPoliceRole is true (or defaulted for police requests), elevate the user account role to POLICE
        if (decision.status === 'APPROVED' && decision.grantPoliceRole !== false) {
            let user = null;
            if (request.userId) {
                user = await User_1.User.findById(request.userId);
            }
            if (!user && request.officialEmail) {
                const targetEmail = request.officialEmail.toLowerCase();
                // First check if a user with this email already exists
                user = await User_1.User.findOne({ email: targetEmail });
                if (!user) {
                    // Generate new user if they don't exist
                    const generatedPassword = Math.random().toString(36).slice(-10);
                    const passwordHash = await bcryptjs_1.default.hash(generatedPassword, 10);
                    user = await User_1.User.create({
                        name: request.officerName,
                        email: targetEmail,
                        passwordHash,
                        role: 'POLICE',
                        isActive: true,
                        notifications: [
                            {
                                message: `Welcome ${request.officerName}! Your official request has been approved. You now have POLICE access.`,
                                read: false,
                            }
                        ]
                    });
                    // Send Email to newly created user
                    await (0, email_1.sendCredentialsEmail)(user.email, user.name, generatedPassword);
                }
                // Link to request regardless of whether they were just created or pre-existing
                request.userId = user._id.toString();
                request.userEmail = user.email;
                await request.save();
            }
            if (user && user.role === 'USER') {
                user.role = 'POLICE';
                // Add notification for existing user
                if (!user.notifications)
                    user.notifications = [];
                user.notifications.push({
                    message: `Your data requisition (FIR: ${request.firNumber}) has been approved. Your role has been elevated to POLICE.`,
                    read: false,
                    createdAt: new Date(),
                });
                await user.save();
                await AuditLog_1.AuditLog.create({
                    userId: adminId,
                    userEmail: adminEmail,
                    action: 'USER_ROLE_ELEVATED_TO_POLICE',
                    resource: 'User',
                    resourceId: user._id.toString(),
                    metadata: {
                        promotedEmail: user.email,
                        originatingRequestId: request._id.toString(),
                        badgeNumber: request.badgeNumber,
                    },
                    timestamp: new Date(),
                });
            }
        }
        // Log security review audit
        await AuditLog_1.AuditLog.create({
            userId: adminId,
            userEmail: adminEmail,
            action: `DATA_REQUISITION_${decision.status}`,
            resource: 'PoliceDataRequest',
            resourceId: request._id.toString(),
            metadata: {
                decision: decision.status,
                officerBadge: request.badgeNumber,
                remarks: request.adminRemarks,
            },
            timestamp: new Date(),
        });
        return request;
    }
    /**
     * Get requisition summary statistics for Admin
     */
    static async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            PoliceDataRequest_1.PoliceDataRequest.countDocuments(),
            PoliceDataRequest_1.PoliceDataRequest.countDocuments({ status: 'PENDING' }),
            PoliceDataRequest_1.PoliceDataRequest.countDocuments({ status: 'APPROVED' }),
            PoliceDataRequest_1.PoliceDataRequest.countDocuments({ status: 'REJECTED' }),
        ]);
        return { total, pending, approved, rejected };
    }
}
exports.DataRequestService = DataRequestService;
