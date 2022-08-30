import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { IGetUserAuthRequest } from '../types/Request';

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
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
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
