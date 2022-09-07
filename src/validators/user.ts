import joi from 'joi';
import { IUser } from '../models/user';
import { Request, Response } from 'express';

const userSignup = joi.object<IUser>({
	name: joi.string().required(),
	email: joi.string().email().required(),
	password: joi.string().min(3).required(),
});

const userLogin = joi.object<IUser>({
	email: joi.string().email().required(),
	password: joi.string().min(3).required(),
});

const signupValidator = (req: Request, res: Response, next: Function) => {
	const { error } = userSignup.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	next();
};

const loginValidator = (req: Request, res: Response, next: Function) => {
	const { error } = userLogin.validate(req.body, { abortEarly: false });
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	next();
};

export { signupValidator, loginValidator, userSignup, userLogin };
