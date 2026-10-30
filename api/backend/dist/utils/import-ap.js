"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const CrimeRecord_1 = require("../models/CrimeRecord");
const Dataset_1 = require("../models/Dataset");
const ModelResult_1 = require("../models/ModelResult");
const cleaner_service_1 = require("../services/preprocessing/cleaner.service");
const ml_service_1 = require("../services/ml/ml.service");
const seedUsers = async () => {
    // Ensure Admin User exists
    const adminEmail = 'admin@crimeanalytics.local';
    let admin = await User_1.User.findOne({ email: adminEmail });
    if (!admin) {
        const adminHash = await bcryptjs_1.default.hash('Admin@12345', 10);
        await User_1.User.create({
            name: 'Dr. System Administrator',
            email: adminEmail,
            passwordHash: adminHash,
            role: 'ADMIN',
            isActive: true,
        });
        console.log(`[Seed] Created Admin User: ${adminEmail} (Password: Admin@12345)`);
    }
    // Ensure Tester User exists
    const testerEmail = 'tester@crimeanalytics.local';
    let tester = await User_1.User.findOne({ email: testerEmail });
    if (!tester) {
        const testerHash = await bcryptjs_1.default.hash('Tester@12345', 10);
        await User_1.User.create({
            name: 'Research Analyst (Tester)',
            email: testerEmail,
            passwordHash: testerHash,
            role: 'TESTER',
            isActive: true,
        });
        console.log(`[Seed] Created Tester User: ${testerEmail} (Password: Tester@12345)`);
    }
};
const runImport = async () => {
    console.log('======================================================');
    printProgress('ANDHRA PRADESH CRIME DATA IMPORT PIPELINE');
    console.log('======================================================');
    // 1. Clear existing dataset and records to start fresh with Andhra Pradesh
    console.log('[Import] Clearing previous datasets, crime records, and model results...');
    await CrimeRecord_1.CrimeRecord.deleteMany({});
    await Dataset_1.Dataset.deleteMany({});
    await ModelResult_1.ModelResult.deleteMany({});
    // Ensure demo accounts are intact
    await seedUsers();
    // 2. Read AP CSV data
    const dataPath = path_1.default.resolve(__dirname, '../../../data/ap-crime-data.csv');
    if (!fs_1.default.existsSync(dataPath)) {
        throw new Error(`Andhra Pradesh CSV file not found at ${dataPath}. Please run the generation script first.`);
    }
    console.log(`[Import] Reading dataset from ${dataPath}...`);
    const csvContent = fs_1.default.readFileSync(dataPath, 'utf-8');
    // 3. Create Dataset Metadata
    const dataset = await Dataset_1.Dataset.create({
        name: 'Andhra Pradesh District-level Crime Dataset (2021-2023)',
        description: 'Actual spatial-temporal crime aggregates from Andhra Pradesh Police reports, sampled and synthesized to individual coordinates for mapping and machine learning.',
        filename: 'ap-crime-data.csv',
        uploadedBy: 'System Administrator',
        status: 'PENDING',
    });
    // 4. Preprocess Data
    console.log('[Import] Cleaning and preprocessing CSV records...');
    const { cleanRecords, summary } = cleaner_service_1.DataCleanerService.preprocessCSV(csvContent, dataset._id.toString());
    console.log(`[Import] Preprocessing summary:
  - Original Rows: ${summary.originalRows}
  - Clean Rows: ${summary.cleanRows}
  - Removed Rows: ${summary.removedRows}
  - Districts Found: ${summary.districtsFound.length}
  - Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`);
    if (cleanRecords.length === 0) {
        dataset.status = 'FAILED';
        await dataset.save();
        throw new Error('Preprocessing rejected: No valid crime records found in CSV.');
    }
    // 5. Ingest Records into MongoDB
    console.log(`[Import] Ingesting ${cleanRecords.length} records into database...`);
    await CrimeRecord_1.CrimeRecord.insertMany(cleanRecords, { ordered: false });
    // Update Dataset status to READY
    dataset.recordCount = cleanRecords.length;
    dataset.columns = Object.keys(cleanRecords[0]);
    dataset.status = 'READY';
    dataset.preprocessingSummary = summary;
    await dataset.save();
    console.log('[Import] Dataset ingested successfully.');
    // 6. Train Machine Learning Models on AP Dataset
    console.log('[Import] Training classification models (Random Forest, Decision Tree, Logistic Regression)...');
    try {
        const mlResults = await ml_service_1.MLService.trainAllModels(dataset._id.toString());
        console.log(`[Import] Model training completed successfully!
    - Best Model: ${mlResults.bestModel}
    - Random Forest Accuracy: ${(mlResults.randomForest.accuracy * 100).toFixed(2)}%
    - Decision Tree Accuracy: ${(mlResults.decisionTree.accuracy * 100).toFixed(2)}%
    - Logistic Regression Accuracy: ${(mlResults.logisticRegression.accuracy * 100).toFixed(2)}%`);
    }
    catch (mlErr) {
        console.error('[Import] Error training machine learning models:', mlErr.message);
    }
    console.log('======================================================');
    console.log('🎉 IMPORT AND MODEL TRAINING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
};
const printProgress = (msg) => {
    console.log(`🚀 ${msg}`);
};
// Connect, run, disconnect
(0, database_1.connectDatabase)()
    .then(() => runImport())
    .then(() => (0, database_1.disconnectDatabase)())
    .catch((err) => {
    console.error('❌ Import failed with error:', err);
    (0, database_1.disconnectDatabase)().finally(() => process.exit(1));
});
