import express from 'express';
import {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  updatePlayerStatistics,
} from '../controllers/playerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllPlayers)
  .post(protect, authorize('admin', 'coach'), createPlayer);

router
  .route('/:id')
  .get(protect, getPlayerById)
  .put(protect, authorize('admin', 'coach'), updatePlayer)
  .delete(protect, authorize('admin', 'coach'), deletePlayer);

router.put('/:id/statistics', protect, authorize('admin', 'coach'), updatePlayerStatistics);

export default router;
