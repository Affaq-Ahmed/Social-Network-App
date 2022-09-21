import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import MongoosePaginate from 'mongoose-paginate-v2';
import { IComment } from './comment';

interface IPost {
	_id?: mongoose.Types.ObjectId;
	title: string;
	content: string;
	createdBy: mongoose.Types.ObjectId;
	commentCount?: number;
	comments?: mongoose.Types.ObjectId[];
	likes?: mongoose.Types.ObjectId[];
	likesCount?: number;
	deleted?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const postSchema: mongoose.Schema<IPost> = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		commentCount: {
			type: Number,
			default: 0,
		},
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment',
				default: [],
			},
		],
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				default: [],
			},
		],
		likesCount: {
			type: Number,
			default: 0,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

postSchema.plugin(MongooseDelete);
postSchema.plugin(MongoosePaginate);

const Post = mongoose.model<IPost, mongoose.PaginateModel<IPost>>(
	'Post',
	postSchema
);

export { Post, IPost };
