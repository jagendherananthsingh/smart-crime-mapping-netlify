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
exports.CrimeRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CrimeRecordSchema = new mongoose_1.Schema({
    caseId: { type: String, required: true, unique: true, index: true },
    date: { type: Date, required: true, index: true },
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    day: { type: Number, required: true },
    dayOfWeek: { type: Number, required: true, index: true },
    hour: { type: Number, required: true, index: true },
    crimeCategory: {
        type: String,
        required: true,
        enum: [
            'Murder', 'Rape', 'Kidnapping (Women & Girls)', 'Kidnapping (Others)',
            'Dowry Deaths', 'Molestation & Harassment', 'Dacoity', 'Robbery',
            'Burglary', 'Theft', 'Riots', 'Cheatings', 'Other IPC Crimes', 'Other Crimes',
        ],
        index: true,
    },
    crimeType: { type: String, required: true },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    district: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
        index: true,
    },
    datasetId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Dataset', index: true },
}, {
    timestamps: true,
});
// Compound indexes for analytics and spatial-temporal queries
CrimeRecordSchema.index({ latitude: 1, longitude: 1 });
CrimeRecordSchema.index({ district: 1, crimeCategory: 1 });
CrimeRecordSchema.index({ year: 1, month: 1, crimeCategory: 1 });
CrimeRecordSchema.index({ city: 1, severity: 1 });
exports.CrimeRecord = mongoose_1.default.model('CrimeRecord', CrimeRecordSchema);
