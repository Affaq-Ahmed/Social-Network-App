import { Request, Response } from 'express';
import { Post } from '../models/post';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';

const getAll = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	try {
		const posts = await Post.find({})
			.skip(((page as number) - 1) * (limit as number))
			.limit(limit as number)
			.populate('author', '-password')
			.sort({ createdAt: -1 });
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

const getById = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	try {
		const post = await Post.findById(postId).populate('author', '-password');
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

const create = async (req: IGetUserAuthRequest, res: Response) => {
	const { title, content } = req.body;
	const { user } = req;
	try {
		const post = new Post({
			title,
			content,
			createdBy: user._id,
			createdAt: new Date().toISOString(),
		});
		const savedPost = await post.save();
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

const update = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	const { title, content } = req.body;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (post.createdBy.toString() !== req.user._id.toString()) {
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

const remove = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			logger.info('Post not found');
			return res.status(400).json({
				message: 'Post not found',
			});
		}
		if (post.createdBy.toString() !== req.user._id.toString()) {
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

//pagination
const allPostsByUser = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const { user } = req;
	try {
		const posts = await Post.paginate(
			{ createdBy: user._id },
			{
				page: page as number,
				limit: limit as number,
				populate: 'author',
				sort: { createdAt: -1 },
			}
		);
		// const posts = await Post.find({ createdBy: user._id })
		// 	.skip(((page as number) - 1) * (limit as number))
		// 	.limit(limit as number)
		// 	.sort({ createdAt: -1 });
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

export { getAll, getById, create, update, remove, allPostsByUser };
