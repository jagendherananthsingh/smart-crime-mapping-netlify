"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from backend/.env, root .env, and default environment
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config();
const PRIMARY_MONGODB_URI = 'mongodb://jagendherananthsingh_db_user:1223334444@ac-brmnuiq-shard-00-00.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-01.foucqyy.mongodb.net:27017,ac-brmnuiq-shard-00-02.foucqyy.mongodb.net:27017/smart_crime_mapping?ssl=true&authSource=admin&replicaSet=atlas-orj2ww-shard-0';
const PRIMARY_JWT_SECRET = 'smart_crime_mapping_super_secure_jwt_secret_key_2026';
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGODB_URI: process.env.MONGODB_URI || PRIMARY_MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || PRIMARY_JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CLIENT_URL: process.env.CLIENT_URL ||
        process.env.URL ||
        process.env.DEPLOY_PRIME_URL ||
        'https://smart-crime-mapping.netlify.app',
};
