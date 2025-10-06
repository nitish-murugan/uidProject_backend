import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team name'],
    trim: true,
  },
  sportType: {
    type: String,
    required: [true, 'Please provide a sport type'],
    enum: ['Soccer', 'Basketball', 'Baseball', 'Football', 'Hockey', 'Volleyball', 'Cricket', 'Rugby', 'Tennis', 'Other'],
  },
  season: {
    type: String,
    required: true,
    trim: true,
  },
  division: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    trim: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['assistant_coach', 'manager', 'trainer', 'other'],
    },
  }],
  statistics: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
