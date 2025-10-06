import Player from '../models/Player.js';
import Team from '../models/Team.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// @desc    Create a new player
// @route   POST /api/players
// @access  Private (Admin/Coach)
export const createPlayer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      position,
      jerseyNumber,
      team,
      height,
      weight,
      emergencyContact,
      status,
    } = req.body;

    // Check if team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return sendError(res, 404, 'Team not found');
    }

    // Check if jersey number is already taken
    const jerseyExists = await Player.findOne({ team, jerseyNumber });
    if (jerseyExists) {
      return sendError(res, 400, 'Jersey number already taken for this team');
    }

    const player = await Player.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      position,
      jerseyNumber,
      team,
      height,
      weight,
      emergencyContact,
      status: status || 'active',
    });

    // Add player to team
    await Team.findByIdAndUpdate(team, {
      $push: { players: player._id }
    });

    sendResponse(res, 201, player, 'Player created successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get all players
// @route   GET /api/players
// @access  Private
export const getAllPlayers = async (req, res) => {
  try {
    const { team, status } = req.query;
    let query = {};

    if (team) query.team = team;
    if (status) query.status = status;

    const players = await Player.find(query).populate('team', 'name sportType');

    sendResponse(res, 200, players, 'Players retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Private
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team');

    if (!player) {
      return sendError(res, 404, 'Player not found');
    }

    sendResponse(res, 200, player, 'Player retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private (Admin/Coach)
export const updatePlayer = async (req, res) => {
  try {
    let player = await Player.findById(req.params.id);

    if (!player) {
      return sendError(res, 404, 'Player not found');
    }

    // If jersey number is being changed, check if it's available
    if (req.body.jerseyNumber && req.body.jerseyNumber !== player.jerseyNumber) {
      const jerseyExists = await Player.findOne({
        team: player.team,
        jerseyNumber: req.body.jerseyNumber,
        _id: { $ne: req.params.id }
      });
      
      if (jerseyExists) {
        return sendError(res, 400, 'Jersey number already taken for this team');
      }
    }

    player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, player, 'Player updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private (Admin/Coach)
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return sendError(res, 404, 'Player not found');
    }

    // Remove player from team
    await Team.findByIdAndUpdate(player.team, {
      $pull: { players: player._id }
    });

    await player.deleteOne();

    sendResponse(res, 200, {}, 'Player deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update player statistics
// @route   PUT /api/players/:id/statistics
// @access  Private (Admin/Coach)
export const updatePlayerStatistics = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return sendError(res, 404, 'Player not found');
    }

    player.statistics = {
      ...player.statistics,
      ...req.body
    };

    await player.save();

    sendResponse(res, 200, player, 'Player statistics updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};
