const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { APIError } = require('./errorMiddleware');

// Middleware to protect routes (require JWT)
const protect = async (req, res, next) => {
  let token;

  // 1. Get token from HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Bearer token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new APIError('Not authorized to access this route, token missing', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token, exclude password
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new APIError('User belonging to this token no longer exists', 401));
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    return next(new APIError('Not authorized, token validation failed', 401));
  }
};

// Middleware to restrict access to specific roles (e.g. 'admin')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new APIError(
          `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
