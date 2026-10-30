import { Router } from 'express';
import { MapController } from '../controllers/map.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/markers', authenticate, requireRole(['ADMIN', 'POLICE', 'USER']), MapController.getMarkers);
router.get('/heatmap', authenticate, requireRole(['ADMIN', 'POLICE', 'USER']), MapController.getHeatmap);
router.get('/hotspots', authenticate, requireRole(['ADMIN', 'POLICE', 'USER']), MapController.getHotspots);
router.get('/area-stats', authenticate, requireRole(['ADMIN', 'POLICE', 'USER']), MapController.getAreaStats);

export default router;
