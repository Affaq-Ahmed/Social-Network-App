import { Router } from 'express';
import { login, signup, logout, logoutAll } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { signupValidator, loginValidator } from '../validators/user';

const router = Router();
/**
 * @route POST /auth/login
 * @desc Login a user
 * @access Public
 * @returns {object} user object
 * @returns {string} token
 * @returns {string} message
 */
router.post('/login', loginValidator, login);

/**
 * @route POST /auth/signup
 * @desc Register a new user
 * @access Public
 * @returns {object} user object
 * @returns {string} message
 */
router.post('/signup', signupValidator, signup);

/**
 * @route POST /auth/logout
 * @desc Logout a user
 * @access Private
 * @returns {string} message
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route POST /auth/logoutAll
 * @desc Logout a user from all devices
 * @access Private
 * @returns {string} message
 */
router.post('/logoutAll', authenticateToken, logoutAll);

export default router;
