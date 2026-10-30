"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const dataset_controller_1 = require("../controllers/dataset.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are permitted'));
        }
    },
});
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, dataset_controller_1.DatasetController.getDatasets);
router.get(['/sample/download', '/sample-download'], dataset_controller_1.DatasetController.downloadSample);
router.get('/:id', auth_middleware_1.authenticate, dataset_controller_1.DatasetController.getDatasetById);
router.post('/upload', auth_middleware_1.authenticate, upload.single('file'), dataset_controller_1.DatasetController.uploadDataset);
router.post('/:id/preprocess', auth_middleware_1.authenticate, dataset_controller_1.DatasetController.preprocessDataset);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']), dataset_controller_1.DatasetController.deleteDataset);
exports.default = router;
