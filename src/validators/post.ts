import joi from 'joi';
import { IPost } from '../models/post';
import { Request, Response } from 'express';

const postCreate = joi.object<IPost>({
	title: joi.string().required(),
	content: joi.string().required(),
});

const postUpdate = joi
	.object<IPost>({
		title: joi.string().required(),
		content: joi.string().required(),
	})
	.or('title', 'content');

const createPostValidator = (req: Request, res: Response, next: Function) => {
	const { error } = postCreate.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	next();
};

const updatePostValidator = (req: Request, res: Response, next: Function) => {
	const { error } = postUpdate.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	next();
};

export { createPostValidator, updatePostValidator, postCreate, postUpdate };
