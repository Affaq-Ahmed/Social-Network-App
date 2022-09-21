import { Request, Response } from 'express';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';

/**
 * @desc Create a post
 * @route POST /post
 * @access Authenticated
 * @Body {string} content
 * @returns {object} post object
 */
export const create = async (req: IGetUserAuthRequest, res: Response) => {
	const { content, postId } = req.body;
	const { user } = req;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({
				message: 'Post not found',
			});
		}
		const comment = new Comment({
			content,
			postId,
			createdBy: user._id,
		});
		const createdComment = await comment.save();

		post.comments?.push(createdComment._id);
		post.commentCount = post.comments?.length;
		await post.save();

		logger.info('Comment created');
		return res.status(201).json({
			message: 'Comment created',
			createdComment,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get all comments of a post
 * @route GET /comment/:postId
 * @access Authenticated
 * @Param postId
 * @returns {object} comments object
 * @returns {string} message
 * @returns {string} error
 */
export const postComments = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	try {
		const comments = await Comment.find()
			.where('postId')
			.equals(postId)
			.where('deleted')
			.equals(false)
			.populate('createdBy', 'name email _id')
			.populate('replies', 'content createdBy _id createdAt');
		logger.info('Comments found');
		return res.status(200).json({
			message: 'Comments found',
			comments,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Delete a comment
 * @route DELETE /comment/:id
 * @access Authenticated
 * @access Moderator
 * @Param commentId
 * @returns {string} message
 */
export const deleteComment = async (
	req: IGetUserAuthRequest,
	res: Response
) => {
	const { commentId } = req.params;
	const { user } = req;
	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({
				message: 'Comment not found',
			});
		}
		if (
			comment.createdBy.toString() !== user._id.toString() &&
			user.role !== 'MODERATOR'
		) {
			return res.status(401).json({
				message: 'Unauthorized',
			});
		}
		if (comment.deleted) {
			return res.status(400).json({
				message: 'Comment already deleted',
			});
		}
		comment.deleted = true;
		await comment.save();
		logger.info('Comment deleted');
		return res.status(200).json({
			message: 'Comment deleted',
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Create a reply to a comment
 * @route POST /comment/reply
 * @access Authenticated
 * @Body {string} content
 * @Body {string} commentId
 * @returns {object} comment object
 * @returns {string} message
 */
export const createReply = async (req: IGetUserAuthRequest, res: Response) => {
	const { content, commentId } = req.body;
	const { user } = req;
	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({
				message: 'Comment not found',
			});
		}
		if (comment.deleted) {
			return res.status(400).json({
				message: 'Comment has been deleted, You cannot reply to it.',
			});
		}
		const reply = new Comment({
			content,
			createdBy: user._id,
			parentCommentId: commentId,
			postId: comment.postId,
		});
		const createdReply = await reply.save();

		await comment.save();

		logger.info('Reply created');
		return res.status(201).json({
			message: 'Reply created',
			createdReply,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get all replies of a comment
 * @route GET /comment/replies/:commentId
 * @access Authenticated
 * @Param commentId
 * @returns {object} replies object
 * @returns {string} message
 * @returns {string} error
 */
export const commentReplies = async (
	req: IGetUserAuthRequest,
	res: Response
) => {
	const { commentId } = req.params;
	try {
		const replies = await Comment.find()
			.where('parentCommentId')
			.equals(commentId)
			.where('deleted')
			.equals(false)
			.populate('createdBy', 'name email _id');
		logger.info('Replies found');
		return res.status(200).json({
			message: 'Replies found',
			replies,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

//git commit -m "FEAT: Comments" -m "Added the routes to add comments to the post."
