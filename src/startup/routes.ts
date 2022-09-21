import express from 'express';
import authRoute from '../routes/auth';
import userRoute from '../routes/user';
import postRoute from '../routes/post';
import commentRoute from '../routes/comment';

/**
 *
 * @param app
 */
function gatherRoutes(app: express.Application) {
	app.use('/auth', authRoute);
	app.use('/user', userRoute);
	app.use('/post', postRoute);
	app.use('/comment', commentRoute);
}

export { gatherRoutes };
