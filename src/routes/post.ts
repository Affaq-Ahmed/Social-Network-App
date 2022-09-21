import { Router } from 'express';
import {
	getAllPosts,
	getPost,
	createPost,
	updatePost,
	deletePost,
	getAllPostsByUser,
	getFeed,
	likePost,
	unlikePost,
} from '../controllers/post';
import { authenticateToken } from '../middleware/auth';
import { createPostValidator, updatePostValidator } from '../validators/post';

export const router = Router();

/**
 * All routes in this file are prefixed with /post
 * All the routes with authenticate middleware are private routes
 * These private routes need to be provided with a valid token
 */

/**
 * @route GET /post
 * @desc Get all posts
 * @access Private
 * @returns {array} post object
 * @returns {string} message
 */
router.get('/', authenticateToken, getAllPosts);

/**
 * @route GET /post/feed
 * @desc Get all posts from followed users
 * @access Private
 * @returns {array} post object
 * @returns {string} message
 */
router.get('/feed', authenticateToken, getFeed);

/**
 * @route POST /post/like/:postId
 * @desc Like a post
 * @access Private
 * @Param postId
 * @returns {object} post object
 * @returns {string} message
 * @returns {string} error
 */
router.post('/like/:postId', authenticateToken, likePost);

/**
 * @route POST /post/unlike/:postId
 * @desc Unlike a post
 * @access Private
 * @Param postId
 * @returns {object} post object
 * @returns {string} message
 * @returns {string} error
 */
router.post('/unlike/:postId', authenticateToken, unlikePost);

/**
 * @route GET /post/:id
 * @desc Get a post
 * @access Private
 * @returns {object} post object
 * @returns {string} message
 */
router.get('/:id', authenticateToken, getPost);

/**
 * @route POST /post
 * @desc Get all posts by a user
 * @access Private
 * @Body {string} title
 * @Body {string} content
 * @returns {object} post object
 * @returns {string} message
 */
router.post('/', authenticateToken, createPostValidator, createPost);

/**
 * @route PATCH /post/:id
 * @desc Update a post
 * @access Private
 * @Body {string} title
 * @Body {string} content
 * @returns {object} post object
 * @returns {string} message
 */
router.patch('/:id', authenticateToken, updatePostValidator, updatePost);

/**
 * @route DELETE /post/:id
 * @desc Delete a post
 * @access Private
 * @returns {string} message
 */
router.delete('/:id', authenticateToken, deletePost);

/**
 * @route GET /post/user/:id
 * @desc Get all posts by a user
 * @access Public
 * @returns {array} post object
 * @returns {string} message
 */
router.get('/user/:id', getAllPostsByUser);

export default router;
