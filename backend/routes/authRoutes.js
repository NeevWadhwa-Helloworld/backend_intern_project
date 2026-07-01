const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { verifyHumanCheck } = require('../middleware/humanCheckMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *         username:
 *           type: string
 *           description: The user's name.
 *         email:
 *           type: string
 *           description: The user's email.
 *         role:
 *           type: string
 *           description: The user's role (user/admin).
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minimum: 3
 *                 example: testuser
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               password:
 *                 type: string
 *                 minimum: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully. Set-Cookie header contains JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input or user already exists.
 */
router.post('/register', registerValidation, verifyHumanCheck, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful. Set-Cookie header contains JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password.
 */
router.post('/login', loginValidation, verifyHumanCheck, login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and clear cookies
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthenticated.
 */
router.get('/me', protect, getMe);

module.exports = router;
