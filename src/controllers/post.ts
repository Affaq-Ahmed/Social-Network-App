import { Request, Response } from 'express';
import {
	getAll,
	getById,
	create,
	update,
	remove,
	allPostsByUser,
	feed,
} from '../lib/post';

const getAllPosts = async (req: Request, res: Response) => {
	const response = await getAll(req, res);
};

const getPost = async (req: Request, res: Response) => {
	const response = await getById(req, res);
};

const createPost = async (req: Request, res: Response) => {
	const response = await create(req, res);
};

const updatePost = async (req: Request, res: Response) => {
	const response = await update(req, res);
};

const deletePost = async (req: Request, res: Response) => {
	const response = await remove(req, res);
};

const getAllPostsByUser = async (req: Request, res: Response) => {
	const response = await allPostsByUser(req, res);
};

const getFeed = async (req: Request, res: Response) => {
	const response = await feed(req, res);
};

export {
	getAllPosts,
	getPost,
	createPost,
	updatePost,
	deletePost,
	getAllPostsByUser,
	getFeed,
};
