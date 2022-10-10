import { Request, Response } from 'express';
import {
	getAll,
	getById,
	follow,
	unfollow,
	getFollowed,
	stripePayment,
} from '../lib/user';
import { IGetUserAuthRequest } from '../types/Request';

const getAllUsers = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const response = await getAll(page as number, limit as number);
	return res.status(response.status).json(response);
};

const getUser = async (req: Request, res: Response) => {
	const { id } = req.params;
	const response = await getById(id);
	return res.status(response.status).json(response);
};

const followUser = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	const response = await follow(id, user);
	return res.status(response.status).json(response);
};

const unfollowUser = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	const response = await unfollow(id, user);
	return res.status(response.status).json(response);
};

const getFollowedUsers = async (req: IGetUserAuthRequest, res: Response) => {
	const { user } = req;
	const response = await getFollowed(user.followedUsers);
	return res.status(response.status).json(response);
};

const stripePay = async (req: IGetUserAuthRequest, res: Response) => {
	const { user } = req;
	const { card_number, exp_month, exp_year, cvc } = req.body;
	const response = await stripePayment(
		card_number,
		exp_month,
		exp_year,
		cvc,
		user
	);
	return res.status(response.status).json(response);
};

export {
	getAllUsers,
	getUser,
	followUser,
	unfollowUser,
	getFollowedUsers,
	stripePay,
};
