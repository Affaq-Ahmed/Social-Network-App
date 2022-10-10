import { Router } from 'express';
import {
	createComment,
	getCommentReplies,
	getPostComments,
	deleteCommentById,
	createReplyToComment,
} from '../controllers/comment';
import { authenticateToken } from '../middleware/auth';
import { createCommentValidator } from '../validators/comment';

export const router = Router();

/**
 * All routes in this file are prefixed with /comment
 * All the routes with authenticate middleware are private routes
 * These private routes need to be provided with a valid token
 */

/**
 * @route POST /comment/reply
 * @desc Create a reply to a comment
 * @access Private
 * @Body {string} content
 * @Body {string} commentId
 * @returns {object} comment object
 * @returns {string} message
 * @returns {string} error
 */
router.post(
	'/reply',
	authenticateToken,
	createCommentValidator,
	createReplyToComment
);

/**
 * @route POST /comment
 * @desc Create a comment
 * @access Private
 * @Body {string} content
 * @returns {object} comment object
 * @returns {string} message
 * @returns {string} error
 */
router.post('/', authenticateToken, createCommentValidator, createComment);

/**
 * @route DELETE /comment/:commentId
 * @desc Delete a comment
 * @access Private
 * @access Moderator
 * @Param commentId
 * @returns {string} message
 * @returns {string} error
 */
router.delete('/:commentId', authenticateToken, deleteCommentById);

/**
 * @route GET /comment/replies/:commentId
 * @desc Get all replies to a comment
 * @access Private
 * @Param commentId
 * @returns {object} comment object
 * @returns {string} message
 * @returns {string} error
 * @returns {array} comments
 */
router.get('/replies/:commentId', authenticateToken, getCommentReplies);

/**
 * @route GET /comment/:postId
 * @desc Get all comments of a post
 * @access Private
 * @Param postId
 * @returns {object} comments object
 * @returns {string} message
 * @returns {string} console.error
 */
router.get('/:postId', authenticateToken, getPostComments);

export default router;
