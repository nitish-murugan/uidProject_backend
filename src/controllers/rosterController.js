import Roster from '../models/Roster.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// @desc    Create a new roster
// @route   POST /api/rosters
// @access  Private (Admin/Coach)
export const createRoster = async (req, res) => {
  try {
    const { name, team, type, players, game, season, notes } = req.body;

    // Check if team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return sendError(res, 404, 'Team not found');
    }

    const roster = await Roster.create({
      name,
      team,
      type,
      players,
      game,
      season,
      notes,
    });

    const populatedRoster = await Roster.findById(roster._id)
      .populate('team', 'name sportType')
      .populate('players.player');

    sendResponse(res, 201, populatedRoster, 'Roster created successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get all rosters
// @route   GET /api/rosters
// @access  Private
export const getAllRosters = async (req, res) => {
  try {
    const { team, type, season } = req.query;
    let query = {};

    if (team) query.team = team;
    if (type) query.type = type;
    if (season) query.season = season;

    const rosters = await Roster.find(query)
      .populate('team', 'name sportType')
      .populate('players.player')
      .populate('game');

    sendResponse(res, 200, rosters, 'Rosters retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get single roster
// @route   GET /api/rosters/:id
// @access  Private
export const getRosterById = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id)
      .populate('team')
      .populate('players.player')
      .populate('game');

    if (!roster) {
      return sendError(res, 404, 'Roster not found');
    }

    sendResponse(res, 200, roster, 'Roster retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update roster
// @route   PUT /api/rosters/:id
// @access  Private (Admin/Coach)
export const updateRoster = async (req, res) => {
  try {
    let roster = await Roster.findById(req.params.id);

    if (!roster) {
      return sendError(res, 404, 'Roster not found');
    }

    roster = await Roster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('team', 'name sportType')
      .populate('players.player');

    sendResponse(res, 200, roster, 'Roster updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Delete roster
// @route   DELETE /api/rosters/:id
// @access  Private (Admin/Coach)
export const deleteRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return sendError(res, 404, 'Roster not found');
    }

    await roster.deleteOne();

    sendResponse(res, 200, {}, 'Roster deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Add player to roster
// @route   POST /api/rosters/:id/players
// @access  Private (Admin/Coach)
export const addPlayerToRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return sendError(res, 404, 'Roster not found');
    }

    const { playerId, position, isStarting } = req.body;

    // Check if player exists
    const playerExists = await Player.findById(playerId);
    if (!playerExists) {
      return sendError(res, 404, 'Player not found');
    }

    // Check if player is already in roster
    const playerInRoster = roster.players.find(
      p => p.player.toString() === playerId
    );

    if (playerInRoster) {
      return sendError(res, 400, 'Player already in roster');
    }

    roster.players.push({
      player: playerId,
      position,
      isStarting: isStarting || false,
    });

    await roster.save();

    const updatedRoster = await Roster.findById(roster._id)
      .populate('team', 'name sportType')
      .populate('players.player');

    sendResponse(res, 200, updatedRoster, 'Player added to roster successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Remove player from roster
// @route   DELETE /api/rosters/:id/players/:playerId
// @access  Private (Admin/Coach)
export const removePlayerFromRoster = async (req, res) => {
  try {
    const roster = await Roster.findById(req.params.id);

    if (!roster) {
      return sendError(res, 404, 'Roster not found');
    }

    roster.players = roster.players.filter(
      p => p.player.toString() !== req.params.playerId
    );

    await roster.save();

    const updatedRoster = await Roster.findById(roster._id)
      .populate('team', 'name sportType')
      .populate('players.player');

    sendResponse(res, 200, updatedRoster, 'Player removed from roster successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};
