import { Request, Response } from 'express';
import {
	create,
	postComments,
	deleteComment,
	commentReplies,
	createReply,
} from '../lib/comment';

const createComment = async (req: Request, res: Response) => {
	const response = await create(req, res);
};

const getPostComments = async (req: Request, res: Response) => {
	const response = await postComments(req, res);
};

const deleteCommentById = async (req: Request, res: Response) => {
	const response = await deleteComment(req, res);
};

const getCommentReplies = async (req: Request, res: Response) => {
	const response = await commentReplies(req, res);
};

const createReplyToComment = async (req: Request, res: Response) => {
	const response = await createReply(req, res);
};

export {
	createComment,
	getPostComments,
	deleteCommentById,
	getCommentReplies,
	createReplyToComment,
};
