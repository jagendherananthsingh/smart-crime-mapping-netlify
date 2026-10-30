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
exports.Prediction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PredictionSchema = new mongoose_1.Schema({
    modelName: { type: String, required: true },
    modelVersion: { type: String, default: '1.0' },
    inputFeatures: {
        district: { type: String, required: true },
        locationName: { type: String },
        year: { type: Number, required: true },
        month: { type: Number, required: true },
        dayOfWeek: { type: Number, required: true },
        hour: { type: Number, required: true },
        historicalCount: { type: Number, default: 0 },
    },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    probabilities: [
        {
            category: { type: String, required: true },
            probability: { type: Number, required: true },
        },
    ],
    createdBy: { type: String, default: 'Anonymous' },
}, {
    timestamps: true,
});
exports.Prediction = mongoose_1.default.model('Prediction', PredictionSchema);
