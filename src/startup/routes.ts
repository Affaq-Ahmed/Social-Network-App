import express from 'express';
import authRoute from '../routes/auth';
import userRoute from '../routes/user';
import postRoute from '../routes/post';

/**
 * 
 * @param app 
 */
function gatherRoutes(app: express.Application) {
	app.use('/auth', authRoute);
	app.use('/user', userRoute);
	app.use('/post', postRoute);
}

export { gatherRoutes };
