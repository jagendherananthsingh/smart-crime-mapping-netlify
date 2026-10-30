import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Configure high-availability public DNS to resolve MongoDB Atlas SRV records if ever needed
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in sandboxed runtimes
}

export const DIRECT_ATLAS_URI =
  'mongodb://jagendherananthsingh_db_user:1223334444@ac-brmnuiq-shard-00-00.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-01.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-02.foucqyy.mongodb.net:27017/smart_crime_mapping?ssl=true&authSource=admin&replicaSet=atlas-orj2ww-shard-0';

let mongoMemoryServer: any = null;
let connectionPromise: Promise<string> | null = null;

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const connectDatabase = async (): Promise<string> => {
  mongoose.set('strictQuery', true);

  // If already connected, return cached connection (essential for Vercel serverless)
  if (mongoose.connection.readyState === 1) {
    return env.MONGODB_URI || DIRECT_ATLAS_URI;
  }

  // Reuse in-flight connection promise to prevent duplicate connections
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const isServerless = Boolean(
      process.env.NETLIFY ||
      process.env.VERCEL ||
      process.env.AWS_REGION ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NOW_REGION
    );

    // Resolve target URI: if SRV format for our cluster is given, rewrite to direct replica set hosts
    let targetUri = env.MONGODB_URI || DIRECT_ATLAS_URI;
    if (targetUri.includes('cluster0.foucqyy.mongodb.net') && targetUri.startsWith('mongodb+srv:')) {
      targetUri = DIRECT_ATLAS_URI;
    }

    try {
      await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
      console.log(`[Database] Connected to external MongoDB Atlas cluster`);
      try {
        const { AnalyticsService } = require('../services/analytics/analytics.service');
        AnalyticsService.prewarm();
      } catch (e) {
        // non-blocking
      }
      return targetUri;
    } catch (err: any) {
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
        await mongoose.connect(uri);
        console.log(`[Database] Connected to embedded in-memory MongoDB: ${uri}`);
        return uri;
      } catch (memErr: any) {
        console.warn('[Database] In-memory MongoDB initialization skipped:', memErr?.message || memErr);
        return 'cloud_resilient_mode';
      }
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  console.log('[Database] Disconnected');
};
