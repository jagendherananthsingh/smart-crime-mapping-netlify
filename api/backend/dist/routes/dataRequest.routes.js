"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataRequest_controller_1 = require("../controllers/dataRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Submit new requisition (Public or Authenticated)
router.post('/', dataRequest_controller_1.DataRequestController.create);
// Get my requisitions (Any authenticated user)
router.get('/my', auth_middleware_1.authenticate, dataRequest_controller_1.DataRequestController.getMyRequests);
// Admin Only Routes
router.get('/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']), dataRequest_controller_1.DataRequestController.getStats);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']), dataRequest_controller_1.DataRequestController.getAll);
router.get('/:id', auth_middleware_1.authenticate, dataRequest_controller_1.DataRequestController.getById);
router.patch('/:id/review', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']), dataRequest_controller_1.DataRequestController.review);
exports.default = router;
