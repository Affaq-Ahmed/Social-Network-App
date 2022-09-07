import { verify } from '../util/jwt';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { IGetUserAuthRequest } from '../types/Request';

/**
 * @param req
 * @param res
 * @param next
 * sets the user property on the request object
 * if the token is valid
 * @returns
 * 401 if the token is invalid
 * 500 if there is an error
 */
export const authenticateToken = async (
	req: IGetUserAuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '') as string;
		if (!token) {
			return res.status(401).json({
				message: 'No token provided.',
			});
		}
		const decoded = (await verify(
			token,
			process.env.JWT_SECRET as string
		)) as any;
		const user = await User.findById(decoded._id);
		if (!user) {
			return res.status(401).json({
				message: 'Unauthorized',
			});
		}
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).json({
			message: 'Invalid Token',
		});
	}
};
