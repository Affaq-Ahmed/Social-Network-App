import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import bcrypt from 'bcrypt';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';

/**
 * @param req Request
 * @param res Response
 * @returns {Promise<Response>}
 * @description Login user
 * @route POST /users/login
 * @access Public
 * @example http://localhost:3000/users/login
 */
const userLogin = async (email: string, password: string) => {
	try {
		const user = await User.findOne({ email });
		if (!user) {
			logger.info('User not found');
			return {
				status: 400,
				message: 'User not found',
			};
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			logger.info('Invalid credentials');
			return {
				message: 'Invalid credentials',
				status: 400,
			};
		}
		await user.generateAuthToken();
		logger.info('User logged in');

		return {
			message: 'Login successful',
			status: 200,
			user: user.publicProfile(),
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
 * @param req Request
 * @param res Response
 * @returns {Promise<Response>}
 * @description Register user
 * @route POST /users/register
 * @access Public
 * @example http://localhost:3000/users/register
 */
const userSignup = async (
	name: string,
	email: string,
	password: string,
	role: string
) => {
	try {
		const user = await User.findOne({ email });
		if (user) {
			logger.info('User already exists');
			return {
				message: 'User already exists',
				status: 400,
			};
		}

		const newUser = new User({
			name,
			email,
			password,
			userRole: role,
		});
		const salt = await bcrypt.genSalt(10);
		newUser.password = await bcrypt.hash(password, salt);
		await newUser.save();

		logger.info('User created');
		return {
			message: 'User created',
			status: 201,
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
 * @param req Request
 * @param res Response
 * @returns {Promise<Response>}
 * @description Logout user
 * @route POST /users/logout
 * @access Private
 * @example http://localhost:3000/users/logout
 */
const userLogout = async (req: IGetUserAuthRequest) => {
	try {
		await req.user.removeToken(req.token);
		logger.info('User logged out');
		return {
			message: 'Logout successful',
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

const userLogoutAll = async (req: IGetUserAuthRequest) => {
	try {
		await req.user.removeAllTokens();
		logger.info('User logged out from all devices');
		return {
			message: 'Logout successful',
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

export { userLogin, userSignup, userLogout, userLogoutAll };
