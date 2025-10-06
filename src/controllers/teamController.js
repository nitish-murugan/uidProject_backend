import Team from '../models/Team.js';
import Player from '../models/Player.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Admin/Coach)
export const createTeam = async (req, res) => {
  try {
    const { name, sportType, season, division, description } = req.body;

    const team = await Team.create({
      name,
      sportType,
      season,
      division,
      description,
      coach: req.user._id,
    });

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teams: team._id }
    });

    sendResponse(res, 201, team, 'Team created successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getAllTeams = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'coach') {
      query.coach = req.user._id;
    }

    const teams = await Team.find(query)
      .populate('coach', 'name email')
      .populate('players');

    sendResponse(res, 200, teams, 'Teams retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('coach', 'name email phone')
      .populate('players')
      .populate('staff.user', 'name email');

    if (!team) {
      return sendError(res, 404, 'Team not found');
    }

    sendResponse(res, 200, team, 'Team retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin/Coach)
export const updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return sendError(res, 404, 'Team not found');
    }

    // Check if user is coach of the team or admin
    if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this team');
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, team, 'Team updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin/Coach)
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return sendError(res, 404, 'Team not found');
    }

    // Check if user is coach of the team or admin
    if (team.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this team');
    }

    // Delete all players associated with the team
    await Player.deleteMany({ team: req.params.id });

    await team.deleteOne();

    sendResponse(res, 200, {}, 'Team deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get team statistics
// @route   GET /api/teams/:id/statistics
// @access  Private
export const getTeamStatistics = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');

    if (!team) {
      return sendError(res, 404, 'Team not found');
    }

    const statistics = {
      totalPlayers: team.players.length,
      activePlayers: team.players.filter(p => p.status === 'active').length,
      injuredPlayers: team.players.filter(p => p.status === 'injured').length,
      suspendedPlayers: team.players.filter(p => p.status === 'suspended').length,
      teamRecord: {
        wins: team.statistics.wins,
        losses: team.statistics.losses,
        draws: team.statistics.draws,
        goalsFor: team.statistics.goalsFor,
        goalsAgainst: team.statistics.goalsAgainst,
      },
    };

    sendResponse(res, 200, statistics, 'Team statistics retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};
