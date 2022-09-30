import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import bcrypt from 'bcrypt';
import { logger } from '../middleware/logger';
import { IGetUserAuthRequest } from '../types/Request';
import Stripe from 'stripe';

const stripe = new Stripe(
	'sk_test_51LdAPlL8VPhpvdNPlK02H7pYxQT1NYeST0o2NzSszUMGdKthlx4IRbg0o4F4nMZdSJ2ZXoq2FiZeToyo9dF2DEp600OcjMmXrg',
	{
		apiVersion: '2022-08-01',
	}
);

/**
 * @desc   Get all users
 * @route  GET /users
 * @access Public
 */
const getAll = async (req: IGetUserAuthRequest, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	try {
		const users = await User.find({})
			.skip(((page as number) - 1) * (limit as number))
			.limit(limit as number)
			.select('-password');
		logger.info('Users found');
		return res.status(200).json({
			message: 'Users found',
			users,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc   Get user by id
 * @route  GET /users/:id
 * @access Public
 * @param  {string} id
 * @returns {IUser}
 * @throws {Error}
 */
const getById = async (req: IGetUserAuthRequest, res: Response) => {
	const { userId } = req.params;
	try {
		const user = await User.findById(userId);
		logger.info('User found');
		return res.status(200).json({
			message: 'User found',
			user,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Follow user
 * @route POST /user/follow/:id
 * @access Private
 * @param {string} id
 * @returns {IUser}
 */
const follow = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	try {
		const userToFollow = await User.findById(id);
		if (!userToFollow) {
			logger.info('User not found');
			return res.status(400).json({
				message: 'User not found',
			});
		}
		if (user.followedUsers.includes(userToFollow._id)) {
			logger.info('User already followed');
			return res.status(400).json({
				message: 'User already followed',
			});
		}
		user.followedUsers.push(userToFollow);
		await user.save();
		logger.info('User followed');
		return res.status(200).json({
			message: 'User followed',
			user: user.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Unfollow user
 * @route POST /user/unfollow/:id
 * @access Private
 * @param {string} id
 * @returns {IUser}
 */
const unfollow = async (req: IGetUserAuthRequest, res: Response) => {
	const { id } = req.params;
	const { user } = req;
	try {
		const userToUnfollow = await User.findById(id);
		if (!userToUnfollow) {
			logger.info('User not found');
			return res.status(400).json({
				message: 'User not found',
			});
		}
		if (user.followedUsers.includes(userToUnfollow._id)) {
			user.followedUsers.pull(userToUnfollow);
		} else {
			logger.info('User not followed');
			return res.status(400).json({
				message: 'User not followed',
			});
		}
		await user.save();
		logger.info('User unfollowed');
		return res.status(200).json({
			message: 'User unfollowed',
			user: user.publicProfile(),
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Get followed users
 * @route GET /user/followed
 * @access Private
 * @returns {IUser[]}
 */
const getFollowed = async (req: IGetUserAuthRequest, res: Response) => {
	const { user } = req;
	try {
		const users = await User.find({ _id: { $in: user.followedUsers } });
		logger.info('Users found');
		return res.status(200).json({
			message: 'Users found',
			users,
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

/**
 * @desc Payment through Stripe
 * @route POST /user/payment
 * @access Private
 * @Body {cardNumber, expMonth, expYear, cvc}
 * @returns {IUser}
 * @throws {StripeError}
 * @throws {Error}
 * This is a test payment, so the card number is 4242 4242 4242 4242
 * and the cvc is 123
 * @see https://stripe.com/docs/testing
 */
const stripePayment = async (req: IGetUserAuthRequest, res: Response) => {
	const { user } = req;
	const { card_number, exp_month, exp_year, cvc } = req.body;
	try {
		const paymentMethod = await stripe.paymentMethods.create({
			type: 'card',
			card: {
				number: card_number,
				exp_month: exp_month,
				exp_year: exp_year,
				cvc: cvc,
			},
		});
		const paymentIntent = await stripe.paymentIntents.create({
			payment_method: paymentMethod.id,
			amount: 1000,
			currency: 'usd',
			confirm: true,
			payment_method_types: ['card'],
		});
		if (paymentIntent.status === 'succeeded') {
			user.paid = true;
			user.paymentIntentId = paymentIntent.id;
			await user.save();
			logger.info('Stripe payment succeeded');
			return res.status(200).json({
				message: 'Stripe payment succeeded',
				user: user.publicProfile(),
			});
		}
		logger.info('Stripe payment failed');
		return res.status(400).json({
			message: 'Stripe payment failed',
		});
	} catch (error: any) {
		logger.error(error.message);
		return res.status(400).json({
			message: error.message,
		});
	}
};

export { getAll, getById, follow, unfollow, getFollowed, stripePayment };
