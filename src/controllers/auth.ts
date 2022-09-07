import { Request, Response } from 'express';
import { userLogin, userSignup, userLogout, userLogoutAll } from '../lib/auth';

export const signup = async (req: Request, res: Response) => {
	const response = userSignup(req, res);
};

export const login = async (req: Request, res: Response) => {
	const response = await userLogin(req, res);
};

export const logout = async (req: Request, res: Response) => {
	const response = await userLogout(req, res);
};

export const logoutAll = async (req: Request, res: Response) => {
	const response = await userLogoutAll(req, res);
};
