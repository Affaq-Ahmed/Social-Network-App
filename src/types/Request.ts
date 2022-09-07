import { Request } from 'express';
import { IUser } from '../models/user';

export interface IGetUserAuthRequest extends Request {
	token?: string;
	user?: any | IUser;
}
