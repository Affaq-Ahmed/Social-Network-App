import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import bcrypt from 'bcrypt';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';

//pagination
const getAll = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	try {
		const users = await User.find({})
			.skip(((page as number) - 1) * (limit as number))
			.limit(limit as number)
			.select('-password');
		logger.info('Users found');
		return res.status(200).json({
			message: 'Users found',
			users,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const getById = async (req: IGetUserAuthRequest, res: Response) => {
	const { userId } = req.params;
	try {
		const user = await User.findById(userId);
		logger.info('User found');
		return res.status(200).json({
			message: 'User found',
			user,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const follow = async (req: IGetUserAuthRequest, res: Response) => {
	const { userId } = req.params;
	const { user } = req;
	try {
		const userToFollow = await User.findById(userId);
		if (!userToFollow) {
			logger.info('User not found');
			return res.status(400).json({
				message: 'User not found',
			});
		}
		if (user.followedUsers.includes(userToFollow)) {
			logger.info('User already followed');
			return res.status(400).json({
				message: 'User already followed',
			});
		}
		user.followedUsers.push(userToFollow);
		await user.save();
		logger.info('User followed');
		return res.status(200).json({
			message: 'User followed',
			user: user.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const unfollow = async (req: IGetUserAuthRequest, res: Response) => {
	const { userId } = req.params;
	const { user } = req;
	try {
		const userToUnfollow = await User.findById(userId);
		if (!userToUnfollow) {
			logger.info('User not found');
			return res.status(400).json({
				message: 'User not found',
			});
		}
		if (user.followedUsers.includes(userToUnfollow)) {
			user.followedUsers.pull(userToUnfollow);
		} else {
			logger.info('User not followed');
			return res.status(400).json({
				message: 'User not followed',
			});
		}
		await user.save();
		logger.info('User unfollowed');
		return res.status(200).json({
			message: 'User unfollowed',
			user: user.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const getFollowed = async (req: IGetUserAuthRequest, res: Response) => {
	const { user } = req;
	try {
		const users = await User.find({ _id: { $in: user.followedUsers } });
		logger.info('Users found');
		return res.status(200).json({
			message: 'Users found',
			users,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

export { getAll, getById, follow, unfollow, getFollowed };
