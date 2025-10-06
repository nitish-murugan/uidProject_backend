/* global process */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Game from '../models/Game.js';
import Roster from '../models/Roster.js';

dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0001',
  },
  {
    name: 'John Coach',
    email: 'coach@example.com',
    password: 'coach123',
    role: 'coach',
    phone: '555-0002',
  },
  {
    name: 'Jane Viewer',
    email: 'viewer@example.com',
    password: 'viewer123',
    role: 'viewer',
    phone: '555-0003',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Team.deleteMany();
    await Player.deleteMany();
    await Game.deleteMany();
    await Roster.deleteMany();

    console.log('Existing data cleared');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Users created');

    const coachUser = createdUsers.find(u => u.role === 'coach');

    // Create teams
    const teams = [
      {
        name: 'Thunder FC',
        sportType: 'Soccer',
        season: '2024 Spring',
        division: 'Premier League',
        description: 'Professional soccer team',
        coach: coachUser._id,
        statistics: {
          wins: 10,
          losses: 3,
          draws: 2,
          goalsFor: 35,
          goalsAgainst: 18,
        },
      },
      {
        name: 'Eagles Basketball',
        sportType: 'Basketball',
        season: '2024 Winter',
        division: 'Division A',
        description: 'College basketball team',
        coach: coachUser._id,
        statistics: {
          wins: 15,
          losses: 5,
          draws: 0,
          goalsFor: 1250,
          goalsAgainst: 1100,
        },
      },
    ];

    const createdTeams = await Team.create(teams);
    console.log('Teams created');

    // Create players for Thunder FC
    const soccerPlayers = [
      {
        firstName: 'Marcus',
        lastName: 'Silva',
        email: 'marcus@example.com',
        phone: '555-1001',
        dateOfBirth: new Date('2000-03-15'),
        position: 'Forward',
        jerseyNumber: 10,
        team: createdTeams[0]._id,
        height: '5\'11"',
        weight: '175 lbs',
        status: 'active',
        statistics: {
          gamesPlayed: 15,
          goals: 12,
          assists: 8,
        },
      },
      {
        firstName: 'David',
        lastName: 'Johnson',
        email: 'david@example.com',
        phone: '555-1002',
        dateOfBirth: new Date('1999-07-20'),
        position: 'Midfielder',
        jerseyNumber: 8,
        team: createdTeams[0]._id,
        height: '5\'10"',
        weight: '170 lbs',
        status: 'active',
        statistics: {
          gamesPlayed: 14,
          goals: 5,
          assists: 10,
        },
      },
      {
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex@example.com',
        phone: '555-1003',
        dateOfBirth: new Date('2001-01-10'),
        position: 'Defender',
        jerseyNumber: 4,
        team: createdTeams[0]._id,
        height: '6\'1"',
        weight: '180 lbs',
        status: 'active',
        statistics: {
          gamesPlayed: 15,
          goals: 2,
          assists: 3,
        },
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        phone: '555-1004',
        dateOfBirth: new Date('2000-11-05'),
        position: 'Goalkeeper',
        jerseyNumber: 1,
        team: createdTeams[0]._id,
        height: '6\'2"',
        weight: '185 lbs',
        status: 'active',
        statistics: {
          gamesPlayed: 15,
          goals: 0,
          assists: 0,
        },
      },
    ];

    const createdPlayers = await Player.create(soccerPlayers);
    console.log('Players created');

    // Update teams with players
    await Team.findByIdAndUpdate(createdTeams[0]._id, {
      $push: { players: { $each: createdPlayers.map(p => p._id) } }
    });

    // Create a roster
    const roster = await Roster.create({
      name: 'Starting XI',
      team: createdTeams[0]._id,
      type: 'starting',
      season: '2024 Spring',
      players: createdPlayers.map(p => ({
        player: p._id,
        position: p.position,
        isStarting: true,
      })),
    });

    console.log('Roster created');

    // Create some games
    const games = [
      {
        team: createdTeams[0]._id,
        opponent: 'Lions United',
        date: new Date('2024-11-15'),
        time: '15:00',
        location: 'Home Stadium',
        isHomeGame: true,
        season: '2024 Spring',
        status: 'completed',
        score: { team: 3, opponent: 1 },
        result: 'win',
        roster: roster._id,
      },
      {
        team: createdTeams[0]._id,
        opponent: 'Panthers FC',
        date: new Date('2024-11-22'),
        time: '14:00',
        location: 'Away Stadium',
        isHomeGame: false,
        season: '2024 Spring',
        status: 'scheduled',
        score: { team: 0, opponent: 0 },
        result: 'pending',
      },
    ];

    await Game.create(games);
    console.log('Games created');

    console.log('✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Coach: coach@example.com / coach123');
    console.log('Viewer: viewer@example.com / viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
