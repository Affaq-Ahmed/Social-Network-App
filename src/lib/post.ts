import { Request, Response } from 'express';
import { Post } from '../models/post';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';
import io from '../startup/socket';
import { Comment } from '../models/comment';

/**
 * @desc Get all posts
 * @route GET /post
 * @access restricted
 * @Query page, limit
 */
const getAll = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	try {
		let posts;
		if (req.user.role === 'MODERATOR') {
			//REMOVE ALL USER INFO FROM POST
			posts = await Post.find({})
				.skip(((page as number) - 1) * (limit as number))
				.limit(limit as number)
				.sort({ createdAt: -1 })
				.select('-createdBy');
		} else {
			posts = await Post.find({})
				.skip(((page as number) - 1) * (limit as number))
				.limit(limit as number)
				.populate('createdBy', 'name email')
				.sort({ createdAt: -1 })
				.where('deleted')
				.equals(false);
		}
		logger.info('Posts found');
		return res.status(200).json({
			message: 'Posts found',
			posts,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get post by id
 * @route GET /post/:id
 * @access Authenticated
 * @access Moderator
 * @Param id
 */
const getById = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	try {
		const post = await Post.findById(id).populate('createdBy', 'name email');
		logger.info('Post found');
		return res.status(200).json({
			message: 'Post found',
			post,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Create a post
 * @route POST /post
 * @access Authenticated
 * @access Moderator can't create post
 * @Body title, content
 */
const create = async (req: IGetUserAuthRequest, res: Response) => {
	const { title, content } = req.body;
	const { user } = req;
	if (req.user.role === 'MODERATOR') {
		return res.status(403).json({
			message: 'Moderators cannot create posts',
		});
	}
	try {
		const post = new Post({
			title,
			content,
			createdBy: user._id,
			createdAt: new Date().toISOString(),
		});
		const savedPost = await post.save();
		io.getIO().emit('posts', { action: 'create', post: savedPost });
		logger.info('Post created');
		return res.status(201).json({
			message: 'Post created',
			post: savedPost,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Update a post
 * @route PUT /post/:id
 * @access Authenticated
 * @access Moderator can't update post
 * @Param id
 * @Body title or content or Both
 */
const update = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { title, content } = req.body;
	try {
		const post = await Post.findById(id);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (post.createdBy.toString() !== req.user._id.toString() || post.deleted) {
			logger.info('Unauthorized');
			return res.status(401).json({
				message: 'Unauthorized',
			});
		}
		if (title) {
			post.title = title;
		}
		if (content) {
			post.content = content;
		}
		const updatedPost = await post.save();
		logger.info('Post updated');
		return res.status(200).json({
			message: 'Post updated',
			post: updatedPost,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Delete a post
 * @route DELETE /post/:id
 * @access Authenticated
 * @access Moderator can delete post
 * @Param id
 */
const remove = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	try {
		const post = await Post.findById(id);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (
			post.createdBy.toString() !== req.user._id.toString() ||
			req.user.userRole !== 'MODERATOR'
		) {
			logger.info('Unauthorized');
			return res.status(401).json({
				message: 'Unauthorized',
			});
		}
		await post.delete();
		logger.info('Post deleted');
		return res.status(200).json({
			message: 'Post deleted',
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get all posts by user
 * @route GET /post/user/:id
 * @access Authenticated
 * @Param id
 * @Query page, limit, desc
 */
const allPostsByUser = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10, desc = true } = req.query;
	const { user } = req;
	try {
		const posts = await Post.paginate(
			{ createdBy: user._id },
			{
				page: page as number,
				limit: limit as number,
				populate: 'createdBy',
				sort: { createdAt: desc === 'true' ? -1 : 1 },
			}
		);
		logger.info('Posts found');
		return res.status(200).json({
			message: 'Posts found',
			posts,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get the posts of the user's friends
 * @route GET /feed
 * @access Authenticated
 * @Query page, limit, desc
 * @access Moderator can't get feed
 * @access User can't get getFeed if he has no friends
 *
 */
const feed = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10, desc = true } = req.query;
	const { user } = req;
	if (!user.paid) {
		return res.status(401).json({
			message: 'Please upgrade your account to see the feed.',
		});
	}
	try {
		const posts = await Post.paginate(
			{ createdBy: { $in: user.followedUsers } },
			{
				page: page as number,
				limit: limit as number,
				sort: { createdAt: desc === 'true' ? -1 : 1 },
			}
		);
		logger.info('Posts found');

		return res.status(200).json({
			message: 'Posts found',
			posts,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Like a post
 * @route PUT /post/like/:id
 * @access Authenticated
 * @Param postId
 * @access Moderator can't like post
 * @access User can't like post if he has no friends
 */
const like = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	const { user } = req;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (post.likes?.includes(user._id)) {
			logger.info('Post already liked');
			return res.status(400).json({
				message: 'Post already liked',
			});
		}
		post.likes?.push(user._id);
		post.likesCount = post.likes?.length;
		const savedPost = await post.save();
		logger.info('Post liked');
		return res.status(200).json({
			message: 'Post liked',
			post: savedPost,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Unlike a post
 * @route PUT /post/unlike/:id
 * @access Authenticated
 * @Param postId
 * @access Moderator can't unlike post
 * @access User can't unlike post if he has no friends
 */
const unlike = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	const { user } = req;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (!post.likes?.includes(user._id)) {
			logger.info('Post not liked');
			return res.status(400).json({
				message: 'Post not liked',
			});
		}
		post.likes = post.likes?.filter((like) => like !== user._id);
		post.likesCount = post.likes?.length;
		const savedPost = await post.save();
		logger.info('Post unliked');
		return res.status(200).json({
			message: 'Post unliked',
			post: savedPost,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get all comments with replies in graph format
 * @route GET /post/:id/comments
 * @access Authenticated
 * @Param id
 * @Query page, limit, desc
 * @access Moderator can't get comments
 * @access User can't get comments if post is deleted
 * @access User can't get comments if post is not his and he is not following the user
 */
const getComments = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	try {
		const post = await Post.findById(id);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (post.deleted) {
			logger.info('Post is deleted');
			return res.status(400).json({
				message: 'Post is deleted',
			});
		}
		if (
			post.createdBy.toString() !== user._id.toString() &&
			!user.followedUsers.includes(post.createdBy)
		) {
			logger.info('Unauthorized');
			return res.status(401).json({
				message: 'Unauthorized',
			});
		}
		const comments = await Comment.find({ postId: id })
			.where('deleted')
			.equals(false);

		const graph = comments.reduce((acc: any, comment: any) => {
			acc[comment._id] = {
				...comment._doc,
				replies: [],
			};
			return acc;
		}, {});

		graph.forEach((comment: { replyTo: string | number }) => {
			if (comment.replyTo) {
				graph[comment.replyTo].replies.push(comment);
			}
		});

		logger.info('Comments found');
		return res.status(200).json({
			message: 'Comments found',
			graph,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

export {
	getAll,
	getById,
	create,
	update,
	remove,
	allPostsByUser,
	feed,
	like,
	unlike,
	getComments,
};
