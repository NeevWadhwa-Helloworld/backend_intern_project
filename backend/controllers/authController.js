const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { APIError } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Create JWT token and set in HTTP-only cookie, then send JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Cookie configuration
  const cookieExpiresInDays = parseInt(process.env.COOKIE_EXPIRES_IN || '7', 10);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents XSS (Cross-Site Scripting) token access
    secure: process.env.NODE_ENV === 'production', // Sent only over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // lax is sufficient for localhost port sharing
  };

  res.cookie('token', token, cookieOptions);

  logger.info(`User authenticated: ${user.email} (ID: ${user._id})`);

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return next(new APIError('User with this email or username already exists', 400));
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    sendTokenResponse(user, 201, res); // 201 Created (using standard status)
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user exists & include password select since it's hidden by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new APIError('Invalid email or password', 401));
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new APIError('Invalid email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    logger.info(`User logged out successfully`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set in protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
