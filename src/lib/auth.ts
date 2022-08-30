import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import bcrypt from 'bcrypt';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';

const userLogin = async (req: IGetUserAuthRequest, res: Response) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			logger.info('User not found');
			return res.status(400).json({
				message: 'User not found',
			});
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			logger.info('Invalid credentials');
			return res.status(400).json({
				message: 'Invalid credentials',
			});
		}
		await user.generateAuthToken();
		logger.info('User logged in');

		return res.status(200).json({
			message: 'Login successful',
			user: user.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const userSignup = async (req: IGetUserAuthRequest, res: Response) => {
	const { name, email, password } = req.body;
	let role;
	if (req.body.userRole) {
		role = req.body.userRole;
	}
	try {
		const user = await User.findOne({ email });
		if (user) {
			logger.info('User already exists');
			return res.status(400).json({
				message: 'User already exists',
			});
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
		return res.status(200).json({
			message: 'User created',
			user: newUser.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const userLogout = async (req: IGetUserAuthRequest, res: Response) => {
	try {
		await req.user.removeToken(req.token);
		logger.info('User logged out');
		return res.status(200).json({
			message: 'Logout successful',
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

const userLogoutAll = async (req: IGetUserAuthRequest, res: Response) => {
	try {
		await req.user.removeAllTokens();
		logger.info('User logged out from all devices');
		return res.status(200).json({
			message: 'Logout successful',
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

export { userLogin, userSignup, userLogout, userLogoutAll };
