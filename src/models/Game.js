import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  opponent: {
    type: String,
    required: [true, 'Please provide opponent name'],
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  isHomeGame: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled',
  },
  score: {
    team: { type: Number, default: 0 },
    opponent: { type: Number, default: 0 },
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'draw', 'pending'],
    default: 'pending',
  },
  roster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roster',
  },
  playerParticipation: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    participated: {
      type: Boolean,
      default: true,
    },
    minutesPlayed: Number,
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
  }],
  notes: {
    type: String,
    trim: true,
  },
  season: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
