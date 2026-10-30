"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crimeQuerySchema = exports.createCrimeRecordSchema = void 0;
const zod_1 = require("zod");
exports.createCrimeRecordSchema = zod_1.z.object({
    caseId: zod_1.z.string().min(1, 'Case ID is required'),
    date: zod_1.z.string().or(zod_1.z.date()),
    crimeCategory: zod_1.z.enum([
        'Murder',
        'Rape',
        'Kidnapping (Women & Girls)',
        'Kidnapping (Others)',
        'Dowry Deaths',
        'Molestation & Harassment',
        'Dacoity',
        'Robbery',
        'Burglary',
        'Theft',
        'Riots',
        'Cheatings',
        'Other IPC Crimes',
        'Other Crimes',
    ]),
    crimeType: zod_1.z.string().min(1, 'Crime type is required'),
    locationName: zod_1.z.string().min(1, 'Location name is required'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    district: zod_1.z.string().min(1, 'District is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    description: zod_1.z.string().optional(),
    severity: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});
exports.crimeQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(500).default(50),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    year: zod_1.z.coerce.number().optional(),
    month: zod_1.z.coerce.number().optional(),
    crimeCategory: zod_1.z.string().optional(),
    district: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    city: zod_1.z.string().optional(),
    severity: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
