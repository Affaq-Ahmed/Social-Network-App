import { Request, Response } from 'express';
import { Post } from '../models/post';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';
import io from '../startup/socket';
import { Comment } from '../models/comment';
import { ObjectId } from 'mongoose';
import { IUser } from '../models/user';

/**
 * @desc Get all posts
 * @route GET /post
 * @access restricted
 * @Query page, limit
 */
const getAll = async (page: number, limit: number, role: string) => {
	try {
		let posts;
		if (role === 'MODERATOR') {
			//REMOVE ALL USER INFO FROM POST
			posts = await Post.find({})
				.skip((page - 1) * limit)
				.limit(limit)
				.sort({ createdAt: -1 })
				.select('-createdBy');
		} else {
			posts = await Post.find({
				deleted: false,
			})
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('createdBy', 'name email')
				.sort({ createdAt: -1 });
		}
		logger.info('Posts found');
		return {
			message: 'Posts found',
			status: 200,
			posts,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Get post by id
 * @route GET /post/:id
 * @access Authenticated
 * @access Moderator
 * @Param id
 */
const getById = async (id: string) => {
	try {
		const post = await Post.findById(id).populate('createdBy', 'name email');
		logger.info('Post found');
		return {
			message: 'Post found',
			status: 200,
			post,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Create a post
 * @route POST /post
 * @access Authenticated
 * @access Moderator can't create post
 * @Body title, content
 */
const create = async (title: string, content: string, createdBy: string) => {
	try {
		const post = new Post({
			title,
			content,
			createdBy,
			createdAt: new Date().toISOString(),
		});
		const savedPost = await post.save();

		

		//SEND SOCKET EVENT
		io.getIO().emit('posts', { action: 'create', post: savedPost });

		logger.info('Post created');
		return {
			message: 'Post created',
			status: 201,
			post: savedPost,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const update = async (
	id: string,
	title: string,
	content: string,
	userId: string
) => {
	try {
		const post = await Post.findById(id);
		if (!post) {
			logger.info('Post not found');
			return {
				message: 'Post not found',
				status: 400,
			};
		}
		if (post.createdBy.toString() !== userId.toString() || post.deleted) {
			logger.info('Unauthorized');
			return {
				message: 'Unauthorized',
				status: 401,
			};
		}
		if (title) {
			post.title = title;
		}
		if (content) {
			post.content = content;
		}
		const updatedPost = await post.save();
		logger.info('Post updated');
		return {
			message: 'Post updated',
			status: 200,
			post: updatedPost,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Delete a post
 * @route DELETE /post/:id
 * @access Authenticated
 * @access Moderator can delete post
 * @Param id
 */
const remove = async (id: string, userId: string, userRole: string) => {
	try {
		const post = await Post.findById(id);
		if (!post) {
			logger.info('Post not found');
			return {
				message: 'Post not found',
				status: 400,
			};
		}
		if (
			post.createdBy.toString() !== userId.toString() ||
			userRole !== 'MODERATOR'
		) {
			logger.info('Unauthorized');
			return {
				message: 'Unauthorized',
				status: 401,
			};
		}
		await post.delete();
		logger.info('Post deleted');
		return {
			message: 'Post deleted',
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Get all posts by user
 * @route GET /post/user/:id
 * @access Authenticated
 * @Param id
 * @Query page, limit, desc
 */
const allPostsByUser = async (
	page: number,
	limit: number,
	desc: string,
	userId: string
) => {
	try {
		const posts = await Post.paginate(
			{ createdBy: userId },
			{
				page: page,
				limit: limit,
				populate: 'createdBy',
				sort: { createdAt: desc === 'true' ? -1 : 1 },
			}
		);
		logger.info('Posts found');
		return {
			message: 'Posts found',
			status: 200,
			posts,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const feed = async (
	page: number,
	limit: number,
	desc: string,
	followedUsers: [string]
) => {
	try {
		const posts = await Post.paginate(
			{ createdBy: { $in: followedUsers } },
			{
				page: page,
				limit: limit,
				sort: { createdAt: desc === 'true' ? -1 : 1 },
			}
		);
		logger.info('Posts found');
		
		return {
			message: 'Posts found',
			status: 200,
			posts,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const like = async (postId: string, user: IUser) => {
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return {
				message: 'Post not found',
				status: 400,
			};
		}
		if (post.likes?.includes(user._id!)) {
			logger.info('Post already liked');
			return {
				message: 'Post already liked',
				status: 400,
			};
		}
		post.likes?.push(user._id!);
		post.likesCount = post.likes?.length;
		const savedPost = await post.save();
		logger.info('Post liked');
		return {
			message: 'Post liked',
			status: 200,
			post: savedPost,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const unlike = async (postId: string, user: IUser) => {
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return {
				message: 'Post not found',
				status: 400,
			};
		}
		if (!post.likes?.includes(user._id!)) {
			logger.info('Post not liked');
			return {
				message: 'Post not liked',
				status: 400,
			};
		}
		post.likes = post.likes?.filter((like) => like !== user._id);
		post.likesCount = post.likes?.length;
		const savedPost = await post.save();
		logger.info('Post unliked');
		return {
			message: 'Post unliked',
			status: 200,
			post: savedPost,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const getComments = async (postId: string, user: IUser) => {
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return {
				message: 'Post not found',
				status: 400,
			};
		}
		if (post.deleted) {
			logger.info('Post is deleted');
			return {
				message: 'Post is deleted',
				status: 400,
			};
		}
		if (
			post.createdBy.toString() !== user._id!.toString() &&
			!user.followedUsers!.includes(post.createdBy)
		) {
			logger.info('Unauthorized');
			return {
				message: 'Unauthorized',
				status: 401,
			};
		}
		const comments = await Comment.find({ postId, deleted: false });

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
		return {
			message: 'Comments found',
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
