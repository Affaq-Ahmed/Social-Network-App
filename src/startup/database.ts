import mongoose from 'mongoose';

function mongoConnection() {
	mongoose
		.connect(
			process.env.MONGODB_URI as string,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			} as mongoose.ConnectOptions
		)
		.then(() => {
			console.log('Connected to MongoDB');
		})
		.catch((err: any) => {
			console.log(err);
		});
}

export { mongoConnection };
