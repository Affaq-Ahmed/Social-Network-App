import mongoose from 'mongoose';
import { sign } from '../util/jwt';
import MongooseDelete from 'mongoose-delete';

enum roles {
	USER = 'USER',
	MODERATOR = 'MODERATOR',
}

interface IUser {
	_id?: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password: string;
	userRole?: roles;
	deleted?: boolean;
	paid?: boolean;
	paymentIntentId?: string;
	posts?: mongoose.Types.ObjectId[];
	followedUsers?: mongoose.Types.ObjectId[];
	tokens?: string[];
	generateAuthToken?: any;
	publicProfile?: any;
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		userRole: {
			type: String,
			required: true,
			trim: true,
			default: roles.USER,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
		paid: {
			type: Boolean,
			default: false,
		},
		paymentIntentId: {
			type: String,
			required: false,
			trim: true,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
		followedUsers: [
			{
				type: mongoose.Schema.Types.ObjectId,

				default: [],
			},
		],
	},
	{
		timestamps: true,
	}
);

/**
 * @returns {Object} - Returns a public profile of the user
 */
userSchema.methods.publicProfile = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

/**
 *
 * @returns {Object} - Returns a token for the user
 */
userSchema.methods.generateAuthToken = async function () {
	const option = {
		expiresIn: '1h',
	};
	const token = await sign(
		{ _id: this._id, userRole: this.userRole },
		process.env.JWT_SECRET as string,
		option
	);
	this.tokens = this.tokens.concat({ token });
	return this.save().then(() => token);
};

/**
 *
 * @param token - Token to be removed
 * @returns {Object} - Returns the user
 */
userSchema.methods.removeToken = function (token: string) {
	this.tokens = this.tokens.filter((t: any) => t.token !== token);
	return this.save();
};

userSchema.methods.removeAllTokens = function () {
	this.tokens = [];
	return this.save();
};

userSchema.plugin(MongooseDelete);

const User = mongoose.model<IUser>('User', userSchema);

export { User, IUser };
