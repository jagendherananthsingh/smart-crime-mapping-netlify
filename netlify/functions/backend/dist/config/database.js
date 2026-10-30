"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.isDbConnected = exports.DIRECT_ATLAS_URI = void 0;
const dns_1 = __importDefault(require("dns"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
// Configure high-availability public DNS to resolve MongoDB Atlas SRV records if ever needed
try {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}
catch (e) {
    // Ignore in sandboxed runtimes
}
exports.DIRECT_ATLAS_URI = 'mongodb://jagendherananthsingh_db_user:1223334444@ac-brmnuiq-shard-00-00.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-01.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-02.foucqyy.mongodb.net:27017/smart_crime_mapping?ssl=true&authSource=admin&replicaSet=atlas-orj2ww-shard-0';
let mongoMemoryServer = null;
let connectionPromise = null;
const isDbConnected = () => mongoose_1.default.connection.readyState === 1;
exports.isDbConnected = isDbConnected;
const connectDatabase = async () => {
    mongoose_1.default.set('strictQuery', true);
    // If already connected, return cached connection (essential for Vercel serverless)
    if (mongoose_1.default.connection.readyState === 1) {
        return env_1.env.MONGODB_URI || exports.DIRECT_ATLAS_URI;
    }
    // Reuse in-flight connection promise to prevent duplicate connections
    if (connectionPromise) {
        return connectionPromise;
    }
    connectionPromise = (async () => {
        const isServerless = Boolean(process.env.NETLIFY ||
            process.env.VERCEL ||
            process.env.AWS_REGION ||
            process.env.LAMBDA_TASK_ROOT ||
            process.env.NOW_REGION);
        // Resolve target URI: if SRV format for our cluster is given, rewrite to direct replica set hosts
        let targetUri = env_1.env.MONGODB_URI || exports.DIRECT_ATLAS_URI;
        if (targetUri.includes('cluster0.foucqyy.mongodb.net') && targetUri.startsWith('mongodb+srv:')) {
            targetUri = exports.DIRECT_ATLAS_URI;
        }
        try {
            await mongoose_1.default.connect(targetUri, {
                serverSelectionTimeoutMS: 4000,
                connectTimeoutMS: 4000,
            });
            console.log(`[Database] Connected to external MongoDB Atlas cluster`);
            return targetUri;
        }
        catch (err) {
            console.warn(`[Database] External MongoDB notice: ${err?.message || err}. Entering Cloud Resilient Mode.`);
            if (isServerless || process.env.NODE_ENV === 'production') {
                return 'cloud_resilient_mode';
            }
            // Local development fallback to MongoMemoryServer
            try {
                const memPkg = 'mongodb-memory-server';
                const { MongoMemoryServer } = eval('require')(memPkg);
                const dbPath = require('path').resolve(__dirname, '../../../data/db');
                require('fs').mkdirSync(dbPath, { recursive: true });
                mongoMemoryServer = await MongoMemoryServer.create({
                    instance: {
                        dbName: 'smart_crime_mapping',
                        port: 27017,
                        launchTimeout: 120000,
                        dbPath: dbPath,
                    },
                });
                const uri = mongoMemoryServer.getUri();
                await mongoose_1.default.connect(uri);
                console.log(`[Database] Connected to embedded in-memory MongoDB: ${uri}`);
                return uri;
            }
            catch (memErr) {
                console.warn('[Database] In-memory MongoDB initialization skipped:', memErr?.message || memErr);
                return 'cloud_resilient_mode';
            }
        }
        finally {
            connectionPromise = null;
        }
    })();
    return connectionPromise;
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.disconnect();
    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected');
};
exports.disconnectDatabase = disconnectDatabase;
