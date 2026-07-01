const { validationResult, body } = require('express-validator');
const { APIError } = require('./errorMiddleware');

// General request validation runner
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return next(new APIError('Validation failed', 400, formattedErrors));
  }
  next();
};

// Authentication input validation rules
const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain alphanumeric characters and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  validateRequest
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validateRequest
];

// Task input validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
    .escape(), // HTML sanitization to prevent XSS
  
  body('description')
    .optional()
    .trim()
    .escape(), // HTML sanitization to prevent XSS
  
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be either Pending, In Progress, or Completed'),
  
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be either Low, Medium, or High'),
  
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Please provide a valid ISO 8601 date (YYYY-MM-DD)')
    .toDate(),
  
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation,
  taskValidation
};
