import { Request, Response } from 'express';
import { getAll, getById, follow, unfollow, getFollowed } from '../lib/user';

const getAllUsers = async (req: Request, res: Response) => {
	const response = await getAll(req, res);
};

const getUser = async (req: Request, res: Response) => {
	const response = await getById(req, res);
};

const followUser = async (req: Request, res: Response) => {
	const response = await follow(req, res);
};

const unfollowUser = async (req: Request, res: Response) => {
	const response = await unfollow(req, res);
};

const getFollowedUsers = async (req: Request, res: Response) => {
	const response = await getFollowed(req, res);
};

export { getAllUsers, getUser, followUser, unfollowUser, getFollowedUsers };
