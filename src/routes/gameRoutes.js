import express from 'express';
import {
  createGame,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
  updatePlayerParticipation,
} from '../controllers/gameController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllGames)
  .post(protect, authorize('admin', 'coach'), createGame);

router
  .route('/:id')
  .get(protect, getGameById)
  .put(protect, authorize('admin', 'coach'), updateGame)
  .delete(protect, authorize('admin', 'coach'), deleteGame);

router.put('/:id/participation', protect, authorize('admin', 'coach'), updatePlayerParticipation);

export default router;
