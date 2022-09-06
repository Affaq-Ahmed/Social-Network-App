import { Router } from 'express';
import {
	getAllUsers,
	getUser,
	followUser,
	unfollowUser,
	getFollowedUsers,
	stripePay,
} from '../controllers/user';
import { authenticateToken } from '../middleware/auth';

export const router = Router();

/**
 * @route GET /user
 * @desc Get all users
 * @access Private
 * @returns {object} user object
 * @returns {string} message
 */
router.get('/', getAllUsers);

/**
 * @route GET /user/payment
 * @desc Do payment with stripe for a user
 * @access Private
 * @returns {object} user object
 * @returns {string} message
 */
router.post('/payment', authenticateToken, stripePay);

/**
 *  @route GET /user/:id
 * @desc Get a user
 * @access Private
 * @returns {object} user object
 * @returns {string} message
 */
router.get('/:id', getUser);

/**
 * @route POST /user/follow/:id
 * @desc Follow a user
 * @access Private
 * @returns {object} user object
 * @returns {string} message
 */ 
router.post('/follow/:id', authenticateToken, followUser);

/**
 * @route POST /user/unfollow/:id
 * @desc Unfollow a user
 * @access Private
 * @returns {object} user object
 * @returns {string} message
 */
router.post('/unfollow/:id', authenticateToken, unfollowUser);

/**
 * @route GET /user/followed
 * @desc Get all followed users
 * @access Private
 * @returns {string} message
 * @returns {array} followed users
 */  
router.get('/followed/:id', authenticateToken, getFollowedUsers);

export default router;
