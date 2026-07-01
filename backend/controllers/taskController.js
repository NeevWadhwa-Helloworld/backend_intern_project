const Task = require('../models/Task');
const User = require('../models/User');
const { APIError } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

// @desc    Get all tasks (User: owned tasks only, Admin: all tasks in system)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let query = {};

    // Enforce role-based boundaries
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    } else {
      // If admin, they can optionally filter by a specific user's tasks
      if (req.query.userId) {
        query.user = req.query.userId;
      }
    }

    // Filters & Search
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.search) {
      // Safe sanitization of regex to prevent RegExp injection
      const safeSearch = req.query.search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.title = { $regex: safeSearch, $options: 'i' };
    }

    // Executing query with sort (default to newest tasks first)
    const tasks = await Task.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'username email');

    if (!task) {
      return next(new APIError(`Task not found with id of ${req.params.id}`, 404));
    }

    // Enforce ownership: only owners or admins can read a task
    if (task.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to access this task', 403));
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    // Add logged-in user's ID to the task
    req.body.user = req.user.id;

    const task = await Task.create(req.body);
    logger.info(`Task created: '${task.title}' by User ID: ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(new APIError(`Task not found with id of ${req.params.id}`, 404));
    }

    // Enforce ownership: only owners or admins can update a task
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to update this task', 403));
    }

    // Protect user ownership from being reassigned by malicious requests
    if (req.user.role !== 'admin') {
      delete req.body.user;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    logger.info(`Task updated: ID ${task._id} by User ID: ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new APIError(`Task not found with id of ${req.params.id}`, 404));
    }

    // Enforce ownership: only owners or admins can delete a task
    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new APIError('Not authorized to delete this task', 403));
    }

    await task.deleteOne();
    logger.info(`Task deleted: ID ${req.params.id} by User ID: ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics (Admin Only)
// @route   GET /api/v1/tasks/admin/stats
// @access  Private (Admin Only)
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const totalTasks = await Task.countDocuments();
    const totalUsers = await User.countDocuments();

    // 2. Aggregate tasks by status
    const statusStats = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Aggregate tasks by priority
    const priorityStats = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // 4. User stats (how many tasks each user has)
    const userStats = await Task.aggregate([
      {
        $group: {
          _id: '$user',
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          taskCount: 1,
          username: '$userInfo.username',
          email: '$userInfo.email',
          role: '$userInfo.role'
        }
      },
      { $sort: { taskCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        totalUsers,
        status: statusStats,
        priority: priorityStats,
        users: userStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getAdminStats
};
