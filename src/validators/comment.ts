import joi from 'joi';
import { IComment } from '../models/comment';
import { Request, Response } from 'express';

const commentCreate = joi.object<IComment>({
	content: joi.string().required(),
	postId: joi.string().required(),
});

const createCommentValidator = (
	req: Request,
	res: Response,
	next: Function
) => {
	const { error } = commentCreate.validate(req.body);
	if (error) {
		return res.status(400).json({
			message: error.details[0].message,
		});
	}
	next();
};

export { createCommentValidator, commentCreate };
