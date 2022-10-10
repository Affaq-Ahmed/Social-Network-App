import { Request, Response } from 'express';
import { userLogin, userSignup, userLogout, userLogoutAll } from '../lib/auth';

export const signup = async (req: Request, res: Response) => {
	const { name, email, password } = req.body;
	let role;
	if (req.body.userRole) {
		role = req.body.userRole;
	} else {
		role = 'USER';
	}
	const response = await userSignup(name, email, password, role);

	return res.status(response.status).json({
		message: response.message,
		status: response.status,
	});
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const response = await userLogin(email, password);
	res.status(response.status).json(response);
};

export const logout = async (req: Request, res: Response) => {
	const response = await userLogout(req);
	res.status(response.status).json(response);
};

export const logoutAll = async (req: Request, res: Response) => {
	const response = await userLogoutAll(req);
	res.status(response.status).json(response);
};
