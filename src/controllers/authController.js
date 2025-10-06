import User from '../models/User.js';
import { generateToken, sendResponse, sendError } from '../utils/helpers.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'viewer',
      phone,
    });

    if (user) {
      sendResponse(res, 201, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      }, 'User registered successfully');
    } else {
      sendError(res, 400, 'Invalid user data');
    }
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    sendResponse(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    }, 'Login successful');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('teams');
    sendResponse(res, 200, user, 'User retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      sendResponse(res, 200, {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
      }, 'Profile updated successfully');
    } else {
      sendError(res, 404, 'User not found');
    }
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    sendResponse(res, 200, users, 'Users retrieved successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, error.message);
  }
};
