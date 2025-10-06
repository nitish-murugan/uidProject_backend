import Game from '../models/Game.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// @desc    Create a new game
// @route   POST /api/games
// @access  Private (Admin/Coach)
export const createGame = async (req, res) => {
  try {
    const {
      team,
      opponent,
      date,
      time,
      location,
      isHomeGame,
      season,
    } = req.body;

    // Check if team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return sendError(res, 404, 'Team not found');
    }

    const game = await Game.create({
      team,
      opponent,
      date,
      time,
      location,
      isHomeGame: isHomeGame !== undefined ? isHomeGame : true,
      season,
    });

    const populatedGame = await Game.findById(game._id)
      .populate('team', 'name sportType')
      .populate('roster');

    sendResponse(res, 201, populatedGame, 'Game created successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get all games
// @route   GET /api/games
// @access  Private
export const getAllGames = async (req, res) => {
  try {
    const { team, status, season } = req.query;
    let query = {};

    if (team) query.team = team;
    if (status) query.status = status;
    if (season) query.season = season;

    const games = await Game.find(query)
      .populate('team', 'name sportType')
      .populate('roster')
      .sort({ date: 1 });

    sendResponse(res, 200, games, 'Games retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Private
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('team')
      .populate('roster')
      .populate('playerParticipation.player');

    if (!game) {
      return sendError(res, 404, 'Game not found');
    }

    sendResponse(res, 200, game, 'Game retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private (Admin/Coach)
export const updateGame = async (req, res) => {
  try {
    let game = await Game.findById(req.params.id);

    if (!game) {
      return sendError(res, 404, 'Game not found');
    }

    // Update game result based on score
    if (req.body.score) {
      const { team, opponent } = req.body.score;
      if (team > opponent) {
        req.body.result = 'win';
      } else if (team < opponent) {
        req.body.result = 'loss';
      } else {
        req.body.result = 'draw';
      }
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('team', 'name sportType')
      .populate('roster');

    // Update team statistics if game is completed
    if (game.status === 'completed' && game.result !== 'pending') {
      const team = await Team.findById(game.team);
      
      if (game.result === 'win') {
        team.statistics.wins += 1;
      } else if (game.result === 'loss') {
        team.statistics.losses += 1;
      } else if (game.result === 'draw') {
        team.statistics.draws += 1;
      }

      team.statistics.goalsFor += game.score.team;
      team.statistics.goalsAgainst += game.score.opponent;

      await team.save();
    }

    sendResponse(res, 200, game, 'Game updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private (Admin/Coach)
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return sendError(res, 404, 'Game not found');
    }

    await game.deleteOne();

    sendResponse(res, 200, {}, 'Game deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update player participation in game
// @route   PUT /api/games/:id/participation
// @access  Private (Admin/Coach)
export const updatePlayerParticipation = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return sendError(res, 404, 'Game not found');
    }

    const { playerId, participated, minutesPlayed, goals, assists, yellowCards, redCards } = req.body;

    // Check if player exists
    const playerExists = await Player.findById(playerId);
    if (!playerExists) {
      return sendError(res, 404, 'Player not found');
    }

    // Find existing participation record
    const participationIndex = game.playerParticipation.findIndex(
      p => p.player.toString() === playerId
    );

    if (participationIndex > -1) {
      // Update existing record
      game.playerParticipation[participationIndex] = {
        player: playerId,
        participated,
        minutesPlayed,
        goals: goals || 0,
        assists: assists || 0,
        yellowCards: yellowCards || 0,
        redCards: redCards || 0,
      };
    } else {
      // Add new record
      game.playerParticipation.push({
        player: playerId,
        participated,
        minutesPlayed,
        goals: goals || 0,
        assists: assists || 0,
        yellowCards: yellowCards || 0,
        redCards: redCards || 0,
      });
    }

    await game.save();

    // Update player statistics if game is completed
    if (game.status === 'completed') {
      const player = await Player.findById(playerId);
      player.statistics.gamesPlayed += 1;
      player.statistics.minutesPlayed += minutesPlayed || 0;
      player.statistics.goals += goals || 0;
      player.statistics.assists += assists || 0;
      player.statistics.yellowCards += yellowCards || 0;
      player.statistics.redCards += redCards || 0;
      await player.save();
    }

    const updatedGame = await Game.findById(game._id)
      .populate('team', 'name sportType')
      .populate('playerParticipation.player');

    sendResponse(res, 200, updatedGame, 'Player participation updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};
