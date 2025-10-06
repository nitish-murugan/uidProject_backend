import mongoose from 'mongoose';

const rosterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a roster name'],
    trim: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  type: {
    type: String,
    enum: ['active', 'injured', 'suspended', 'reserve', 'starting'],
    default: 'active',
  },
  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    position: String,
    isStarting: {
      type: Boolean,
      default: false,
    },
  }],
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
  },
  season: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Roster = mongoose.model('Roster', rosterSchema);

export default Roster;
