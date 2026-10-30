"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliceDataRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PoliceDataRequestSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    userEmail: { type: String, trim: true, lowercase: true },
    officerName: { type: String, required: true, trim: true },
    badgeNumber: { type: String, required: true, trim: true, index: true },
    rank: { type: String, required: true, trim: true },
    policeStation: { type: String, required: true, trim: true },
    districts: [{ type: String, required: true, trim: true, index: true }],
    contactPhone: { type: String, required: true, trim: true },
    officialEmail: { type: String, trim: true, lowercase: true },
    idProofType: {
        type: String,
        enum: ['POLICE_ID_CARD', 'COURT_ORDER', 'DEPT_MEMO', 'OFFICIAL_WARRANT'],
        default: 'POLICE_ID_CARD',
        required: true,
    },
    idProofNumber: { type: String, required: true, trim: true },
    idProofAttachment: { type: String, trim: true },
    firNumber: { type: String, required: true, trim: true },
    requestedDataScope: { type: String, required: true, trim: true },
    purposeDescription: { type: String, required: true, trim: true },
    urgencyLevel: {
        type: String,
        enum: ['ROUTINE', 'HIGH_PRIORITY', 'ACTIVE_INVESTIGATION_EMERGENCY'],
        default: 'HIGH_PRIORITY',
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        index: true,
    },
    adminRemarks: { type: String, trim: true },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    statutoryDeclaration: { type: Boolean, required: true, default: true },
}, {
    timestamps: true,
});
exports.PoliceDataRequest = mongoose_1.default.model('PoliceDataRequest', PoliceDataRequestSchema);
