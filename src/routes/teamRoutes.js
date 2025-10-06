import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamStatistics,
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllTeams)
  .post(protect, authorize('admin', 'coach'), createTeam);

router
  .route('/:id')
  .get(protect, getTeamById)
  .put(protect, authorize('admin', 'coach'), updateTeam)
  .delete(protect, authorize('admin', 'coach'), deleteTeam);

router.get('/:id/statistics', protect, getTeamStatistics);

export default router;
