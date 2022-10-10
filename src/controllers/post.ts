import { Request, Response } from 'express';
import {
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
} from '../lib/post';
import { IGetUserAuthRequest } from '../types/Request';

const getAllPosts = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const { user } = req;
	const response = await getAll(page as number, limit as number, user.userRole);
	return res.status(response.status).json(response);
};

const getPost = async (req: Request, res: Response) => {
	const { id } = req.params;
	const response = await getById(id);
	return res.status(response.status).json(response);
};

const createPost = async (req: IGetUserAuthRequest, res: Response) => {
	const { title, content } = req.body;
	const { user } = req;
	if (req.user.userRole === 'MODERATOR') {
		return res.status(403).json({
			message: 'Moderators cannot create posts',
		});
	}
	const response = await create(title, content, user._id);
	return res.status(response.status).json(response);
};

const updatePost = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { title, content } = req.body;
	const { user } = req;
	const response = await update(id, title, content, user._id);
	return res.status(response.status).json(response);
};

const deletePost = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	const response = await remove(id, user._id, user.userRole);
	return res.status(response.status).json(response);
};

const getAllPostsByUser = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10, desc = true } = req.query;
	const { user } = req;
	const response = await allPostsByUser(
		page as number,
		limit as number,
		desc as string,
		user._id
	);
	return res.status(response.status).json(response);
};

const getFeed = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10, desc = true } = req.query;
	const { user } = req;
	if (!user.paid) {
		return res.status(401).json({
			message: 'Please upgrade your account to see the feed.',
		});
	}
	const response = await feed(
		page as number,
		limit as number,
		desc as string,
		user.followedUsers
	);
	return res.status(response.status).json(response);
};

const likePost = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	const { user } = req;
	const response = await like(postId, user);
	return res.status(response.status).json(response);
};

const unlikePost = async (req: IGetUserAuthRequest, res: Response) => {
	const { postId } = req.params;
	const { user } = req;
	const response = await unlike(postId, user);
	return res.status(response.status).json(response);
};

const getPostComments = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	const response = await getComments(id, user);
	return res.status(response.status).json(response);
};

export {
	getAllPosts,
	getPost,
	createPost,
	updatePost,
	deletePost,
	getAllPostsByUser,
	getFeed,
	likePost,
	unlikePost,
	getPostComments,
};
