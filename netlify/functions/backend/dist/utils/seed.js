"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.exportRecordsToCSV = exports.generateSyntheticCrimeRecords = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const User_1 = require("../models/User");
const CrimeRecord_1 = require("../models/CrimeRecord");
const Dataset_1 = require("../models/Dataset");
const DISTRICTS_INFO = [
    { name: 'Srikakulam', lat: 18.2949, lng: 83.8938, bias: 'Theft' },
    { name: 'Vizianagaram', lat: 18.1066, lng: 83.3956, bias: 'Molestation' },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, bias: 'Robbery' },
    { name: 'East Godavari', lat: 17.3297, lng: 82.0344, bias: 'Theft' },
    { name: 'West Godavari', lat: 16.9174, lng: 81.3340, bias: 'Cheatings' },
    { name: 'Krishna', lat: 16.6157, lng: 80.5222, bias: 'Burglary' },
    { name: 'Guntur', lat: 16.3067, lng: 80.4365, bias: 'Theft' },
    { name: 'Prakasam', lat: 15.9129, lng: 79.7400, bias: 'Other Crimes' },
    { name: 'SPS Nellore', lat: 14.4426, lng: 79.9865, bias: 'Theft' },
    { name: 'Kurnool', lat: 15.8281, lng: 78.0373, bias: 'Murder' },
    { name: 'Anantapur', lat: 14.6819, lng: 77.6006, bias: 'Burglary' },
    { name: 'Chittoor', lat: 13.2172, lng: 79.0999, bias: 'Other Crimes' },
    { name: 'YSR Kadapa', lat: 14.4673, lng: 78.8242, bias: 'Robbery' },
    { name: 'Rajamahendravaram', lat: 17.0005, lng: 81.8040, bias: 'Theft' },
    { name: 'Eluru', lat: 16.7107, lng: 81.0952, bias: 'Molestation' },
    { name: 'NTR (Vijayawada)', lat: 16.5062, lng: 80.6480, bias: 'Theft' },
    { name: 'Bapatla', lat: 15.9045, lng: 80.4677, bias: 'Theft' },
    { name: 'Palnadu', lat: 16.3600, lng: 79.5000, bias: 'Other IPC' },
    { name: 'Nandyal', lat: 15.4780, lng: 78.4867, bias: 'Robbery' },
    { name: 'Tirupathi', lat: 13.6288, lng: 79.4192, bias: 'Theft' },
    { name: 'Anakapalli', lat: 17.6907, lng: 83.0048, bias: 'Burglary' },
    { name: 'Kakinada', lat: 16.9891, lng: 82.2475, bias: 'Cheatings' },
    { name: 'Alluri Sitharama Raju', lat: 18.0003, lng: 82.8700, bias: 'Other Crimes' },
    { name: 'Parvathipuram Manyam', lat: 18.7776, lng: 83.4270, bias: 'Murder' },
    { name: 'Sri Sathya Sai', lat: 14.1629, lng: 77.3000, bias: 'Other Crimes' },
    { name: 'Annamayya', lat: 14.0000, lng: 79.0000, bias: 'Cheatings' },
    { name: 'Konaseema', lat: 16.8000, lng: 82.2300, bias: 'Dacoity' },
];
const CATEGORIES = [
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
];
const CRIME_TYPES_MAP = {
    'Murder': ['Homicide', 'Culpable Homicide', 'Fatal Assault', 'Murder Incident'],
    'Rape': ['Sexual Assault', 'Rape Incident', 'Attempted Assault'],
    'Kidnapping (Women & Girls)': ['Kidnapping of Women', 'Abduction of Girls', 'Forced Confinement'],
    'Kidnapping (Others)': ['Kidnapping of Minors', 'Abduction for Ransom', 'General Kidnapping'],
    'Dowry Deaths': ['Dowry Death', 'Dowry Harassment Death'],
    'Molestation & Harassment': ['Molestation', 'Sexual Harassment', 'Eve Teasing', 'Outraging Modesty'],
    'Dacoity': ['Dacoity Incident', 'Armed Dacoity', 'Gang Dacoity'],
    'Robbery': ['Armed Robbery', 'Highway Robbery', 'Robbery Incident'],
    'Burglary': ['Residential Break-in', 'Commercial Burglary', 'Forced Entry', 'Night Burglary'],
    'Theft': ['Larceny / Theft', 'Vehicle / Property Theft', 'Pickpocketing', 'Shoplifting'],
    'Riots': ['Communal Riot', 'Public Disturbance', 'Rioting Incident'],
    'Cheatings': ['Cheating', 'Financial Fraud', 'Impersonation Fraud'],
    'Other IPC Crimes': ['IPC Offense', 'Miscellaneous IPC Crime', 'General IPC Violation'],
    'Other Crimes': ['SLL Offense', 'Local Act Violation', 'Other Criminal Activity'],
};
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const generateSyntheticCrimeRecords = (count = 1500) => {
    const records = [];
    const now = new Date();
    const startDate = new Date(2021, 0, 1); // AP data covers 2021-2023
    for (let i = 1; i <= count; i++) {
        const distInfo = DISTRICTS_INFO[Math.floor(Math.random() * DISTRICTS_INFO.length)];
        // 40% chance to match district bias, otherwise random
        let category = distInfo.bias;
        if (!CATEGORIES.includes(category))
            category = 'Theft';
        if (Math.random() > 0.40) {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        }
        const crimeTypes = CRIME_TYPES_MAP[category] || ['General Incident'];
        const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
        // Random date within 2021-2023
        const randomTime = startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime());
        const recordDate = new Date(randomTime);
        // Evening/night crime peak (17:00 - 23:00 50% of time)
        let hour = Math.floor(Math.random() * 24);
        if (Math.random() > 0.5) {
            hour = 17 + Math.floor(Math.random() * 6);
            if (hour >= 24)
                hour = 23;
        }
        recordDate.setHours(hour, Math.floor(Math.random() * 60), 0);
        // Scatter within ~5km of district center
        const latOffset = (Math.random() - 0.5) * 0.09;
        const lngOffset = (Math.random() - 0.5) * 0.09;
        const latitude = Number((distInfo.lat + latOffset).toFixed(6));
        const longitude = Number((distInfo.lng + lngOffset).toFixed(6));
        // Severity mapping – violent crimes are more severe
        let severity = 'MEDIUM';
        if (category === 'Murder' || category === 'Rape' || category === 'Dacoity') {
            severity = 'CRITICAL';
        }
        else if (category === 'Kidnapping (Women & Girls)' || category === 'Kidnapping (Others)' || category === 'Dowry Deaths') {
            severity = 'HIGH';
        }
        else if (category === 'Robbery' || category === 'Burglary' || category === 'Riots' || category === 'Molestation & Harassment') {
            severity = 'MEDIUM';
        }
        else {
            severity = 'LOW';
        }
        records.push({
            caseId: `AP-${recordDate.getFullYear()}-${String(10000 + i).padStart(6, '0')}`,
            date: recordDate,
            year: recordDate.getFullYear(),
            month: recordDate.getMonth() + 1,
            day: recordDate.getDate(),
            dayOfWeek: recordDate.getDay(),
            hour,
            crimeCategory: category,
            crimeType,
            locationName: `${distInfo.name} Zone ${1 + (i % 6)}`,
            latitude,
            longitude,
            district: distInfo.name,
            city: distInfo.name,
            state: 'Andhra Pradesh',
            description: `${crimeType} reported in ${distInfo.name}, Andhra Pradesh.`,
            severity,
        });
    }
    return records;
};
exports.generateSyntheticCrimeRecords = generateSyntheticCrimeRecords;
const exportRecordsToCSV = (records, filePath) => {
    const headers = [
        'case_id',
        'date',
        'crime_category',
        'crime_type',
        'location',
        'district',
        'city',
        'latitude',
        'longitude',
        'hour',
        'severity',
        'description',
    ];
    const rows = records.map((r) => [
        r.caseId,
        r.date.toISOString(),
        `"${r.crimeCategory}"`,
        `"${r.crimeType}"`,
        `"${r.locationName}"`,
        `"${r.district}"`,
        `"${r.city}"`,
        r.latitude,
        r.longitude,
        r.hour,
        r.severity,
        `"${r.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    fs_1.default.writeFileSync(filePath, csvContent, 'utf-8');
};
exports.exportRecordsToCSV = exportRecordsToCSV;
const seedDatabase = async (forceClean = false) => {
    console.log('[Seed] Starting database initialization...');
    if (forceClean) {
        console.log('[Seed] Clearing existing collections for demo reset...');
        await User_1.User.deleteMany({});
        await CrimeRecord_1.CrimeRecord.deleteMany({});
        await Dataset_1.Dataset.deleteMany({});
    }
    // 1. Seed Users
    const adminEmail = 'admin@crimeanalytics.local';
    const adminHash = await bcryptjs_1.default.hash('Admin@12345', 10);
    await User_1.User.updateOne({ email: adminEmail }, { $setOnInsert: { name: 'Administrator', passwordHash: adminHash, role: 'ADMIN', isActive: true } }, { upsert: true });
    const testerEmail = 'tester@crimeanalytics.local';
    const testerHash = await bcryptjs_1.default.hash('Tester@12345', 10);
    await User_1.User.updateOne({ email: testerEmail }, { $setOnInsert: { name: 'Research Analyst (Tester)', passwordHash: testerHash, role: 'USER', isActive: true } }, { upsert: true });
    // Dummy Public Accounts: User 1 & User 2
    const user1Email = 'user1@crimeanalytics.local';
    const user1Hash = await bcryptjs_1.default.hash('User1@12345', 10);
    await User_1.User.updateOne({ email: user1Email }, { $setOnInsert: { name: 'Public Citizen (User 1)', passwordHash: user1Hash, role: 'USER', isActive: true } }, { upsert: true });
    const user2Email = 'user2@crimeanalytics.local';
    const user2Hash = await bcryptjs_1.default.hash('User2@12345', 10);
    await User_1.User.updateOne({ email: user2Email }, { $setOnInsert: { name: 'Community Member (User 2)', passwordHash: user2Hash, role: 'USER', isActive: true } }, { upsert: true });
    console.log('[Seed] Default users verified/created.');
    // 2. Seed AP Crime Dataset if empty
    const recordCount = await CrimeRecord_1.CrimeRecord.countDocuments();
    if (recordCount === 0) {
        console.log('[Seed] Database is empty. Running official AP Police dataset import and ML training...');
        // We import runRawAPImport dynamically to avoid circular dependencies if any
        const { runRawAPImport } = require('./import-raw-ap');
        await runRawAPImport();
        console.log('[Seed] Official data import and ML training completed successfully.');
    }
    else {
        console.log(`[Seed] Database already contains ${recordCount} records. Skipping import.`);
    }
    console.log('[Seed] Database initialization finished successfully.');
};
exports.seedDatabase = seedDatabase;
// If run directly via ts-node src/utils/seed.ts
if (require.main === module) {
    const { connectDatabase, disconnectDatabase } = require('../config/database');
    connectDatabase()
        .then(() => (0, exports.seedDatabase)(process.argv.includes('--force')))
        .then(() => disconnectDatabase())
        .catch((err) => {
        console.error('[Seed Error]', err);
        process.exit(1);
    });
}
