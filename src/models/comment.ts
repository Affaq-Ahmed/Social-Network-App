import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import MongoosePaginate from 'mongoose-paginate-v2';

interface IComment {
	_id?: mongoose.Types.ObjectId;
	content: string;
	createdBy: mongoose.Types.ObjectId;
	postId: mongoose.Types.ObjectId;
	parentCommentId?: mongoose.Types.ObjectId;
	deleted?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const commentSchema: mongoose.Schema<IComment> = new mongoose.Schema(
	{
		content: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
			required: true,
		},
		parentCommentId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null,
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

commentSchema.plugin(MongooseDelete);
commentSchema.plugin(MongoosePaginate);

const Comment = mongoose.model<IComment, mongoose.PaginateModel<IComment>>(
	'Comment',
	commentSchema
);

export { Comment, IComment };
