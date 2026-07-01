const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getAdminStats
} = require('../controllers/taskController');
const { taskValidation } = require('../middleware/validationMiddleware');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - dueDate
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated task ID
 *         title:
 *           type: string
 *           description: Task title
 *           example: "Implement OAuth"
 *         description:
 *           type: string
 *           description: Task description
 *           example: "Add Google login support"
 *         status:
 *           type: string
 *           enum: [Pending, In Progress, Completed]
 *           default: Pending
 *           example: "In Progress"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           default: Medium
 *           example: "High"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2026-07-15T00:00:00.000Z"
 *         user:
 *           type: string
 *           description: Owner user ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Retrieve list of tasks
 *     description: Retrieve tasks. Normal users get their owned tasks. Admins get all tasks in the system.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Completed]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title (case-insensitive keyword search)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter tasks by owner user ID (Admin only)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthenticated
 */
router.get('/', protect, getTasks);

/**
 * @swagger
 * /api/v1/tasks/admin/stats:
 *   get:
 *     summary: Retrieve system-wide task aggregations and user statistics
 *     description: Returns aggregated task counts and counts of tasks per user. Admin only.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregations retrieved
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Unauthorized (Admin only)
 */
router.get('/admin/stats', protect, restrictTo('admin'), getAdminStats);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task details by ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Unauthorized (Not owner/admin)
 *       404:
 *         description: Task not found
 */
router.get('/:id', protect, getTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Finish internship project"
 *               description:
 *                 type: string
 *                 example: "Complete full MERN project by Friday"
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *                 default: Pending
 *                 example: "Pending"
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 default: Medium
 *                 example: "Medium"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-03"
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthenticated
 */
router.post('/', protect, taskValidation, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.put('/:id', protect, taskValidation, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.delete('/:id', protect, deleteTask);

module.exports = router;
