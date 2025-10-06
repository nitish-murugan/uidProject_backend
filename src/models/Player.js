import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  jerseyNumber: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  height: {
    type: String,
    trim: true,
  },
  weight: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  status: {
    type: String,
    enum: ['active', 'injured', 'suspended', 'inactive'],
    default: 'active',
  },
  statistics: {
    gamesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Calculate age from date of birth
playerSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
