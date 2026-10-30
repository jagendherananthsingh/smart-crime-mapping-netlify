"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictCrimeSchema = exports.trainModelSchema = void 0;
const zod_1 = require("zod");
exports.trainModelSchema = zod_1.z.object({
    modelName: zod_1.z.enum(['Random Forest', 'Decision Tree', 'Logistic Regression']).default('Random Forest'),
    datasetId: zod_1.z.string().optional(),
    testSplitRatio: zod_1.z.number().min(0.1).max(0.4).default(0.2),
    features: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.predictCrimeSchema = zod_1.z.object({
    district: zod_1.z.string().min(1, 'District is required'),
    locationName: zod_1.z.string().optional(),
    year: zod_1.z.coerce.number().min(2000).max(2050),
    month: zod_1.z.coerce.number().min(1).max(12),
    dayOfWeek: zod_1.z.coerce.number().min(0).max(6),
    hour: zod_1.z.coerce.number().min(0).max(23),
    historicalCount: zod_1.z.coerce.number().optional().default(0),
    modelName: zod_1.z.enum(['Random Forest', 'Decision Tree', 'Logistic Regression']).default('Random Forest'),
});
