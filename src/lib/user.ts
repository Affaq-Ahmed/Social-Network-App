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
const getAll = async (page: number, limit: number) => {
	try {
		const users = await User.find({})
			.skip(((page as number) - 1) * (limit as number))
			.limit(limit as number)
			.select('-password');
		logger.info('Users found');
		return {
			message: 'Users found',
			users,
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const getById = async (userId: string) => {
	try {
		const user = await User.findById(userId);
		logger.info('User found');
		return {
			message: 'User found',
			user,
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Follow user
 * @route POST /user/follow/:id
 * @access Private
 * @param {string} id
 * @returns {IUser}
 */
const follow = async (userIdToFollow: string, user: any) => {
	try {
		const userToFollow = await User.findById(userIdToFollow);
		if (!userToFollow) {
			logger.info('User not found');
			return {
				message: 'User not found',
				status: 400,
			};
		}
		if (user.followedUsers!.includes(userToFollow._id)) {
			logger.info('User already followed');
			return {
				message: 'User already followed',
				status: 400,
			};
		}

		user.followedUsers!.push(userToFollow._id);
		await user.save();

		logger.info('User followed');
		return {
			message: 'User followed',
			user: user.publicProfile(),
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Unfollow user
 * @route POST /user/unfollow/:id
 * @access Private
 * @param {string} id
 * @returns {IUser}
 */
const unfollow = async (userIdToUnfollow: string, user: any) => {
	try {
		const userToUnfollow = await User.findById(userIdToUnfollow);
		if (!userToUnfollow) {
			logger.info('User not found');
			return {
				message: 'User not found',
				status: 400,
			};
		}
		if (user.followedUsers.includes(userToUnfollow._id)) {
			user.followedUsers.pull(userToUnfollow);
		} else {
			logger.info('User not followed');
			return {
				message: 'User not followed',
				status: 400,
			};
		}
		await user.save();
		logger.info('User unfollowed');
		return {
			message: 'User unfollowed',
			user: user.publicProfile(),
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

/**
 * @desc Get followed users
 * @route GET /user/followed
 * @access Private
 * @returns {IUser[]}
 */
const getFollowed = async (followedUsers: [string]) => {
	try {
		const users = await User.find({ _id: { $in: followedUsers } });
		if (users.length === 0) {
			logger.info('No followed users');
			return {
				message: 'No followed users',
				status: 200,
			};
		}
		logger.info('Users found');
		return {
			message: 'Users found',
			users,
			status: 200,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
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
const stripePayment = async (
	card_number: string,
	exp_month: string,
	exp_year: string,
	cvc: string,
	user: any
) => {
	try {
		const paymentMethod = await stripe.paymentMethods.create({
			type: 'card',
			card: {
				number: card_number as string,
				exp_month: exp_month as string,
				exp_year: exp_year as string,
				cvc: cvc as string,
			} as any,
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
			return {
				message: 'Stripe payment succeeded',
				user: user.publicProfile(),
				status: 200,
			};
		}
		logger.info('Stripe payment failed');
		return {
			message: 'Stripe payment failed',
			status: 400,
		};
	} catch (error: any) {
		logger.error(error.message);
		return {
			message: error.message,
			status: 400,
		};
	}
};

export { getAll, getById, follow, unfollow, getFollowed, stripePayment };
