"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const seed_1 = require("./utils/seed");
const startServer = async () => {
    try {
        console.log('=====================================================');
        console.log('SMART CRIME MAPPING DATA ANALYSIS AND PREDICTIVE INSIGHTS');
        console.log('Dept: CSE (Data Science) | Geethanjali Institute of Science & Technology');
        console.log('=====================================================');
        await (0, database_1.connectDatabase)();
        // Auto-seed demo environment if empty
        await (0, seed_1.seedDatabase)(false);
        const server = app_1.default.listen(env_1.env.PORT, () => {
            console.log(`[Server] Application running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
            console.log(`[Server] API Base URL: http://localhost:${env_1.env.PORT}/api`);
            console.log(`[Server] Health Check: http://localhost:${env_1.env.PORT}/api/health`);
        });
        // Graceful Shutdown
        const shutdown = async (signal) => {
            console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
            server.close(async () => {
                await (0, database_1.disconnectDatabase)();
                console.log('[Server] Cleanup complete. Process exiting.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('[Server] Fatal Error during server initialization:', error);
        process.exit(1);
    }
};
startServer();
