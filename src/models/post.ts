import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';

interface IPost {
	_id?: mongoose.Types.ObjectId;
	title: string;
	content: string;
	createdBy: mongoose.Types.ObjectId;
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

export default mongoose.model<IPost>('Post', postSchema);
