import express from 'express';
import {
  createRoster,
  getAllRosters,
  getRosterById,
  updateRoster,
  deleteRoster,
  addPlayerToRoster,
  removePlayerFromRoster,
} from '../controllers/rosterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllRosters)
  .post(protect, authorize('admin', 'coach'), createRoster);

router
  .route('/:id')
  .get(protect, getRosterById)
  .put(protect, authorize('admin', 'coach'), updateRoster)
  .delete(protect, authorize('admin', 'coach'), deleteRoster);

router.post('/:id/players', protect, authorize('admin', 'coach'), addPlayerToRoster);
router.delete('/:id/players/:playerId', protect, authorize('admin', 'coach'), removePlayerFromRoster);

export default router;
